/**
 * Mapa (planId, period) → STRIPE_PRICE_ID_<PLAN>_<PERIOD> no ambiente.
 * Os 6 price_ids são criados no painel do Stripe (3 produtos × 2 preços).
 * Ver docs/stripe-setup.md para o passo-a-passo.
 */

export type PlanId = "starter" | "plus" | "advanced";
export type Period = "monthly" | "yearly";

export function getPriceId(plan: PlanId, period: Period): string {
  const key = `STRIPE_PRICE_ID_${plan.toUpperCase()}_${period.toUpperCase()}`;
  const value = process.env[key];
  if (!value) {
    throw new Error(
      `${key} não configurado. Crie o price no Stripe e adicione ao ambiente.`
    );
  }
  return value;
}

/**
 * Dado um Stripe Price ID, retorna o plano correspondente no sistema.
 * Usado pelo webhook para mapear o que o cliente comprou de volta para
 * user.plan no Firestore.
 */
export function getPlanFromPriceId(priceId: string): {
  plan: PlanId;
  period: Period;
} | null {
  const plans: PlanId[] = ["starter", "plus", "advanced"];
  const periods: Period[] = ["monthly", "yearly"];
  for (const plan of plans) {
    for (const period of periods) {
      const envKey = `STRIPE_PRICE_ID_${plan.toUpperCase()}_${period.toUpperCase()}`;
      if (process.env[envKey] === priceId) {
        return { plan, period };
      }
    }
  }
  return null;
}
