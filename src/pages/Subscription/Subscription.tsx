import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaCheck,
  FaCreditCard,
  FaCrown,
  FaRocket,
  FaStar,
} from "react-icons/fa";
import { Button } from "../../components/ui/Button/Button";
import { paths } from "../../routes/paths";
import "./Subscription.css";

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  period: "monthly" | "yearly";
  features: string[];
  popular?: boolean;
  icon: React.ReactNode;
  color: string;
}

const plans: Plan[] = [
  {
    id: "basic",
    name: "Básico",
    description: "Ideal para começar",
    price: 49.9,
    period: "monthly",
    features: [
      "Até 50 clientes",
      "Agendamento de consultas",
      "Criação de dietas",
      "Base de alimentos TACO",
      "Dashboard básico",
      "Suporte por email",
    ],
    icon: <FaRocket />,
    color: "#3b82f6",
  },
  {
    id: "professional",
    name: "Profissional",
    description: "Para nutricionistas estabelecidos",
    price: 99.9,
    period: "monthly",
    features: [
      "Clientes ilimitados",
      "Agendamento de consultas",
      "Criação de dietas",
      "Base de alimentos TACO",
      "Dashboard completo",
      "Módulo financeiro",
      "Relatórios avançados",
      "Suporte prioritário",
    ],
    popular: true,
    icon: <FaStar />,
    color: "#e88413",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "Para clínicas e equipes",
    price: 199.9,
    period: "monthly",
    features: [
      "Clientes ilimitados",
      "Múltiplos nutricionistas",
      "Agendamento de consultas",
      "Criação de dietas",
      "Base de alimentos TACO",
      "Dashboard completo",
      "Módulo financeiro avançado",
      "Relatórios personalizados",
      "API de integração",
      "Suporte dedicado 24/7",
    ],
    icon: <FaCrown />,
    color: "#f59e0b",
  },
];

export const Subscription: React.FC = () => {
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState<"monthly" | "yearly">(
    "monthly"
  );

  const handleSelectPlan = (planId: string) => {
    // Redirecionar para página de checkout com o plano selecionado
    navigate(`${paths.checkout}?plan=${planId}&period=${selectedPeriod}`);
  };

  const getYearlyPrice = (monthlyPrice: number) => {
    // 20% de desconto no plano anual
    return monthlyPrice * 12 * 0.8;
  };

  return (
    <div className="subscription-page">
      <div className="subscription-page__container">
        <div className="subscription-page__header">
          <h1 className="subscription-page__title">Escolha seu Plano</h1>
          <p className="subscription-page__subtitle">
            Selecione o plano ideal para o seu negócio
          </p>

          <div className="subscription-page__period-toggle">
            <button
              className={`period-toggle__button ${
                selectedPeriod === "monthly" ? "active" : ""
              }`}
              onClick={() => setSelectedPeriod("monthly")}
            >
              Mensal
            </button>
            <button
              className={`period-toggle__button ${
                selectedPeriod === "yearly" ? "active" : ""
              }`}
              onClick={() => setSelectedPeriod("yearly")}
            >
              Anual
              <span className="period-toggle__badge">Economize 20%</span>
            </button>
          </div>
        </div>

        <div className="subscription-page__plans">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`plan-card ${plan.popular ? "plan-card--popular" : ""}`}
            >
              {plan.popular && (
                <div className="plan-card__badge">Mais Popular</div>
              )}
              <div className="plan-card__header">
                <div
                  className="plan-card__icon"
                  style={{ backgroundColor: `${plan.color}15`, color: plan.color }}
                >
                  {plan.icon}
                </div>
                <h3 className="plan-card__name">{plan.name}</h3>
                <p className="plan-card__description">{plan.description}</p>
              </div>

              <div className="plan-card__price">
                <span className="plan-card__currency">R$</span>
                <span className="plan-card__amount">
                  {selectedPeriod === "monthly"
                    ? plan.price.toFixed(2).replace(".", ",")
                    : getYearlyPrice(plan.price)
                        .toFixed(2)
                        .replace(".", ",")}
                </span>
                <span className="plan-card__period">
                  /{selectedPeriod === "monthly" ? "mês" : "ano"}
                </span>
              </div>

              {selectedPeriod === "yearly" && (
                <div className="plan-card__savings">
                  <FaCheck /> Economize R${" "}
                  {(plan.price * 12 - getYearlyPrice(plan.price))
                    .toFixed(2)
                    .replace(".", ",")}{" "}
                  por ano
                </div>
              )}

              <ul className="plan-card__features">
                {plan.features.map((feature, index) => (
                  <li key={index} className="plan-card__feature">
                    <FaCheck className="plan-card__feature-icon" />
                    <span>{feature}</span>
                  </li>
                ))}
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
          ))}
        </div>

        <div className="subscription-page__footer">
          <Button
            variant="ghost"
            onClick={() => navigate(paths.login)}
            className="subscription-page__back-button"
          >
            Voltar para Login
          </Button>
        </div>
      </div>
    </div>
  );
};

