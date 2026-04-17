import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaInfoCircle, FaSave, FaSpinner, FaLock } from "react-icons/fa";
import { Button } from "../../components/ui/Button/Button";
import InputField from "../../components/ui/InputField/InputField";
import { createClient, getClientsByNutritionist } from "../../services/clientService";
import { useAuth } from "../../hooks/useAuth";
import { maskPhone } from "../../utils/masks";
import type { CreateClientData } from "../../types/client";
import "./ClientForm.css";

const STARTER_CLIENT_LIMIT = 30;

export const ClientForm: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientCount, setClientCount] = useState<number | null>(null);

  // Verificar contagem de pacientes para o limite do plano Starter
  useEffect(() => {
    if (!user?.uid || user.plan !== "starter") return;
    getClientsByNutritionist(user.uid)
      .then((list) => setClientCount(list.length))
      .catch(() => setClientCount(null));
  }, [user?.uid, user?.plan]);

  const isStarterLimitReached =
    user?.plan === "starter" &&
    clientCount !== null &&
    clientCount >= STARTER_CLIENT_LIMIT;
  const [formData, setFormData] = useState<CreateClientData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    birthDate: "",
    gender: undefined,
    height: undefined,
    weight: undefined,
  });

  const [formErrors, setFormErrors] = useState<Partial<Record<keyof CreateClientData, string>>>({});

  const handleInputChange = (field: keyof CreateClientData, value: string | number | undefined) => {
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

    if (!formData.lastName.trim()) {
      errors.lastName = "Sobrenome é obrigatório";
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
    if (isStarterLimitReached) {
      setError(`Plano Starter: limite de ${STARTER_CLIENT_LIMIT} pacientes atingido. Faça upgrade para continuar.`);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await createClient(formData, user.uid);
      navigate("/dashboard/clientes");
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
          setError("Erro ao criar paciente");
        }
      } else {
        setError("Erro ao criar paciente");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => navigate("/dashboard/clientes");

  return (
    <div className="client-form">
      <div className="client-form__header">
        <Button variant="ghost" onClick={handleCancel} className="client-form__back-button">
          <FaArrowLeft /> Voltar
        </Button>
        <div>
          <h1 className="client-form__title">Novo Paciente</h1>
          <p className="client-form__subtitle">Preencha os campos abaixo para cadastrar um novo paciente.</p>
        </div>
      </div>

      {isStarterLimitReached && (
        <div className="client-form__limit-banner">
          <FaLock />
          <span>
            Você atingiu o limite de <strong>{STARTER_CLIENT_LIMIT} pacientes</strong> do
            plano Starter.{" "}
            <a href="/assinatura">Faça upgrade para o plano Plus</a> para cadastrar pacientes
            ilimitados.
          </span>
        </div>
      )}

      <div className="client-form__container">
        <form onSubmit={handleSubmit} className="client-form__form">
          {error && (
            <div className="client-form__error">
              <p>{error}</p>
            </div>
          )}

          <div className="client-form__section">
            <h2 className="client-form__section-title">Informações Pessoais</h2>

            <div className="client-form__row">
              <InputField
                label="Nome"
                type="text"
                value={formData.firstName}
                onChange={(value) => handleInputChange("firstName", value)}
                placeholder="Ex: João"
                error={formErrors.firstName}
                required
                disabled={loading}
              />

              <InputField
                label="Sobrenome"
                type="text"
                value={formData.lastName}
                onChange={(value) => handleInputChange("lastName", value)}
                placeholder="Ex: da Silva"
                error={formErrors.lastName}
                required
                disabled={loading}
              />
            </div>

            <InputField
              label="E-mail"
              type="email"
              value={formData.email}
              onChange={(value) => handleInputChange("email", value)}
              placeholder="exemplo@email.com"
              error={formErrors.email}
              required
              disabled={loading}
            />

            <InputField
              label="Telefone"
              type="tel"
              value={formData.phone}
              onChange={(value) => handleInputChange("phone", value)}
              placeholder="(11) 99999-9999"
              error={formErrors.phone}
              required
              disabled={loading}
            />

            <div className="client-form__row">
              <InputField
                label="Data de Nascimento"
                type="date"
                value={formData.birthDate}
                onChange={(value) => handleInputChange("birthDate", value)}
                error={formErrors.birthDate}
                required
                disabled={loading}
              />

              <div className="client-form__gender">
                <label className="client-form__label">Sexo</label>
                <div className="client-form__gender-options">
                  <label className="client-form__radio">
                    <input
                      type="radio"
                      name="gender"
                      value="feminino"
                      checked={formData.gender === "feminino"}
                      onChange={(e) => handleInputChange("gender", e.target.value)}
                      disabled={loading}
                    />
                    <span>Feminino</span>
                  </label>
                  <label className="client-form__radio">
                    <input
                      type="radio"
                      name="gender"
                      value="masculino"
                      checked={formData.gender === "masculino"}
                      onChange={(e) => handleInputChange("gender", e.target.value)}
                      disabled={loading}
                    />
                    <span>Masculino</span>
                  </label>
                  <label className="client-form__radio">
                    <input
                      type="radio"
                      name="gender"
                      value="outro"
                      checked={formData.gender === "outro"}
                      onChange={(e) => handleInputChange("gender", e.target.value)}
                      disabled={loading}
                    />
                    <span>Outro</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="client-form__row">
              <InputField
                label="Altura (cm)"
                type="number"
                value={formData.height?.toString() || ""}
                onChange={(value) => handleInputChange("height", value ? parseFloat(value) : undefined)}
                placeholder="Ex: 175"
                disabled={loading}
                min={0}
                step={0.1}
              />
              <InputField
                label="Peso (kg)"
                type="number"
                value={formData.weight?.toString() || ""}
                onChange={(value) => handleInputChange("weight", value ? parseFloat(value) : undefined)}
                placeholder="Ex: 70.5"
                disabled={loading}
                min={0}
                step={0.1}
              />
            </div>
          </div>

          <div className="client-form__info">
            <p>
              <FaInfoCircle size={16} /> O paciente receberá um e-mail com um link para{" "}
              <strong>definir a própria senha de acesso</strong>.
            </p>
          </div>

          <div className="client-form__actions">
            <Button type="button" variant="secondary" onClick={handleCancel} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? (
                <><FaSpinner size={16} className="client-form__spinner" /> Cadastrando...</>
              ) : (
                <><FaSave /> Cadastrar Paciente</>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
