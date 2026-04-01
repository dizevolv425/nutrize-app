import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaExclamationTriangle, FaTimes, FaCreditCard } from "react-icons/fa";
import { Button } from "../Button/Button";
import { useTrial } from "../../../hooks/useTrial";
import { useAuth } from "../../../hooks/useAuth";
import { paths } from "../../../routes/paths";
import "./TrialWarningModal.css";

interface TrialWarningModalProps {
  onClose?: () => void;
}

export const TrialWarningModal: React.FC<TrialWarningModalProps> = ({ onClose }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { shouldShowWarning, daysRemaining, trialEndDate } = useTrial();
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [shouldShow, setShouldShow] = useState(true);

  // Verificar se o usuário já optou por não mostrar mais
  useEffect(() => {
    if (user?.uid && shouldShowWarning) {
      const dontShowKey = `trial-warning-dont-show-${user.uid}`;
      const shouldNotShow = localStorage.getItem(dontShowKey) === "true";
      if (shouldNotShow) {
        setShouldShow(false);
        if (onClose) {
          onClose();
        }
      }
    }
  }, [user, shouldShowWarning, onClose]);

  // Não mostrar se não deve mostrar aviso ou se o usuário optou por não mostrar mais
  if (!shouldShowWarning || !shouldShow) {
    return null;
  }

  const formatDate = (date: Date | null) => {
    if (!date) return "";
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  };

  const getMessage = () => {
    if (daysRemaining === null) return "";
    
    if (daysRemaining === 0) {
      return "Seu período de trial expira hoje!";
    } else if (daysRemaining === 1) {
      return "Seu período de trial expira amanhã!";
    } else {
      return `Seu período de trial expira em ${daysRemaining} dias`;
    }
  };

  const handleClose = () => {
    if (user?.uid) {
      // Se o usuário marcou "não mostrar mais", salvar no localStorage (permanente)
      if (dontShowAgain) {
        const dontShowKey = `trial-warning-dont-show-${user.uid}`;
        localStorage.setItem(dontShowKey, "true");
      } else {
        // Se apenas fechou sem marcar, salvar no sessionStorage (apenas esta sessão)
        const sessionDismissedKey = `trial-warning-dismissed-${user.uid}`;
        sessionStorage.setItem(sessionDismissedKey, "true");
      }
    }
    if (onClose) {
      onClose();
    }
  };

  const handleAssinar = () => {
    navigate(paths.subscription);
    handleClose();
  };

  return (
    <div className="trial-warning-modal-overlay" onClick={handleClose}>
      <div className="trial-warning-modal" onClick={(e) => e.stopPropagation()}>
        <button
          className="trial-warning-modal__close"
          onClick={handleClose}
          aria-label="Fechar aviso"
        >
          <FaTimes />
        </button>
        
        <div className="trial-warning-modal__icon">
          <FaExclamationTriangle size={64} />
        </div>
        
        <h2 className="trial-warning-modal__title">
          {getMessage()}
        </h2>
        
        <p className="trial-warning-modal__message">
          Para continuar usando todas as funcionalidades do Nutrize após o término do período de trial,
          é necessário assinar um plano.
        </p>
        
        {trialEndDate && (
          <div className="trial-warning-modal__info">
            <p>
              <strong>Data de expiração:</strong> {formatDate(trialEndDate)}
            </p>
            {daysRemaining !== null && daysRemaining > 0 && (
              <p>
                <strong>Dias restantes:</strong> {daysRemaining} dia{daysRemaining !== 1 ? "s" : ""}
              </p>
            )}
          </div>
        )}
        
        <div className="trial-warning-modal__dont-show">
          <label className="trial-warning-modal__checkbox-label">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="trial-warning-modal__checkbox"
            />
            <span>Não mostrar mais este aviso</span>
          </label>
        </div>
        
        <div className="trial-warning-modal__actions">
          <Button variant="primary" onClick={handleAssinar}>
            <FaCreditCard /> Assinar Plano
          </Button>
          <Button variant="secondary" onClick={handleClose}>
            Entendido
          </Button>
        </div>
      </div>
    </div>
  );
};

