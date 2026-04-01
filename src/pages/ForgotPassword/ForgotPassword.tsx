import React, { useState } from "react";
import { Link } from "react-router-dom";
import InputField from "../../components/ui/InputField/InputField";
import { Button } from "../../components/ui/Button/Button";
import { authService } from "../../services/authService";
import { paths } from "../../routes/paths";
import logoColorido from "../../assets/logo-colorido.png";
import "./ForgotPassword.css";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Informe seu e-mail.");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      await authService.sendPasswordReset(email.trim());
      setSent(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao enviar e-mail. Tente novamente."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="forgot-password-page">
      <div className="forgot-password-page__card">
        <div className="forgot-password-page__logo">
          <img src={logoColorido} alt="Nutrize" />
        </div>

        {sent ? (
          <div className="forgot-password-page__success">
            <div className="forgot-password-page__success-icon">✓</div>
            <h2 className="forgot-password-page__title">E-mail enviado!</h2>
            <p className="forgot-password-page__subtitle">
              Enviamos um link de recuperação para <strong>{email}</strong>.
              Verifique sua caixa de entrada e o spam.
            </p>
            <Link to={paths.login} className="forgot-password-page__back-btn">
              Voltar ao login
            </Link>
          </div>
        ) : (
          <>
            <h2 className="forgot-password-page__title">Recuperar senha</h2>
            <p className="forgot-password-page__subtitle">
              Digite o e-mail da sua conta e enviaremos um link para você criar uma nova senha.
            </p>

            <form className="forgot-password-page__form" onSubmit={handleSubmit}>
              <InputField
                label="E-mail"
                type="email"
                value={email}
                onChange={setEmail}
                placeholder="Digite seu e-mail"
                required
              />

              {error && (
                <div className="forgot-password-page__error">
                  <p>{error}</p>
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                disabled={isLoading}
                className="forgot-password-page__submit-btn"
              >
                {isLoading ? "Enviando..." : "Enviar link de recuperação"}
              </Button>
            </form>

            <Link to={paths.login} className="forgot-password-page__login-link">
              ← Voltar ao login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
