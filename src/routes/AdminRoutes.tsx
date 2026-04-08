import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { paths } from "./paths";
import { useAuth } from "../hooks/useAuth";
import { useTrial } from "../hooks/useTrial";
import { TrialBlockModal } from "../components/ui/TrialBlockModal/TrialBlockModal";
import type { ReactNode } from "react";
import type { SecretaryModule } from "../types/user";

interface AdminRoutesProps {
  children: ReactNode;
  /** Se informado, secretárias com essa permissão também podem acessar a rota. */
  module?: SecretaryModule;
}

export default function AdminRoutes({ children, module }: AdminRoutesProps) {
  const { user, loading } = useAuth();
  const { isExpired, shouldBlock } = useTrial();
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (user?.uid && (user.role === "admin" || user.role === "nutritionist")) {
      const dontShowKey = `trial-block-dont-show-${user.uid}`;
      const sessionDismissedKey = `trial-block-dismissed-${user.uid}`;
      const dontShowPermanently = localStorage.getItem(dontShowKey) === "true";
      const dismissedThisSession = sessionStorage.getItem(sessionDismissedKey) === "true";
      setIsModalOpen(!dontShowPermanently && !dismissedThisSession);
    }
  }, [user?.uid, user?.role]);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          width: "100vw",
        }}
      >
        <div>Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to={paths.login} replace />;
  }

  const isAdminOrNutritionist =
    user.role === "admin" || user.role === "nutritionist";
  const isSecretary = user.role === "secretary";

  // Negar acesso a qualquer outro role
  if (!isAdminOrNutritionist && !isSecretary) {
    return <Navigate to={paths.dashboard} replace />;
  }

  // Lógica para secretária: verificar permissão de módulo
  if (isSecretary) {
    // Se a rota não especifica módulo, secretária não tem acesso
    if (!module) return <Navigate to={paths.dashboard} replace />;
    // Se não tem a permissão do módulo, redirecionar
    if (!user.permissions?.includes(module))
      return <Navigate to={paths.dashboard} replace />;
    // Secretária tem acesso — sem verificação de trial
    return <>{children}</>;
  }

  // Admin / Nutricionista: verificações de trial
  if (isExpired) {
    return <Navigate to={paths.trialExpired} replace />;
  }

  if (shouldBlock) {
    return (
      <>
        {isModalOpen && (
          <TrialBlockModal onClose={() => setIsModalOpen(false)} />
        )}
        {children}
      </>
    );
  }

  return <>{children}</>;
}

