import React, { useState, useEffect } from "react";
import { Header } from "../Header/Header";
import { Sidebar } from "../Sidebar/Sidebar";
import { TrialWarningModal } from "../../ui/TrialWarningModal/TrialWarningModal";
import { useAuth } from "../../../hooks/useAuth";
import "./DashboardLayout.css";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
}) => {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => window.innerWidth >= 968);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Garantir que o modal apareça sempre ao fazer login/recarregar
  // (a menos que o usuário tenha optado por não mostrar mais)
  useEffect(() => {
    if (user?.uid) {
      const dontShowKey = `trial-warning-dont-show-${user.uid}`;
      const sessionDismissedKey = `trial-warning-dismissed-${user.uid}`;
      
      // Não mostrar se o usuário optou por não mostrar mais (localStorage)
      const dontShowPermanently = localStorage.getItem(dontShowKey) === "true";
      
      // Não mostrar se já foi fechado nesta sessão (sessionStorage)
      const dismissedThisSession = sessionStorage.getItem(sessionDismissedKey) === "true";
      
      // Mostrar apenas se não foi dispensado permanentemente E não foi dispensado nesta sessão
      setIsModalOpen(!dontShowPermanently && !dismissedThisSession);
    }
  }, [user]);

  const isMobile = () => window.innerWidth < 968;

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const closeSidebarOnMobile = () => {
    if (isMobile()) setIsSidebarOpen(false);
  };

  // Fechar sidebar ao redimensionar para mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 968) setIsSidebarOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="dashboard-layout">
      <Sidebar isOpen={isSidebarOpen} />

      {/* Backdrop mobile — fecha sidebar ao clicar fora */}
      {isSidebarOpen && (
        <div
          className="dashboard-layout__backdrop"
          onClick={closeSidebarOnMobile}
          aria-hidden="true"
        />
      )}

      <div
        className={`dashboard-layout__content ${
          isSidebarOpen
            ? "dashboard-layout__content--sidebar-open"
            : "dashboard-layout__content--sidebar-closed"
        }`}
      >
        {isModalOpen && (
          <TrialWarningModal onClose={() => setIsModalOpen(false)} />
        )}
        <Header onToggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
        <main className="dashboard-layout__main">
          <div className="dashboard-layout__container">{children}</div>
        </main>
      </div>
    </div>
  );
};
