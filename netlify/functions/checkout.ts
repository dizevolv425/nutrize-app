import type { Handler, HandlerEvent } from "@netlify/functions";
import { getStripe } from "../lib/stripe.js";
import { getPriceId, type PlanId, type Period } from "../lib/plans.js";

/**
 * POST /api/checkout
 *
 * Body (JSON):
 *   {
 *     planId:  "starter" | "plus" | "advanced"
 *     period:  "monthly" | "yearly"
 *     userId:  string  // Firebase uid — vai como client_reference_id
 *     userEmail?: string  // opcional, pré-preenche o checkout
 *   }
 *
 * Resposta (200):
 *   { sessionId: string, url: string }
 *
 * Cria uma Stripe Checkout Session em modo "subscription" e devolve
 * sessionId + url. O frontend redireciona o usuário para `url` (ou
 * usa stripe.redirectToCheckout({ sessionId })).
 */
export const handler: Handler = async (event: HandlerEvent) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: corsHeaders(), body: "" };
  }
  if (event.httpMethod !== "POST") {
    return jsonResponse(405, { error: "Método não permitido" });
  }

  let body: {
    planId?: PlanId;
    period?: Period;
    userId?: string;
    userEmail?: string;
  };
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return jsonResponse(400, { error: "Body JSON inválido" });
  }

  const { planId, period, userId, userEmail } = body;
  if (!planId || !period || !userId) {
    return jsonResponse(400, {
      error: "Campos obrigatórios: planId, period, userId",
    });
  }

  try {
    const priceId = getPriceId(planId, period);
    const stripe = getStripe();

    const successUrl =
      process.env.STRIPE_SUCCESS_URL ||
      `${baseUrl(event)}/checkout/sucesso?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl =
      process.env.STRIPE_CANCEL_URL || `${baseUrl(event)}/assinatura`;

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      client_reference_id: userId,
      customer_email: userEmail,
      metadata: { userId, planId, period },
      subscription_data: {
        metadata: { userId, planId, period },
      },
      // allow_promotion_codes: true, // descomentar se quiser cupons
    });

    return jsonResponse(200, {
      sessionId: session.id,
      url: session.url,
    });
  } catch (err) {
    console.error("[checkout] erro ao criar Checkout Session:", err);
    return jsonResponse(500, {
      error: err instanceof Error ? err.message : "Erro ao iniciar checkout",
    });
  }
};

function baseUrl(event: HandlerEvent): string {
  const proto = event.headers["x-forwarded-proto"] || "https";
  const host = event.headers.host;
  return `${proto}://${host}`;
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

function jsonResponse(statusCode: number, body: unknown) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json", ...corsHeaders() },
    body: JSON.stringify(body),
  };
}
