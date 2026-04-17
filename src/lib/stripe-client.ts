import { loadStripe, type Stripe } from "@stripe/stripe-js";

let stripePromise: Promise<Stripe | null> | null = null;

/**
 * Singleton do Stripe no cliente (@stripe/stripe-js).
 * Hoje não usamos o SDK para redirecionar ao checkout — a abordagem
 * recomendada pelo Stripe atualmente é redirecionar para session.url.
 * Mantemos o loadStripe exportado para features futuras que realmente
 * precisam do objeto Stripe no cliente:
 *   - Stripe Elements (Payment Element) se implementarmos checkout
 *     embarcado em vez do hosted.
 *   - Customer Portal redirect via Session.
 *   - 3DS confirmation flows.
 *
 * Lança erro claro se a chave não estiver definida no build.
 */
export function getStripe(): Promise<Stripe | null> {
  if (!stripePromise) {
    const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
    if (!key) {
      throw new Error(
        "VITE_STRIPE_PUBLISHABLE_KEY não configurado. Adicione ao .env."
      );
    }
    stripePromise = loadStripe(key);
  }
  return stripePromise;
}

export interface CheckoutRequest {
  planId: "starter" | "plus" | "advanced";
  period: "monthly" | "yearly";
  userId: string;
  userEmail?: string;
}

interface CheckoutResponse {
  sessionId: string;
  url: string;
}

/**
 * Chama /api/checkout para criar uma Stripe Checkout Session e
 * redireciona o usuário para a URL hospedada pelo Stripe.
 */
export async function redirectToCheckout(req: CheckoutRequest): Promise<void> {
  const response = await fetch("/api/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(
      body.error || `Falha ao iniciar checkout (${response.status})`
    );
  }

  const data: CheckoutResponse = await response.json();
  if (!data.url) {
    throw new Error("Checkout Session retornou sem URL");
  }

  window.location.href = data.url;
}
