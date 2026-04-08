import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FaCheckCircle, FaArrowRight, FaRocket, FaStar, FaCrown } from "react-icons/fa";
import { doc, updateDoc, Timestamp } from "firebase/firestore";
import { db } from "../../lib/firebaseconfig";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../../components/ui/Button/Button";
import { paths } from "../../routes/paths";
import "./CheckoutSuccess.css";

const planIcons: Record<string, React.ReactNode> = {
  starter: <FaRocket />,
  plus: <FaStar />,
  advanced: <FaCrown />,
};

const planNames: Record<string, string> = {
  starter: "Starter",
  plus: "Plus",
  advanced: "Advanced",
};

const planFeatures: Record<string, string[]> = {
  starter: [
    "Até 30 pacientes",
    "Agendamento de consultas",
    "Criação de dietas",
    "Base de alimentos completa",
  ],
  plus: [
    "Pacientes ilimitados",
    "Agendamento de consultas",
    "Criação de dietas",
    "Base de alimentos completa",
    "Usuário secretaria",
  ],
  advanced: [
    "Pacientes ilimitados",
    "Agendamento de consultas",
    "Criação de dietas",
    "Base de alimentos completa",
    "Usuário secretaria",
    "2 nutricionistas na conta",
  ],
};

export const CheckoutSuccess: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, reloadUser } = useAuth();

  const planId = searchParams.get("plan") || "plus";
  const period = (searchParams.get("period") || "monthly") as "monthly" | "yearly";

  const planName = planNames[planId] || "Plus";
  const planIcon = planIcons[planId] || <FaStar />;
  const features = planFeatures[planId] || planFeatures.plus;

  const [planSaved, setPlanSaved] = useState(false);

  // Salvar o plano no Firestore assim que a página carregar
  useEffect(() => {
    const savePlan = async () => {
      if (!user?.uid || planSaved) return;
      try {
        await updateDoc(doc(db, "users", user.uid), {
          plan: planId,
          planPeriod: period,
          planActivatedAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });
        setPlanSaved(true);
        // Atualizar o contexto com o plano ativo
        if (reloadUser && user) {
          reloadUser({
            ...user,
            plan: planId as "starter" | "plus" | "advanced",
            planPeriod: period,
            planActivatedAt: new Date(),
          });
        }
      } catch (err) {
        console.error("Erro ao salvar plano:", err);
      }
    };

    savePlan();
  }, [user?.uid, planId, period, planSaved, reloadUser]);

  // Redirecionar para dashboard após 10 segundos
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate(paths.dashboard);
    }, 10000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="checkout-success-page">
      <div className="checkout-success-page__container">
        <div className="checkout-success-page__icon">
          <FaCheckCircle />
        </div>
        <h1 className="checkout-success-page__title">Assinatura Confirmada!</h1>
        <p className="checkout-success-page__message">
          Sua assinatura do plano <strong>{planName}</strong> foi ativada com
          sucesso.
        </p>

        <div className="checkout-success-page__plan-info">
          <div className="checkout-success-plan">
            <div className="checkout-success-plan__icon">{planIcon}</div>
            <div>
              <h3 className="checkout-success-plan__name">Plano {planName}</h3>
              <p className="checkout-success-plan__period">
                Período: {period === "monthly" ? "Mensal" : "Anual"}
              </p>
            </div>
          </div>
        </div>

        <div className="checkout-success-page__features">
          <h3 className="checkout-success-page__features-title">
            O que você tem acesso agora:
          </h3>
          <ul className="checkout-success-page__features-list">
            {features.map((feature) => (
              <li key={feature}>✅ {feature}</li>
            ))}
          </ul>
        </div>

        <div className="checkout-success-page__actions">
          <Button
            variant="primary"
            onClick={() => navigate(paths.dashboard)}
            className="checkout-success-page__button"
          >
            Ir para Dashboard <FaArrowRight />
          </Button>
          <Button
            variant="ghost"
            onClick={() => navigate(paths.subscription)}
            className="checkout-success-page__button"
          >
            Ver Meu Plano
          </Button>
        </div>

        <p className="checkout-success-page__redirect">
          Você será redirecionado automaticamente em alguns segundos...
        </p>
      </div>
    </div>
  );
};
