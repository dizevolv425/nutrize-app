import React from "react";
import { NavLink } from "react-router-dom";
import {
  FaHome,
  FaUsers,
  FaCalendarAlt,
  FaCalculator,
  FaChartLine,
  FaUtensils,
  FaExchangeAlt,
  FaCog,
} from "react-icons/fa";
import { useAuth } from "../../../hooks/useAuth";
import logoColorido from "../../../assets/logo-colorido.png";
import logoIcone from "../../../assets/logo-icone.png";
import "./Sidebar.css";

interface SidebarProps {
  isOpen: boolean;
}

interface MenuItem {
  path: string;
  icon: React.ReactNode;
  label: string;
  badge?: string;
  adminOnly?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const isNutritionist = user?.role === "nutritionist";
  const isSecretary = user?.role === "secretary";
  const isAdminOrNutritionist = isAdmin || isNutritionist;

  // Menu para admin e nutricionista
  const adminMenuItems: MenuItem[] = [
    {
      path: "/dashboard",
      icon: <FaHome size={20} />,
      label: "Home",
    },
    {
      path: "/dashboard/clientes",
      icon: <FaUsers size={20} />,
      label: "Pacientes",
      adminOnly: true,
    },
    {
      path: "/dashboard/agenda",
      icon: <FaCalendarAlt size={20} />,
      label: "Agenda",
      adminOnly: true,
    },
    {
      path: "/dashboard/calculadora",
      icon: <FaCalculator size={20} />,
      label: "Calculadora de Dieta",
      adminOnly: true,
    },
    {
      path: "/dashboard/financeiro",
      icon: <FaChartLine size={20} />,
      label: "Financeiro",
      adminOnly: true,
    },
    {
      path: "/dashboard/admin/alimentos",
      icon: <FaUtensils size={20} />,
      label: "Gerenciar Alimentos",
      adminOnly: true,
    },
    {
      path: "/dashboard/configuracoes/secretaria",
      icon: <FaCog size={20} />,
      label: "Secretária",
      adminOnly: true,
    },
  ];

  // Menu para secretária — filtrado pelas permissões dela
  const secretaryMenuItems: MenuItem[] = [
    {
      path: "/dashboard",
      icon: <FaHome size={20} />,
      label: "Home",
    },
    ...(user?.permissions?.includes("clients")
      ? [
          {
            path: "/dashboard/clientes",
            icon: <FaUsers size={20} />,
            label: "Pacientes",
          } as MenuItem,
        ]
      : []),
    ...(user?.permissions?.includes("agenda")
      ? [
          {
            path: "/dashboard/agenda",
            icon: <FaCalendarAlt size={20} />,
            label: "Agenda",
          } as MenuItem,
        ]
      : []),
    ...(user?.permissions?.includes("financial")
      ? [
          {
            path: "/dashboard/financeiro",
            icon: <FaChartLine size={20} />,
            label: "Financeiro",
          } as MenuItem,
        ]
      : []),
  ];

  // Menu para usuário (cliente)
  const userMenuItems: MenuItem[] = [
    {
      path: "/dashboard",
      icon: <FaHome size={20} />,
      label: "Home",
    },
    {
      path: "/dashboard/solicitar-consulta",
      icon: <FaCalendarAlt size={20} />,
      label: "Solicitar Consulta",
    },
    {
      path: "/dashboard/minhas-consultas",
      icon: <FaCalendarAlt size={20} />,
      label: "Minhas Consultas",
    },
    {
      path: "/dashboard/minhas-dietas",
      icon: <FaUtensils size={20} />,
      label: "Minhas Dietas",
    },
    {
      path: "/dashboard/minhas-substituicoes",
      icon: <FaExchangeAlt size={20} />,
      label: "Minhas Substituições",
    },
  ];

  // Selecionar menu conforme role
  const menuItems = isAdminOrNutritionist
    ? adminMenuItems
    : isSecretary
    ? secretaryMenuItems
    : userMenuItems;

  return (
    <aside
      className={`sidebar ${isOpen ? "sidebar--open" : "sidebar--closed"}`}
    >
      <div className="sidebar__logo">
        {isOpen ? (
          <img src={logoColorido} alt="Nutrize" className="sidebar__logo-img" />
        ) : (
          <img src={logoIcone} alt="Nutrize" className="sidebar__logo-icone" />
        )}
      </div>

      <nav className="sidebar__nav">
        <ul className="sidebar__menu">
          {menuItems.map((item) => (
            <li key={item.path} className="sidebar__menu-item">
              <NavLink
                to={item.path}
                end={item.path === "/dashboard"}
                className={({ isActive }) =>
                  `sidebar__link ${isActive ? "sidebar__link--active" : ""}`
                }
              >
                <span className="sidebar__link-icon">{item.icon}</span>
                {isOpen && (
                  <>
                    <span className="sidebar__link-label">{item.label}</span>
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar__footer">
        {isOpen && (
          <div className="sidebar__version">
            <p>Versão 1.0.0</p>
            <p>© 2025 Nutrize</p>
          </div>
        )}
      </div>
    </aside>
  );
};
