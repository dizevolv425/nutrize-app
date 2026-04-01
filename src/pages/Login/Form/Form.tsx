"use client";

import React, { useState, useEffect } from "react";
import { Button } from "../../../components/ui/Button/Button";
import InputField from "../../../components/ui/InputField/InputField";
import "./Form.css";
import { useAuth } from "../../../hooks/useAuth";
import { paths } from "../../../routes/paths";
import { Link, useNavigate } from "react-router-dom";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { user, login, error, clearError } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("🔵 handleSubmit chamado! Email:", email, "Password:", password ? "***" : "(vazio)");
    
    // Validação básica
    if (!email || !password) {
      console.warn("⚠️ Campos vazios! Email:", email, "Password:", password ? "preenchido" : "vazio");
      return;
    }
    
    setIsLoading(true);
    clearError();
    try {
      console.log("🔵 Chamando login do useAuth...");
      await login({ email, password });
      console.log("🔵 Login concluído com sucesso!");
    } catch (error) {
      console.error("🔴 Erro no handleSubmit:", error);
      // Erro já é tratado pelo AuthContext
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      navigate(paths.dashboard);
    }
  }, [user, navigate]);

  const handleInputChange = (field: "email" | "password", value: string) => {
    if (field === "email") setEmail(value);
    else setPassword(value);
  };

  return (
    <div className="login-form">
      <div className="login-form__header">
        <h1 className="login-form__title">Bem-vindo de volta!</h1>
        <p className="login-form__subtitle">
          Acesse o Nutrize e continue oferecendo o melhor atendimento
          nutricional aos seus pacientes
        </p>
      </div>

      <form className="login-form__form" onSubmit={handleSubmit}>
        <InputField
          label="Email"
          type="email"
          value={email}
          onChange={(value) => handleInputChange("email", value)}
          placeholder="Digite seu email"
          required
        />

        <InputField
          label="Senha"
          type="password"
          value={password}
          onChange={(value) => handleInputChange("password", value)}
          placeholder="Digite sua senha"
          required
        />

        {error && (
          <div className="login-form__error">
            <p>{error}</p>
          </div>
        )}

        <Button
          type="submit"
          disabled={isLoading}
          variant="primary"
          className="login-form__submit-btn"
          onClick={(e) => {
            console.log("🔵 Botão clicado! Tipo:", e?.type);
            // Não fazer preventDefault aqui - deixar o form onSubmit tratar
          }}
        >
          {isLoading ? "Entrando..." : "Entrar"}
        </Button>

        <Link to={paths.forgotPassword} className="login-form__forgot-password">
          Esqueceu sua senha?
        </Link>

        <div className="login-form__divider">
          <span>ou</span>
        </div>

        <div className="login-form__register-link">
          <p>Não tem uma conta?</p>
          <Link to={paths.register} className="login-form__register-btn">
            Criar conta
          </Link>
        </div>

        <div className="login-form__client-link">
          <p>É um paciente/cliente?</p>
          <Link to={paths.clientLogin} className="login-form__client-btn">
            Fazer login como cliente
          </Link>
        </div>
      </form>
    </div>
  );
}
