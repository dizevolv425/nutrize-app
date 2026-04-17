import type { Handler, HandlerEvent } from "@netlify/functions";
import type Stripe from "stripe";
import { getStripe } from "../lib/stripe.js";
import { getAdminDb } from "../lib/firebase-admin.js";
import { getPlanFromPriceId } from "../lib/plans.js";
import { FieldValue } from "firebase-admin/firestore";

/**
 * POST /api/webhook/payment
 *
 * Endpoint que recebe eventos do Stripe. Valida a assinatura via
 * STRIPE_WEBHOOK_SECRET e atualiza user.plan / user.planPeriod no
 * Firestore de acordo com o ciclo da assinatura.
 *
 * Eventos tratados:
 *   - checkout.session.completed       → ativa o plano no primeiro pagamento.
 *   - customer.subscription.updated    → upgrade/downgrade/renovação.
 *   - customer.subscription.deleted    → cancelamento.
 *   - invoice.payment_failed           → registra falha (não cancela sozinho;
 *                                        Stripe tem sua própria retry policy).
 *
 * Como mapear Stripe → Firebase:
 *   O checkout é criado com client_reference_id = user.uid e metadata.userId.
 *   Nos eventos de subscription, o userId vem em subscription.metadata.userId.
 */
export const handler: Handler = async (event: HandlerEvent) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Método não permitido" };
  }

  const signature = event.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !webhookSecret) {
    console.error("[stripe-webhook] signature ou webhook secret ausente");
    return { statusCode: 400, body: "Assinatura ausente" };
  }

  let stripeEvent: Stripe.Event;
  try {
    const stripe = getStripe();
    stripeEvent = stripe.webhooks.constructEvent(
      event.body || "",
      signature,
      webhookSecret
    );
  } catch (err) {
    console.error("[stripe-webhook] assinatura inválida:", err);
    return {
      statusCode: 400,
      body: `Webhook signature inválida: ${
        err instanceof Error ? err.message : "erro desconhecido"
      }`,
    };
  }

  try {
    switch (stripeEvent.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(
          stripeEvent.data.object as Stripe.Checkout.Session
        );
        break;

      case "customer.subscription.updated":
        await handleSubscriptionUpdated(
          stripeEvent.data.object as Stripe.Subscription
        );
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(
          stripeEvent.data.object as Stripe.Subscription
        );
        break;

      case "invoice.payment_failed":
        await handlePaymentFailed(
          stripeEvent.data.object as Stripe.Invoice
        );
        break;

      default:
        // Evento não tratado — retornamos 200 para o Stripe não tentar de novo.
        console.log(`[stripe-webhook] evento ignorado: ${stripeEvent.type}`);
    }

    return { statusCode: 200, body: JSON.stringify({ received: true }) };
  } catch (err) {
    console.error(
      `[stripe-webhook] erro ao processar evento ${stripeEvent.type}:`,
      err
    );
    // Retornar 500 faz o Stripe tentar reenviar (retry automático).
    return { statusCode: 500, body: "Erro ao processar evento" };
  }
};

/**
 * Helper: referência ao doc de billing do usuário (users/{uid}/billing/current).
 * Isola dados sensíveis do Stripe do doc principal, que tem leitura ampla.
 */
function billingRef(userId: string) {
  return getAdminDb().collection("users").doc(userId).collection("billing").doc("current");
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId =
    session.client_reference_id ||
    (session.metadata?.userId as string | undefined);
  if (!userId) {
    console.warn("[stripe-webhook] checkout.session.completed sem userId");
    return;
  }

  const planId = session.metadata?.planId as
    | "starter"
    | "plus"
    | "advanced"
    | undefined;
  const period = session.metadata?.period as "monthly" | "yearly" | undefined;
  if (!planId || !period) {
    console.warn(
      "[stripe-webhook] checkout.session.completed sem planId/period no metadata"
    );
    return;
  }

  const db = getAdminDb();
  const userRef = db.collection("users").doc(userId);

  // Doc principal: só o que o front precisa ler para liberar features.
  await userRef.update({
    plan: planId,
    planPeriod: period,
    planActivatedAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  // Subcoleção billing: dados sensíveis do Stripe, leitura restrita ao owner.
  await billingRef(userId).set(
    {
      stripeCustomerId: session.customer,
      stripeSubscriptionId: session.subscription,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId as string | undefined;
  if (!userId) {
    console.warn("[stripe-webhook] subscription.updated sem userId no metadata");
    return;
  }

  const priceId = subscription.items.data[0]?.price.id;
  if (!priceId) {
    console.warn("[stripe-webhook] subscription.updated sem priceId");
    return;
  }

  const mapped = getPlanFromPriceId(priceId);
  if (!mapped) {
    console.warn(
      `[stripe-webhook] priceId desconhecido ${priceId} — plano não atualizado`
    );
    return;
  }

  const db = getAdminDb();
  await db.collection("users").doc(userId).update({
    plan: mapped.plan,
    planPeriod: mapped.period,
    updatedAt: FieldValue.serverTimestamp(),
  });

  await billingRef(userId).set(
    {
      stripeSubscriptionStatus: subscription.status,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId as string | undefined;
  if (!userId) return;

  const db = getAdminDb();

  // Downgrade: volta ao estado sem plano ativo. O front trata ausência
  // de plan como "trial/free" (ver useTrial).
  await db.collection("users").doc(userId).update({
    plan: FieldValue.delete(),
    planPeriod: FieldValue.delete(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  await billingRef(userId).set(
    {
      stripeSubscriptionStatus: "canceled",
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  // Em versões recentes do Stripe SDK o campo subscription foi reorganizado
  // (parent.subscription_details). Fazemos narrow via unknown para aceitar
  // tanto o shape antigo (invoice.subscription) quanto o novo.
  const raw = invoice as unknown as {
    subscription?: string | { id?: string };
    parent?: { subscription_details?: { subscription?: string } };
  };
  const subscriptionId =
    typeof raw.subscription === "string"
      ? raw.subscription
      : raw.subscription?.id ||
        raw.parent?.subscription_details?.subscription ||
        undefined;
  if (!subscriptionId) return;

  // Busca a subscription para obter o userId do metadata.
  const stripe = getStripe();
  const sub = await stripe.subscriptions.retrieve(subscriptionId);
  const userId = sub.metadata?.userId as string | undefined;
  if (!userId) return;

  await billingRef(userId).set(
    {
      lastPaymentFailedAt: FieldValue.serverTimestamp(),
      stripeSubscriptionStatus: sub.status,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );
}
