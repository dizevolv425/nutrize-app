import React, { useState } from "react";
import { FaTimes, FaSave, FaSpinner } from "react-icons/fa";
import { Button } from "../../../components/ui/Button/Button";
import { createClient } from "../../../services/clientService";
import { useAuth } from "../../../hooks/useAuth";
import { maskPhone } from "../../../utils/masks";
import type { Client, CreateClientData } from "../../../types/client";
import "./QuickClientForm.css";

interface QuickClientFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (client: Client) => void;
}

export const QuickClientForm: React.FC<QuickClientFormProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<CreateClientData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    birthDate: "",
    gender: "feminino",
    height: undefined,
    weight: undefined,
  });

  const [formErrors, setFormErrors] = useState<Partial<Record<keyof CreateClientData, string>>>({});

  const handleInputChange = (
    field: keyof CreateClientData,
    value: string | number | undefined
  ) => {
    let processed: string | number | undefined = value;
    if (field === "phone" && typeof value === "string") {
      processed = maskPhone(value);
    }
    setFormData((prev) => ({ ...prev, [field]: processed }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof CreateClientData, string>> = {};

    if (!formData.firstName.trim()) {
      errors.firstName = "Nome é obrigatório";
    }

    if (!formData.email.trim()) {
      errors.email = "E-mail é obrigatório";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "E-mail inválido";
    }

    if (!formData.phone.trim()) {
      errors.phone = "Telefone é obrigatório";
    } else if (formData.phone.replace(/\D/g, "").length < 10) {
      errors.phone = "Telefone inválido";
    }

    if (!formData.birthDate) {
      errors.birthDate = "Data de nascimento é obrigatória";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (!user?.uid) {
      setError("Usuário não autenticado");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const clientId = await createClient(formData, user.uid);
      const fullName = `${formData.firstName} ${formData.lastName}`.trim();
      const newClient: Client = {
        id: clientId,
        fullName,
        ...formData,
        nutritionistId: user.uid,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      onSuccess(newClient);
      onClose();
    } catch (err: unknown) {
      console.error("Erro ao criar paciente:", err);
      if (err && typeof err === "object" && "code" in err) {
        if (err.code === "auth/email-already-in-use") {
          setError("E-mail já está em uso");
        } else if (err.code === "auth/invalid-email") {
          setError("E-mail inválido");
        } else if (err.code === "auth/weak-password") {
          setError("Erro ao gerar senha de acesso. Tente novamente.");
        } else {
          setError("Erro ao criar paciente. Tente novamente.");
        }
      } else {
        setError("Erro ao criar paciente. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      birthDate: "",
      gender: "feminino",
      height: undefined,
      weight: undefined,
    });
    setFormErrors({});
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="quick-client-form-overlay" onClick={handleCancel}>
      <div className="quick-client-form" onClick={(e) => e.stopPropagation()}>
        <div className="quick-client-form__header">
          <h3 className="quick-client-form__title">Cadastro Rápido de Paciente</h3>
          <button
            className="quick-client-form__close"
            onClick={handleCancel}
            disabled={loading}
            type="button"
          >
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="quick-client-form__form">
          {error && (
            <div className="quick-client-form__error">
              <p>{error}</p>
            </div>
          )}

          <div className="quick-client-form__info">
            <p>
              Preencha os dados essenciais do paciente. Ele receberá um e-mail com um link para{" "}
              <strong>definir a própria senha de acesso</strong>.
            </p>
          </div>

          <div className="quick-client-form__row">
            <div className="quick-client-form__field">
              <label className="quick-client-form__label">
                Nome <span className="quick-client-form__required">*</span>
              </label>
              <input
                type="text"
                className={`quick-client-form__input ${formErrors.firstName ? "quick-client-form__input--error" : ""}`}
                value={formData.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                placeholder="Ex: João"
                disabled={loading}
              />
              {formErrors.firstName && (
                <span className="quick-client-form__error-text">{formErrors.firstName}</span>
              )}
            </div>

            <div className="quick-client-form__field">
              <label className="quick-client-form__label">Sobrenome</label>
              <input
                type="text"
                className="quick-client-form__input"
                value={formData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                placeholder="Ex: da Silva"
                disabled={loading}
              />
            </div>
          </div>

          <div className="quick-client-form__field">
            <label className="quick-client-form__label">
              E-mail <span className="quick-client-form__required">*</span>
            </label>
            <input
              type="email"
              className={`quick-client-form__input ${formErrors.email ? "quick-client-form__input--error" : ""}`}
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="exemplo@email.com"
              disabled={loading}
            />
            {formErrors.email && (
              <span className="quick-client-form__error-text">{formErrors.email}</span>
            )}
          </div>

          <div className="quick-client-form__field">
            <label className="quick-client-form__label">
              Telefone <span className="quick-client-form__required">*</span>
            </label>
            <input
              type="tel"
              className={`quick-client-form__input ${formErrors.phone ? "quick-client-form__input--error" : ""}`}
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              placeholder="(11) 99999-9999"
              disabled={loading}
            />
            {formErrors.phone && (
              <span className="quick-client-form__error-text">{formErrors.phone}</span>
            )}
          </div>

          <div className="quick-client-form__row">
            <div className="quick-client-form__field">
              <label className="quick-client-form__label">
                Data de Nascimento <span className="quick-client-form__required">*</span>
              </label>
              <input
                type="date"
                className={`quick-client-form__input ${formErrors.birthDate ? "quick-client-form__input--error" : ""}`}
                value={formData.birthDate}
                onChange={(e) => handleInputChange("birthDate", e.target.value)}
                disabled={loading}
              />
              {formErrors.birthDate && (
                <span className="quick-client-form__error-text">{formErrors.birthDate}</span>
              )}
            </div>

            <div className="quick-client-form__field">
              <label className="quick-client-form__label">Sexo</label>
              <select
                className="quick-client-form__input"
                value={formData.gender || ""}
                onChange={(e) =>
                  handleInputChange("gender", e.target.value as "masculino" | "feminino" | "outro")
                }
                disabled={loading}
              >
                <option value="">Selecionar...</option>
                <option value="feminino">Feminino</option>
                <option value="masculino">Masculino</option>
                <option value="outro">Outro</option>
              </select>
            </div>
          </div>

          <div className="quick-client-form__actions">
            <Button type="button" variant="secondary" onClick={handleCancel} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? (
                <><FaSpinner className="quick-client-form__spinner" /> Cadastrando...</>
              ) : (
                <><FaSave /> Cadastrar</>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
