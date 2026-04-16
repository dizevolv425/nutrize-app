import React, { useState, useEffect } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { getAppointmentsByNutritionist } from "../../../services/appointmentService";
import { getClientsByNutritionist } from "../../../services/clientService";
import { getDietsByNutritionist } from "../../../services/dietService";
import { FaUsers, FaCalendarCheck, FaUtensils, FaChartLine } from "react-icons/fa";
import "./StatsCards.css";

interface Stats {
  totalClients: number;
  totalAppointments: number;
  totalDiets: number;
  monthlyAppointments: number;
}

export const StatsCards: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    totalClients: 0,
    totalAppointments: 0,
    totalDiets: 0,
    monthlyAppointments: 0,
  });

  useEffect(() => {
    const loadStats = async () => {
      if (!user?.uid) return;

      try {
        setLoading(true);

        // Carregar clientes
        const clients = await getClientsByNutritionist(user.uid);

        // Carregar consultas (todas)
        const allAppointments = await getAppointmentsByNutritionist(user.uid);

        // Calcular consultas do mês atual
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

        const monthlyAppointments = allAppointments.filter(apt => {
          const aptDate = apt.date;
          return aptDate >= firstDayOfMonth && aptDate <= lastDayOfMonth;
        });

        // Carregar dietas
        const diets = await getDietsByNutritionist(user.uid);

        setStats({
          totalClients: clients.length,
          totalAppointments: allAppointments.length,
          totalDiets: diets.length,
          monthlyAppointments: monthlyAppointments.length,
        });
      } catch (error) {
        console.error("Erro ao carregar estatísticas:", error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [user]);

  if (loading) {
    return (
      <div className="stats-cards">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="stats-card stats-card--loading">
            <div className="stats-card__skeleton"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="stats-cards">
      <div className="stats-card stats-card--clients">
        <div className="stats-card__icon">
          <FaUsers />
        </div>
        <div className="stats-card__content">
          <h3 className="stats-card__label">Total de Pacientes</h3>
          <p className="stats-card__value">{stats.totalClients}</p>
        </div>
      </div>

      <div className="stats-card stats-card--appointments">
        <div className="stats-card__icon">
          <FaCalendarCheck />
        </div>
        <div className="stats-card__content">
          <h3 className="stats-card__label">Consultas do Mês</h3>
          <p className="stats-card__value">{stats.monthlyAppointments}</p>
        </div>
      </div>

      <div className="stats-card stats-card--diets">
        <div className="stats-card__icon">
          <FaUtensils />
        </div>
        <div className="stats-card__content">
          <h3 className="stats-card__label">Dietas Criadas</h3>
          <p className="stats-card__value">{stats.totalDiets}</p>
        </div>
      </div>

      <div className="stats-card stats-card--total">
        <div className="stats-card__icon">
          <FaChartLine />
        </div>
        <div className="stats-card__content">
          <h3 className="stats-card__label">Total de Consultas</h3>
          <p className="stats-card__value">{stats.totalAppointments}</p>
        </div>
      </div>
    </div>
  );
};
