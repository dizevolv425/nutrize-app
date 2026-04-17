import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaCheck, FaCreditCard, FaCrown, FaRocket, FaStar, FaSpinner } from "react-icons/fa";
import { Button } from "../../components/ui/Button/Button";
import { paths } from "../../routes/paths";
import { useAuth } from "../../hooks/useAuth";
import { redirectToCheckout } from "../../lib/stripe-client";
import "./Subscription.css";

type PlanId = "starter" | "plus" | "advanced";
type Period = "monthly" | "yearly";

interface PlanFeature {
  label: string;
  starter: boolean;
  plus: boolean;
  advanced: boolean;
}

interface PlanConfig {
  id: PlanId;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyTotal: number;
  yearlyMonthly: number; // preço mensal equivalente no plano anual
  popular?: boolean;
  icon: React.ReactNode;
}

const PLANS: PlanConfig[] = [
  {
    id: "starter",
    name: "Starter",
    description: "Ideal para começar",
    monthlyPrice: 69.9,
    yearlyTotal: 671.0,
    yearlyMonthly: 55.92,
    icon: <FaRocket />,
  },
  {
    id: "plus",
    name: "Plus",
    description: "Para nutricionistas em crescimento",
    monthlyPrice: 99.9,
    yearlyTotal: 959.04,
    yearlyMonthly: 79.92,
    popular: true,
    icon: <FaStar />,
  },
  {
    id: "advanced",
    name: "Advanced",
    description: "Para clínicas e equipes",
    monthlyPrice: 169.9,
    yearlyTotal: 1535.04,
    yearlyMonthly: 127.92,
    icon: <FaCrown />,
  },
];

const FEATURES: PlanFeature[] = [
  { label: "Até 30 pacientes",         starter: true,  plus: false, advanced: false },
  { label: "Pacientes ilimitados",      starter: false, plus: true,  advanced: true  },
  { label: "Agendamento de consultas",  starter: true,  plus: true,  advanced: true  },
  { label: "Criação de dietas",         starter: true,  plus: true,  advanced: true  },
  { label: "Base de alimentos completa",starter: true,  plus: true,  advanced: true  },
  { label: "Usuário secretaria",        starter: false, plus: true,  advanced: true  },
  { label: "2 nutricionistas na conta", starter: false, plus: false, advanced: true  },
];

function fmt(value: number): string {
  return value.toFixed(2).replace(".", ",");
}

function yearlySavings(plan: PlanConfig): number {
  return plan.monthlyPrice * 12 - plan.yearlyTotal;
}

export const Subscription: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [period, setPeriod] = useState<Period>("monthly");
  const [loadingPlan, setLoadingPlan] = useState<PlanId | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSelectPlan = async (planId: PlanId) => {
    setError(null);

    if (!user?.uid) {
      setError("Você precisa estar logado para assinar um plano.");
      return;
    }

    setLoadingPlan(planId);
    try {
      await redirectToCheckout({
        planId,
        period,
        userId: user.uid,
        userEmail: user.email,
      });
      // Após redirectToCheckout, o usuário sai desta página; o bloco
      // abaixo só roda se o redirect falhar antes de navegar.
    } catch (err) {
      console.error("Erro ao iniciar checkout:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Erro ao iniciar checkout. Tente novamente."
      );
      setLoadingPlan(null);
    }
  };

  return (
    <div className="subscription-page">
      <div className="subscription-page__container">

        {/* Header */}
        <div className="subscription-page__header">
          <h1 className="subscription-page__title">Escolha seu Plano</h1>
          <p className="subscription-page__subtitle">
            Selecione o plano ideal para o seu negócio e comece a usar hoje mesmo.
          </p>

          {error && (
            <div className="subscription-page__error" role="alert">
              {error}
            </div>
          )}

          {/* Toggle Mensal / Anual */}
          <div className="subscription-page__period-toggle">
            <button
              className={`period-toggle__button ${period === "monthly" ? "active" : ""}`}
              onClick={() => setPeriod("monthly")}
            >
              Mensal
            </button>
            <button
              className={`period-toggle__button ${period === "yearly" ? "active" : ""}`}
              onClick={() => setPeriod("yearly")}
            >
              Anual
              <span className="period-toggle__badge">Economize até 20%</span>
            </button>
          </div>
        </div>

        {/* Cards de planos */}
        <div className="subscription-page__plans">
          {PLANS.map((plan) => {
            const displayPrice =
              period === "monthly" ? plan.monthlyPrice : plan.yearlyMonthly;
            const savings = yearlySavings(plan);

            return (
              <div
                key={plan.id}
                className={`plan-card ${plan.popular ? "plan-card--popular" : ""}`}
              >
                {plan.popular && (
                  <div className="plan-card__badge">Mais Popular</div>
                )}

                <div className="plan-card__header">
                  <div className="plan-card__icon">{plan.icon}</div>
                  <h3 className="plan-card__name">{plan.name}</h3>
                  <p className="plan-card__description">{plan.description}</p>
                </div>

                <div className="plan-card__price">
                  <div className="plan-card__price-main">
                    <span className="plan-card__currency">R$</span>
                    <span className="plan-card__amount">{fmt(displayPrice)}</span>
                    <span className="plan-card__period">/mês</span>
                  </div>
                  {period === "yearly" && (
                    <div className="plan-card__price-note">
                      cobrado R$ {fmt(plan.yearlyTotal)}/ano
                    </div>
                  )}
                </div>

                {period === "yearly" && (
                  <div className="plan-card__savings">
                    <FaCheck /> Economize R$ {fmt(savings)} por ano
                  </div>
                )}

                <ul className="plan-card__features">
                  {FEATURES.filter((feature) => feature[plan.id]).map((feature) => (
                    <li key={feature.label} className="plan-card__feature">
                      <FaCheck className="plan-card__feature-icon plan-card__feature-icon--check" />
                      <span>{feature.label}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant={plan.popular ? "primary" : "secondary"}
                  fullWidth
                  onClick={() => handleSelectPlan(plan.id)}
                  disabled={loadingPlan !== null}
                  className="plan-card__button"
                >
                  {loadingPlan === plan.id ? (
                    <>
                      <FaSpinner className="plan-card__spinner" /> Redirecionando...
                    </>
                  ) : (
                    <>
                      <FaCreditCard /> Assinar Agora
                    </>
                  )}
                </Button>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="subscription-page__footer">
          <Button
            variant="ghost"
            onClick={() => navigate(paths.dashboard)}
            className="subscription-page__back-button"
          >
            Voltar para Home
          </Button>
        </div>
      </div>
    </div>
  );
};
