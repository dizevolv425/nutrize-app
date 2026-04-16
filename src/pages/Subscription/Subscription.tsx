import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaCheck, FaTimes, FaCreditCard, FaCrown, FaRocket, FaStar } from "react-icons/fa";
import { Button } from "../../components/ui/Button/Button";
import { paths } from "../../routes/paths";
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
  const [period, setPeriod] = useState<Period>("monthly");

  const handleSelectPlan = (planId: PlanId) => {
    navigate(`${paths.checkout}?plan=${planId}&period=${period}`);
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
                  {FEATURES.map((feature) => {
                    const included = feature[plan.id];
                    return (
                      <li
                        key={feature.label}
                        className={`plan-card__feature ${!included ? "plan-card__feature--excluded" : ""}`}
                      >
                        {included ? (
                          <FaCheck className="plan-card__feature-icon plan-card__feature-icon--check" />
                        ) : (
                          <FaTimes className="plan-card__feature-icon plan-card__feature-icon--times" />
                        )}
                        <span>{feature.label}</span>
                      </li>
                    );
                  })}
                </ul>

                <Button
                  variant={plan.popular ? "primary" : "secondary"}
                  fullWidth
                  onClick={() => handleSelectPlan(plan.id)}
                  className="plan-card__button"
                >
                  <FaCreditCard /> Assinar Agora
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
