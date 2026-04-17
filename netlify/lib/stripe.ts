import Stripe from "stripe";

/**
 * Instância do Stripe SDK usada pelas Netlify Functions.
 * Lança erro claro se STRIPE_SECRET_KEY não estiver definido no ambiente,
 * em vez de falhar em runtime durante uma chamada.
 */
function getStripe(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error(
      "STRIPE_SECRET_KEY não configurado. Defina em Netlify → Site Settings → Environment Variables (ou no .env local)."
    );
  }
  return new Stripe(secretKey, {
    // Sem apiVersion explícito: o SDK usa a versão da conta no painel Stripe.
    // Quando quiser pinar uma versão específica, adicione aqui.
    typescript: true,
  });
}

export { getStripe };
