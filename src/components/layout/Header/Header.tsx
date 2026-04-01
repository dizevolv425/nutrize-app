import React, { useState, useEffect, useRef } from "react";
import logoColorido from "../../../assets/logo-colorido.png";
import {
  FaUserCircle,
  FaBell,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaCheck,
  FaClock,
} from "react-icons/fa";
import { useAuth } from "../../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { paths } from "../../../routes/paths";
import { useNotifications } from "../../../hooks/useNotifications";
import { useTrial } from "../../../hooks/useTrial";
import "./Header.css";

interface HeaderProps {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  isSidebarOpen,
}) => {
  const { user, logOut } = useAuth();
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const { isTrial, daysRemaining, isExpired } = useTrial();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Fechar dropdown de notificações ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showNotifications]);

  // Fechar dropdown do menu do usuário ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showUserMenu]);

  const handleLogout = async () => {
    try {
      await logOut();
      navigate(paths.login);
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return "agora";
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} min atrás`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} ${diffInHours === 1 ? "hora" : "horas"} atrás`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays} ${diffInDays === 1 ? "dia" : "dias"} atrás`;
    }

    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
    }).format(date);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return "✓";
      case "error":
        return "✕";
      case "warning":
        return "⚠";
      case "info":
        return "ℹ";
      default:
        return "•";
    }
  };

  const handleNotificationClick = (id: string) => {
    markAsRead(id);
  };

  return (
    <header className="header">
      <div className="header__left">
        <button
          className="header__toggle-btn"
          onClick={onToggleSidebar}
          aria-label="Abrir/fechar menu lateral"
        >
          {isSidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
        </button>
        <div className="header__brand">
          <img src={logoColorido} alt="Nutrize" className="header__brand-logo" />
        </div>
      </div>

      <div className="header__right">
        {/* Indicador de Trial */}
        {isTrial && (
          <div
            className={`header__trial-indicator ${
              daysRemaining !== null && daysRemaining <= 3 && !isExpired
                ? "header__trial-indicator--warning"
                : ""
            }`}
          >
            <FaClock size={16} />
            <span className="header__trial-text">
              {isExpired ? (
                <span className="header__trial-expired">Trial Expirado</span>
              ) : daysRemaining !== null ? (
                <span className="header__trial-label">
                  Faltam {daysRemaining} {daysRemaining === 1 ? "dia restante" : "dias restantes"}
                </span>
              ) : (
                "Trial Ativo"
              )}
            </span>
            <button
              className="header__trial-subscribe-btn"
              onClick={() => navigate(paths.subscription)}
            >
              Assine agora
            </button>
          </div>
        )}

        {/* Notificações */}
        <div className="header__notifications" ref={notificationsRef}>
          <button
            className="header__icon-btn"
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="Notificações"
          >
            <FaBell size={20} />
            {unreadCount > 0 && (
              <span className="header__badge">{unreadCount > 99 ? "99+" : unreadCount}</span>
            )}
          </button>

          {showNotifications && (
            <div className="header__dropdown header__notifications-dropdown">
              <div className="header__dropdown-header">
                <h3>Notificações</h3>
                {unreadCount > 0 && (
                  <button
                    className="header__mark-all-read"
                    onClick={markAllAsRead}
                    title="Marcar todas como lidas"
                  >
                    <FaCheck size={12} />
                    <span>Marcar todas</span>
                  </button>
                )}
              </div>
              <div className="header__dropdown-content">
                {notifications.length === 0 ? (
                  <div className="notification-item notification-item--empty">
                    <p className="notification-item__text">
                      Nenhuma notificação
                    </p>
                  </div>
                ) : (
                  notifications.slice(0, 10).map((notification) => (
                    <div
                      key={notification.id}
                      className={`notification-item ${!notification.read ? "notification-item--unread" : ""} notification-item--${notification.type}`}
                      onClick={() => handleNotificationClick(notification.id)}
                    >
                      <div className="notification-item__icon">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="notification-item__content">
                        <p className="notification-item__text">
                          {notification.title}
                        </p>
                        {notification.message && (
                          <p className="notification-item__message">
                            {notification.message}
                          </p>
                        )}
                        <span className="notification-item__time">
                          {formatTimeAgo(notification.timestamp)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Menu do usuário */}
        <div className="header__user" ref={userMenuRef}>
          <button
            className="header__user-btn"
            onClick={() => setShowUserMenu(!showUserMenu)}
            aria-label="Menu do usuário"
          >
            <FaUserCircle size={24} />
            <div className="header__user-info">
              <span className="header__user-name">
                {user?.name || "Usuário"}
              </span>
              <span className="header__user-role">
                {user?.role === "admin" 
                  ? "Administrador" 
                  : user?.role === "nutritionist" 
                  ? "Nutricionista" 
                  : "Paciente"}
              </span>
            </div>
          </button>

          {showUserMenu && (
            <div className="header__dropdown header__user-dropdown">
              <div className="header__dropdown-header">
                <FaUserCircle size={40} />
                <div>
                  <p className="header__dropdown-name">{user?.name}</p>
                  <p className="header__dropdown-email">{user?.email}</p>
                </div>
              </div>
              <div className="header__dropdown-divider"></div>
              <div className="header__dropdown-content">
                <button 
                  className="header__dropdown-item"
                  onClick={() => {
                    setShowUserMenu(false);
                    navigate(paths.perfil);
                  }}
                >
                  <FaUserCircle size={16} />
                  <span>Meu Perfil</span>
                </button>
                <button
                  className="header__dropdown-item header__dropdown-item--danger"
                  onClick={handleLogout}
                >
                  <FaSignOutAlt size={16} />
                  <span>Sair</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
