import React from "react";
import { useNavigate } from "react-router-dom";
import { FaExclamationTriangle, FaCreditCard } from "react-icons/fa";
import { Button } from "../../components/ui/Button/Button";
import { paths } from "../../routes/paths";
import "./TrialExpired.css";

export const TrialExpired: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="trial-expired">
      <div className="trial-expired__container">
        <div className="trial-expired__icon">
          <FaExclamationTriangle size={64} />
        </div>
        <h1 className="trial-expired__title">Período de Trial Expirado</h1>
        <p className="trial-expired__message">
          Seu período de teste de 10 dias chegou ao fim. Para continuar usando
          o Nutrize, é necessário assinar um plano.
        </p>
        <div className="trial-expired__actions">
          <Button
            variant="primary"
            onClick={() => {
              navigate(paths.subscription);
            }}
          >
            <FaCreditCard /> Assinar Plano
          </Button>
          <Button
            variant="secondary"
            onClick={() => navigate(paths.login)}
          >
            Voltar para Login
          </Button>
        </div>
      </div>
    </div>
  );
};

