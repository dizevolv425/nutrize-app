import React, { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { authService } from "../../services/authService";
import {
  updateUserProfile,
  uploadProfilePhoto,
} from "../../services/userService";
import { paths } from "../../routes/paths";
import {
  FaUserCircle,
  FaEnvelope,
  FaPhone,
  FaCalendarAlt,
  FaTrash,
  FaExclamationTriangle,
  FaEdit,
  FaSave,
  FaTimes,
  FaSpinner,
  FaCamera,
} from "react-icons/fa";
import "./Profile.css";

export const Profile: React.FC = () => {
  const { user, logOut, reloadUser } = useAuth();
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Edição de perfil
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  useEffect(() => {
    if (user && !isEditing) {
      setName(user.name || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
      setPhotoPreview(user.photoURL || null);
      setPhotoFile(null);
    }
  }, [user, isEditing]);

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

  const handleStartEdit = () => {
    setFormError(null);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setFormError(null);
    setPhotoFile(null);
    setPhotoPreview(user?.photoURL || null);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!user?.uid) return;
    setFormError(null);

    if (!name.trim()) return setFormError("Nome é obrigatório.");
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return setFormError("E-mail inválido.");
    }

    setSaving(true);
    try {
      let photoURL = user.photoURL;
      if (photoFile) {
        photoURL = await uploadProfilePhoto(user.uid, photoFile);
      }

      const updated = await updateUserProfile(user.uid, {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        photoURL,
      });

      reloadUser(updated);
      setIsEditing(false);
      setPhotoFile(null);
    } catch (err: unknown) {
      console.error("Erro ao salvar perfil:", err);
      if (err && typeof err === "object" && "code" in err) {
        const code = (err as { code: string }).code;
        if (code === "auth/requires-recent-login") {
          setFormError(
            "Por segurança, faça login novamente para alterar o e-mail."
          );
        } else if (code === "auth/email-already-in-use") {
          setFormError("Este e-mail já está em uso por outra conta.");
        } else if (code === "auth/invalid-email") {
          setFormError("E-mail inválido.");
        } else {
          setFormError("Erro ao salvar perfil. Tente novamente.");
        }
      } else {
        setFormError(
          err instanceof Error ? err.message : "Erro ao salvar perfil."
        );
      }
    } finally {
      setSaving(false);
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
          <div className="profile__avatar-wrap">
            {photoPreview ? (
              <img
                src={photoPreview}
                alt={user.name || "Avatar"}
                className="profile__avatar-img"
              />
            ) : (
              <div className="profile__avatar">
                <FaUserCircle size={80} />
              </div>
            )}
            {isEditing && (
              <label className="profile__avatar-upload">
                <FaCamera size={14} />
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={handlePhotoChange}
                  style={{ display: "none" }}
                />
              </label>
            )}
          </div>
          <h1 className="profile__title">Meu Perfil</h1>
          {!isEditing ? (
            <button
              className="profile__edit-btn"
              onClick={handleStartEdit}
              type="button"
            >
              <FaEdit size={14} /> Editar perfil
            </button>
          ) : (
            <div className="profile__edit-actions">
              <button
                className="profile__edit-btn profile__edit-btn--cancel"
                onClick={handleCancelEdit}
                disabled={saving}
                type="button"
              >
                <FaTimes size={14} /> Cancelar
              </button>
              <button
                className="profile__edit-btn profile__edit-btn--save"
                onClick={handleSave}
                disabled={saving}
                type="button"
              >
                {saving ? (
                  <>
                    <FaSpinner className="profile__spinner" size={14} /> Salvando...
                  </>
                ) : (
                  <>
                    <FaSave size={14} /> Salvar
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        <div className="profile__content">
          {formError && (
            <div className="profile__form-error">{formError}</div>
          )}

          <div className="profile__section">
            <h2 className="profile__section-title">Informações Pessoais</h2>
            <div className="profile__info-grid">
              <div className="profile__info-item">
                <div className="profile__info-label">
                  <FaUserCircle size={16} />
                  <span>Nome</span>
                </div>
                {isEditing ? (
                  <input
                    type="text"
                    className="profile__input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={saving}
                  />
                ) : (
                  <div className="profile__info-value">
                    {user.name || "Não informado"}
                  </div>
                )}
              </div>

              <div className="profile__info-item">
                <div className="profile__info-label">
                  <FaEnvelope size={16} />
                  <span>Email</span>
                </div>
                {isEditing ? (
                  <input
                    type="email"
                    className="profile__input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={saving}
                  />
                ) : (
                  <div className="profile__info-value">
                    {user.email || "Não informado"}
                  </div>
                )}
              </div>

              <div className="profile__info-item">
                <div className="profile__info-label">
                  <FaPhone size={16} />
                  <span>Telefone</span>
                </div>
                {isEditing ? (
                  <input
                    type="tel"
                    className="profile__input"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={saving}
                    placeholder="(11) 99999-9999"
                  />
                ) : (
                  <div className="profile__info-value">
                    {user.phone || "Não informado"}
                  </div>
                )}
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

          {user.trialEndDate && user.role !== "admin" && (
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
