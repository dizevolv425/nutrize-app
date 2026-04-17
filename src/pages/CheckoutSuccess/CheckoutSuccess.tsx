import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  FaCheckCircle,
  FaArrowRight,
  FaRocket,
  FaStar,
  FaCrown,
  FaSpinner,
  FaExclamationTriangle,
} from "react-icons/fa";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../lib/firebaseconfig";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../../components/ui/Button/Button";
import { paths } from "../../routes/paths";
import type { User } from "../../types/user";
import "./CheckoutSuccess.css";

type PlanId = "starter" | "plus" | "advanced";
type Period = "monthly" | "yearly";

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

// Aguarda até 30s pelo webhook do Stripe atualizar user.plan no Firestore.
const WEBHOOK_TIMEOUT_MS = 30_000;

/**
 * Tela de confirmação pós-checkout.
 *
 * Em produção, o plano é ativado server-side pelo webhook
 * /api/webhook/payment ao processar checkout.session.completed.
 * Esta tela NÃO grava nada no Firestore — apenas observa o doc
 * do usuário via onSnapshot e confirma visualmente quando o
 * webhook chegou.
 *
 * Se o webhook demorar mais de 30s, exibe fallback pedindo que
 * o usuário atualize a página — o plano eventualmente aparecerá.
 */
export const CheckoutSuccess: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, reloadUser } = useAuth();

  const planIdParam = (searchParams.get("plan") || "plus") as PlanId;
  const period = (searchParams.get("period") || "monthly") as Period;

  const planName = planNames[planIdParam] || "Plus";
  const planIcon = planIcons[planIdParam] || <FaStar />;
  const features = planFeatures[planIdParam] || planFeatures.plus;

  // "waiting" enquanto webhook não chegou; "ready" após observar plan
  // no Firestore; "timeout" após 30s sem sinal.
  const [status, setStatus] = useState<"waiting" | "ready" | "timeout">(
    "waiting"
  );

  useEffect(() => {
    if (!user?.uid) return;

    // Captura o plano inicial — só consideramos "pronto" quando o
    // Firestore refletir um plano diferente ou um planActivatedAt novo.
    const initialPlan = user.plan;
    const initialActivatedAt =
      user.planActivatedAt instanceof Date
        ? user.planActivatedAt.getTime()
        : 0;

    let settled = false;

    const unsubscribe = onSnapshot(
      doc(db, "users", user.uid),
      (snap) => {
        if (settled) return;
        const data = snap.data();
        if (!data) return;

        const newPlan = data.plan as PlanId | undefined;
        const activatedTs = data.planActivatedAt?.toDate
          ? (data.planActivatedAt.toDate() as Date).getTime()
          : 0;

        const planChanged = !!newPlan && newPlan !== initialPlan;
        const activatedAfterMount =
          activatedTs > 0 && activatedTs > initialActivatedAt;

        if (planChanged || activatedAfterMount) {
          settled = true;
          // Propaga os dados atualizados para o AuthContext.
          reloadUser({
            ...user,
            plan: newPlan,
            planPeriod: data.planPeriod as Period | undefined,
            planActivatedAt: activatedTs ? new Date(activatedTs) : undefined,
          } as User);
          setStatus("ready");
        }
      },
      (err) => {
        console.error("[CheckoutSuccess] onSnapshot error:", err);
      }
    );

    const timeoutId = window.setTimeout(() => {
      if (!settled) {
        settled = true;
        setStatus("timeout");
      }
    }, WEBHOOK_TIMEOUT_MS);

    return () => {
      unsubscribe();
      window.clearTimeout(timeoutId);
    };
    // Depende apenas de user.uid. reloadUser é estável vindo do contexto.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  // Redirect para dashboard 5s após ready.
  useEffect(() => {
    if (status !== "ready") return;
    const timer = window.setTimeout(() => {
      navigate(paths.dashboard);
    }, 5000);
    return () => window.clearTimeout(timer);
  }, [status, navigate]);

  return (
    <div className="checkout-success-page">
      <div className="checkout-success-page__container">
        {status === "waiting" && (
          <>
            <div className="checkout-success-page__icon checkout-success-page__icon--waiting">
              <FaSpinner className="checkout-success-page__spinner" />
            </div>
            <h1 className="checkout-success-page__title">
              Confirmando seu pagamento...
            </h1>
            <p className="checkout-success-page__message">
              Seu pagamento foi recebido. Estamos confirmando a ativação do
              plano <strong>{planName}</strong> — isso costuma levar alguns
              segundos.
            </p>
          </>
        )}

        {status === "ready" && (
          <>
            <div className="checkout-success-page__icon">
              <FaCheckCircle />
            </div>
            <h1 className="checkout-success-page__title">
              Assinatura Confirmada!
            </h1>
            <p className="checkout-success-page__message">
              Sua assinatura do plano <strong>{planName}</strong> foi ativada
              com sucesso.
            </p>

            <div className="checkout-success-page__plan-info">
              <div className="checkout-success-plan">
                <div className="checkout-success-plan__icon">{planIcon}</div>
                <div>
                  <h3 className="checkout-success-plan__name">
                    Plano {planName}
                  </h3>
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
          </>
        )}

        {status === "timeout" && (
          <>
            <div className="checkout-success-page__icon checkout-success-page__icon--warning">
              <FaExclamationTriangle />
            </div>
            <h1 className="checkout-success-page__title">
              Pagamento em processamento
            </h1>
            <p className="checkout-success-page__message">
              Seu pagamento foi recebido, mas a ativação do plano{" "}
              <strong>{planName}</strong> está demorando mais que o esperado.
              O sistema Stripe pode levar alguns minutos em casos raros.
            </p>
            <p className="checkout-success-page__message">
              <strong>
                Atualize a página em alguns minutos para ver seu plano ativo.
              </strong>{" "}
              Se o problema persistir após 10 minutos, entre em contato com o
              suporte — seu pagamento está seguro.
            </p>
          </>
        )}

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

        {status === "ready" && (
          <p className="checkout-success-page__redirect">
            Você será redirecionado automaticamente em alguns segundos...
          </p>
        )}
      </div>
    </div>
  );
};
