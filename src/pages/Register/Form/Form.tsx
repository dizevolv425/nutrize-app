"use client";

import React, { useState } from "react";
import InputField from "../../../components/ui/InputField/InputField";
import { Button } from "../../../components/ui/Button/Button";
import type { RegisterCredentials } from "../../../types/user";
import { useAuth } from "../../../hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";
import { paths } from "../../../routes/paths";
import { maskPhone } from "../../../utils/masks";
import "./Form.css";

type FormErrors = Partial<Record<keyof RegisterCredentials, string>>;

export const RegisterForm: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<RegisterCredentials>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    role: "user",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>("");

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Nome é obrigatório";
    }

    if (!formData.phone?.trim()) {
      newErrors.phone = "Telefone é obrigatório";
    } else if (formData.phone.replace(/\D/g, "").length < 10) {
      newErrors.phone = "Telefone inválido — informe DDD + número";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Email é obrigatório";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Email inválido";
    }

    if (!formData.password) {
      newErrors.password = "Senha é obrigatória";
    } else if (formData.password.length < 6) {
      newErrors.password = "Senha deve ter pelo menos 6 caracteres";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Confirmação de senha é obrigatória";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "As senhas não conferem";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange =
    (field: keyof RegisterCredentials) => (value: string) => {
      const maskedValue = field === "phone" ? maskPhone(value) : value;
      setFormData((prev) => ({
        ...prev,
        [field]: maskedValue,
      }));

      if (errors[field]) {
        setErrors((prev) => ({
          ...prev,
          [field]: undefined,
        }));
      }
    };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const payload: RegisterCredentials = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        phone: formData.phone,
        // Todo cadastro via esta tela é de NUTRICIONISTA,
        // o cliente nunca se cadastra sozinho.
        // Apenas um admin pode existir e deve ser criado manualmente.
        role: "nutritionist",
      };

      await register(payload);
      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        phone: "",
        role: "user",
      });

      setTimeout(() => {
        navigate(paths.login);
      }, 1000);
    } catch (error) {
      if (error instanceof Error) {
        setSubmitError(error.message);
      } else {
        setSubmitError("Erro ao registrar usuário");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="user-register-form">
      <div className="user-register-form__header">
        <h1 className="user-register-form__title">
          Cadastro de Nutricionista - Nutrize
        </h1>
        <p className="user-register-form__subtitle">
          Crie sua conta e comece a otimizar sua gestão nutricional hoje mesmo
        </p>
      </div>

      <form onSubmit={handleSubmit} className="user-register-form__form">
        <div className="user-register-form__fields">
          <InputField
            type="text"
            label="Nome"
            value={formData.name}
            onChange={handleInputChange("name")}
            error={errors.name}
            placeholder="Digite seu nome"
            required
          />
          <InputField
            type="tel"
            label="Telefone"
            value={formData.phone || ""}
            onChange={handleInputChange("phone")}
            error={errors.phone}
            placeholder="(11) 99999-9999"
            required
          />
          <InputField
            type="email"
            label="Email"
            value={formData.email}
            onChange={handleInputChange("email")}
            error={errors.email}
            placeholder="Digite seu email"
            required
          />
          <InputField
            type="password"
            label="Senha"
            value={formData.password}
            onChange={handleInputChange("password")}
            error={errors.password}
            placeholder="Digite sua senha"
            required
          />
          <InputField
            type="password"
            label="Confirmar Senha"
            value={formData.confirmPassword || ""}
            onChange={handleInputChange("confirmPassword")}
            error={errors.confirmPassword}
            placeholder="Confirme sua senha"
            required
          />
        </div>

        {submitError && (
          <div className="user-register-form__error">
            <p>{submitError}</p>
          </div>
        )}

        <Button
          type="submit"
          disabled={isSubmitting}
          className="login-form__submit-btn"
          variant="primary"
        >
          {isSubmitting ? "Cadastrando..." : "Cadastrar"}
        </Button>

        <div className="user-register-form__divider">
          <span>ou</span>
        </div>

        <div className="user-register-form__login-link">
          <p>Já tem uma conta?</p>
          <Link to={paths.login} className="user-register-form__login-btn">
            Faça o login
          </Link>
        </div>
      </form>
    </div>
  );
};
