import React, { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { authService } from "../../services/authService";
import { paths } from "../../routes/paths";
import { FaUserCircle, FaEnvelope, FaPhone, FaCalendarAlt, FaTrash, FaExclamationTriangle } from "react-icons/fa";
import "./Profile.css";

export const Profile: React.FC = () => {
  const { user, logOut } = useAuth();
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const formatDate = (date: Date | undefined): string => {
    if (!date) return "Não informado";
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(date));
  };

  const formatRole = (role: string | undefined): string => {
    switch (role) {
      case "admin":
        return "Administrador";
      case "nutritionist":
        return "Nutricionista";
      case "secretary":
        return "Secretária";
      case "user":
        return "Paciente";
      default:
        return "Não informado";
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;

    setIsDeleting(true);
    try {
      await authService.deleteAccount();
      await logOut();
      navigate(paths.login);
    } catch (error) {
      console.error("Erro ao deletar conta:", error);
      alert("Erro ao deletar conta. Tente novamente.");
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (!user) {
    return (
      <div className="profile">
        <div className="profile__container">
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile">
      <div className="profile__container">
        <div className="profile__header">
          <div className="profile__avatar">
            <FaUserCircle size={80} />
          </div>
          <h1 className="profile__title">Meu Perfil</h1>
        </div>

        <div className="profile__content">
          <div className="profile__section">
            <h2 className="profile__section-title">Informações Pessoais</h2>
            <div className="profile__info-grid">
              <div className="profile__info-item">
                <div className="profile__info-label">
                  <FaUserCircle size={16} />
                  <span>Nome</span>
                </div>
                <div className="profile__info-value">{user.name || "Não informado"}</div>
              </div>

              <div className="profile__info-item">
                <div className="profile__info-label">
                  <FaEnvelope size={16} />
                  <span>Email</span>
                </div>
                <div className="profile__info-value">{user.email || "Não informado"}</div>
              </div>

              <div className="profile__info-item">
                <div className="profile__info-label">
                  <FaPhone size={16} />
                  <span>Telefone</span>
                </div>
                <div className="profile__info-value">{user.phone || "Não informado"}</div>
              </div>

              <div className="profile__info-item">
                <div className="profile__info-label">
                  <FaUserCircle size={16} />
                  <span>Perfil</span>
                </div>
                <div className="profile__info-value">{formatRole(user.role)}</div>
              </div>
            </div>
          </div>

          <div className="profile__section">
            <h2 className="profile__section-title">Informações da Conta</h2>
            <div className="profile__info-grid">
              <div className="profile__info-item">
                <div className="profile__info-label">
                  <FaCalendarAlt size={16} />
                  <span>Conta criada em</span>
                </div>
                <div className="profile__info-value">{formatDate(user.createdAt)}</div>
              </div>

              <div className="profile__info-item">
                <div className="profile__info-label">
                  <FaCalendarAlt size={16} />
                  <span>Última atualização</span>
                </div>
                <div className="profile__info-value">{formatDate(user.updatedAt)}</div>
              </div>
            </div>
          </div>

          {user.trialEndDate && (
            <div className="profile__section">
              <h2 className="profile__section-title">Trial</h2>
              <div className="profile__info-grid">
                <div className="profile__info-item">
                  <div className="profile__info-label">
                    <FaCalendarAlt size={16} />
                    <span>Data de término do trial</span>
                  </div>
                  <div className="profile__info-value">{formatDate(user.trialEndDate)}</div>
                </div>
              </div>
            </div>
          )}

          <div className="profile__section profile__section--danger">
            <h2 className="profile__section-title profile__section-title--danger">Zona de Perigo</h2>
            <div className="profile__danger-content">
              <div className="profile__danger-warning">
                <FaExclamationTriangle size={20} />
                <p>
                  Ao deletar sua conta, todos os seus dados serão permanentemente removidos e não poderão ser recuperados.
                  Esta ação é irreversível.
                </p>
              </div>
              <button
                className="profile__delete-btn"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isDeleting}
              >
                <FaTrash size={16} />
                <span>{isDeleting ? "Deletando..." : "Deletar Conta"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="profile__modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="profile__modal" onClick={(e) => e.stopPropagation()}>
            <div className="profile__modal-header">
              <FaExclamationTriangle size={24} className="profile__modal-icon" />
              <h3 className="profile__modal-title">Confirmar Exclusão de Conta</h3>
            </div>
            <div className="profile__modal-content">
              <p>
                Tem certeza que deseja deletar sua conta? Esta ação é <strong>irreversível</strong> e todos os seus dados serão permanentemente removidos.
              </p>
            </div>
            <div className="profile__modal-actions">
              <button
                className="profile__modal-btn profile__modal-btn--cancel"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
              >
                Cancelar
              </button>
              <button
                className="profile__modal-btn profile__modal-btn--confirm"
                onClick={handleDeleteAccount}
                disabled={isDeleting}
              >
                {isDeleting ? "Deletando..." : "Sim, deletar conta"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
