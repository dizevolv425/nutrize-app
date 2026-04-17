import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaSave,
  FaSpinner,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaBirthdayCake,
  FaVenusMars,
  FaEdit,
  FaArrowLeft,
} from "react-icons/fa";
import { Button } from "../../components/ui/Button/Button";
import InputField from "../../components/ui/InputField/InputField";
import { getClientByAuthUid, updateClient } from "../../services/clientService";
import { clientAuth } from "../../lib/clientFirebaseConfig";
import type { Client } from "../../types/client";
import "./ClientProfile.css";

export const ClientProfile: React.FC = () => {
  const navigate = useNavigate();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState<"masculino" | "feminino" | "outro" | undefined>(undefined);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadClientData();
  }, []);

  const loadClientData = async () => {
    try {
      setLoading(true);
      setError(null);

      const firebaseUser = clientAuth.currentUser;
      if (!firebaseUser) {
        setError("Usuário não autenticado");
        return;
      }

      const clientData = await getClientByAuthUid(firebaseUser.uid);
      if (!clientData) {
        setError("Paciente não encontrado");
        return;
      }

      setClient(clientData);
      setFirstName(clientData.firstName || clientData.fullName.split(" ")[0] || "");
      setLastName(clientData.lastName || clientData.fullName.split(" ").slice(1).join(" ") || "");
      setEmail(clientData.email);
      setPhone(clientData.phone);
      setBirthDate(clientData.birthDate);
      setGender(clientData.gender);
    } catch (err) {
      console.error("Erro ao carregar dados do cliente:", err);
      setError("Erro ao carregar dados. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!firstName.trim()) errors.firstName = "Nome é obrigatório";
    if (!email.trim()) errors.email = "E-mail é obrigatório";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "E-mail inválido";
    if (!phone.trim()) errors.phone = "Telefone é obrigatório";
    if (!birthDate) errors.birthDate = "Data de nascimento é obrigatória";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm() || !client) return;

    try {
      setSaving(true);
      setError(null);
      const fullName = `${firstName} ${lastName}`.trim();
      await updateClient(client.id, {
        firstName,
        lastName,
        fullName,
        email,
        phone,
        birthDate,
        gender,
      });
      await loadClientData();
      setIsEditing(false);
    } catch (err) {
      console.error("Erro ao salvar dados:", err);
      setError("Erro ao salvar dados. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (client) {
      setFirstName(client.firstName || client.fullName.split(" ")[0] || "");
      setLastName(client.lastName || client.fullName.split(" ").slice(1).join(" ") || "");
      setEmail(client.email);
      setPhone(client.phone);
      setBirthDate(client.birthDate);
      setGender(client.gender);
    }
    setFormErrors({});
    setIsEditing(false);
  };

  const formatDate = (date: string) => {
    return new Date(date + "T00:00:00").toLocaleDateString("pt-BR");
  };

  if (loading) {
    return (
      <div className="client-profile__loading">
        <FaSpinner className="client-profile__spinner" />
        <p>Carregando seus dados...</p>
      </div>
    );
  }

  if (error && !client) {
    return (
      <div className="client-profile__error">
        <h2>{error}</h2>
        <Button variant="primary" onClick={() => navigate("/dashboard")}>
          Voltar para Dashboard
        </Button>
      </div>
    );
  }

  if (!client) return null;

  return (
    <div className="client-profile">
      <div className="client-profile__header">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="client-profile__back-button"
        >
          <FaArrowLeft /> Voltar
        </Button>
        <div className="client-profile__header-content">
          <h1 className="client-profile__title">Meu Perfil</h1>
          <p className="client-profile__subtitle">Gerencie suas informações pessoais</p>
        </div>
      </div>

      <div className="client-profile__container">
        {error && (
          <div className="client-profile__error-message">
            <p>{error}</p>
          </div>
        )}

        <div className="client-profile__card">
          <div className="client-profile__card-header">
            <div className="client-profile__avatar">
              <FaUser size={40} />
            </div>
            <div className="client-profile__card-title">
              <h2>Informações Pessoais</h2>
              {!isEditing && (
                <Button variant="secondary" size="small" onClick={() => setIsEditing(true)}>
                  <FaEdit /> Editar
                </Button>
              )}
            </div>
          </div>

          <div className="client-profile__card-content">
            {isEditing ? (
              <form className="client-profile__form">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <InputField
                    label="Nome"
                    type="text"
                    value={firstName}
                    onChange={setFirstName}
                    placeholder="Ex: João"
                    error={formErrors.firstName}
                    required
                    disabled={saving}
                  />
                  <InputField
                    label="Sobrenome"
                    type="text"
                    value={lastName}
                    onChange={setLastName}
                    placeholder="Ex: da Silva"
                    disabled={saving}
                  />
                </div>

                <InputField
                  label="E-mail"
                  type="email"
                  value={email}
                  onChange={setEmail}
                  placeholder="exemplo@email.com"
                  error={formErrors.email}
                  required
                  disabled={saving}
                />

                <InputField
                  label="Telefone"
                  type="tel"
                  value={phone}
                  onChange={setPhone}
                  placeholder="(11) 99999-9999"
                  error={formErrors.phone}
                  required
                  disabled={saving}
                />

                <InputField
                  label="Data de Nascimento"
                  type="date"
                  value={birthDate}
                  onChange={setBirthDate}
                  error={formErrors.birthDate}
                  required
                  disabled={saving}
                />

                <div className="client-profile__gender">
                  <label className="client-profile__label">Sexo</label>
                  <div className="client-profile__gender-options">
                    {(["feminino", "masculino", "outro"] as const).map((g) => (
                      <label key={g} className="client-profile__radio">
                        <input
                          type="radio"
                          name="gender"
                          value={g}
                          checked={gender === g}
                          onChange={() => setGender(g)}
                          disabled={saving}
                        />
                        <span style={{ textTransform: "capitalize" }}>{g}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="client-profile__form-actions">
                  <Button type="button" variant="secondary" onClick={handleCancel} disabled={saving}>
                    Cancelar
                  </Button>
                  <Button type="button" variant="primary" onClick={handleSave} disabled={saving}>
                    {saving ? (
                      <><FaSpinner className="client-profile__spinner" /> Salvando...</>
                    ) : (
                      <><FaSave /> Salvar Alterações</>
                    )}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="client-profile__info">
                <div className="client-profile__info-item">
                  <FaUser className="client-profile__info-icon" />
                  <div>
                    <label>Nome Completo</label>
                    <p>{client.fullName}</p>
                  </div>
                </div>
                <div className="client-profile__info-item">
                  <FaEnvelope className="client-profile__info-icon" />
                  <div>
                    <label>E-mail</label>
                    <p>{client.email}</p>
                  </div>
                </div>
                <div className="client-profile__info-item">
                  <FaPhone className="client-profile__info-icon" />
                  <div>
                    <label>Telefone</label>
                    <p>{client.phone}</p>
                  </div>
                </div>
                <div className="client-profile__info-item">
                  <FaBirthdayCake className="client-profile__info-icon" />
                  <div>
                    <label>Data de Nascimento</label>
                    <p>{formatDate(client.birthDate)}</p>
                  </div>
                </div>
                <div className="client-profile__info-item">
                  <FaVenusMars className="client-profile__info-icon" />
                  <div>
                    <label>Sexo</label>
                    <p style={{ textTransform: "capitalize" }}>{client.gender || "—"}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
