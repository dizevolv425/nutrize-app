import React, { useState } from "react";
import { OccupancyChart } from "./components/OccupancyChart";
import { ScheduleSummary } from "./components/ScheduleSummary";
import { FinancialChart } from "./components/FinancialChart";
import { ClientDemographics } from "./components/ClientDemographics";
import { BirthdayCard } from "./components/BirthdayCard";
import { StatsCards } from "./components/StatsCards";
import { ClientStatsCards } from "./components/ClientStatsCards";
import { ClientAppointmentStatusChart } from "./components/ClientAppointmentStatusChart";
import { ClientWeeklyAppointmentsChart } from "./components/ClientWeeklyAppointmentsChart";
import { ClientMonthlyTrendChart } from "./components/ClientMonthlyTrendChart";
import { MasterStatsCards } from "./components/MasterStatsCards";
import { EngagementChart } from "./components/EngagementChart";
import { useAuth } from "../../hooks/useAuth";
import "./Dashboard.css";

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const isUser = user?.role === "user";
  const [occupancyPeriod, setOccupancyPeriod] = useState<
    "day" | "week" | "month"
  >("week");

  // Dashboard para clientes (role user)
  if (isUser) {
    return (
      <div className="dashboard">
        <div className="dashboard__header">
          <div>
            <h1 className="dashboard__title">Dashboard</h1>
            <p className="dashboard__subtitle">Bem-vindo ao Nutrize</p>
          </div>
          <div className="dashboard__date">
            {new Date().toLocaleDateString("pt-BR", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>

        <div className="dashboard__grid">
          {/* Cards de Estatísticas */}
          <div className="dashboard__card dashboard__card--full">
            <ClientStatsCards />
          </div>

          {/* Status de Consultas */}
          <div className="dashboard__card">
            <div className="dashboard__card-header">
              <h2 className="dashboard__card-title">Status das Minhas Consultas</h2>
            </div>
            <ClientAppointmentStatusChart />
          </div>

          {/* Consultas por Dia da Semana */}
          <div className="dashboard__card dashboard__card--large">
            <div className="dashboard__card-header">
              <h2 className="dashboard__card-title">Minhas Consultas por Dia da Semana</h2>
            </div>
            <ClientWeeklyAppointmentsChart />
          </div>

          {/* Evolução Mensal */}
          <div className="dashboard__card dashboard__card--large">
            <div className="dashboard__card-header">
              <h2 className="dashboard__card-title">Evolução das Minhas Consultas</h2>
            </div>
            <ClientMonthlyTrendChart />
          </div>
        </div>
      </div>
    );
  }

  // Dashboard Master (PRD005) - APENAS para Admin
  if (isAdmin) {
    return (
      <div className="dashboard">
        <div className="dashboard__header">
          <div>
            <h1 className="dashboard__title">Dashboard Administrativo</h1>
            <p className="dashboard__subtitle">
              Visão geral das métricas de negócio e engajamento do sistema
            </p>
          </div>
          <div className="dashboard__date">
            {new Date().toLocaleDateString("pt-BR", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>

        <div className="dashboard__grid">
          {/* Métricas do Sistema (PRD 005) */}
          <div className="dashboard__card dashboard__card--full">
            <div className="dashboard__card-header">
              <h2 className="dashboard__card-title">Métricas do Sistema (PRD 005)</h2>
              <p className="dashboard__card-subtitle">
                Visão geral das métricas de negócio e engajamento - Clique nos cards para ver detalhes
              </p>
            </div>
            <MasterStatsCards />
          </div>

          {/* Gráfico de Engajamento */}
          <div className="dashboard__card dashboard__card--extra-large">
            <div className="dashboard__card-header">
              <h2 className="dashboard__card-title">Gráfico de Engajamento</h2>
              <p className="dashboard__card-subtitle">
                Total de Agendamentos e Dietas Salvas (Agregação Geral)
              </p>
            </div>
            <EngagementChart />
          </div>
        </div>
      </div>
    );
  }

  // Dashboard Nutricionista - Para nutricionistas (admin mas não master admin)
  return (
    <div className="dashboard">
      <div className="dashboard__header">
        <div>
          <h1 className="dashboard__title">Dashboard</h1>
          <p className="dashboard__subtitle">Visão geral do seu consultório</p>
        </div>
        <div className="dashboard__date">
          {new Date().toLocaleDateString("pt-BR", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
      </div>

      <div className="dashboard__grid">
        {/* Cards de Estatísticas */}
        <div className="dashboard__card dashboard__card--full">
          <StatsCards />
        </div>

        {/* Ocupação de Agenda */}
        <div className="dashboard__card dashboard__card--large">
          <div className="dashboard__card-header">
            <h2 className="dashboard__card-title">Ocupação de Agenda</h2>
            <div className="dashboard__period-selector">
              <button
                className={`dashboard__period-btn ${occupancyPeriod === "day" ? "active" : ""
                  }`}
                onClick={() => setOccupancyPeriod("day")}
              >
                Dia
              </button>
              <button
                className={`dashboard__period-btn ${occupancyPeriod === "week" ? "active" : ""
                  }`}
                onClick={() => setOccupancyPeriod("week")}
              >
                Semana
              </button>
              <button
                className={`dashboard__period-btn ${occupancyPeriod === "month" ? "active" : ""
                  }`}
                onClick={() => setOccupancyPeriod("month")}
              >
                Mês
              </button>
            </div>
          </div>
          <OccupancyChart period={occupancyPeriod} />
        </div>

        {/* Agenda Resumida */}
        <div className="dashboard__card">
          <div className="dashboard__card-header">
            <h2 className="dashboard__card-title">Agenda Resumida</h2>
          </div>
          <ScheduleSummary />
        </div>

        {/* Aniversariantes do Dia */}
        <div className="dashboard__card">
          <div className="dashboard__card-header">
            <h2 className="dashboard__card-title">🎉 Aniversariantes do Dia</h2>
          </div>
          <BirthdayCard />
        </div>

        {/* Gráfico Financeiro */}
        <div className="dashboard__card dashboard__card--large">
          <div className="dashboard__card-header">
            <h2 className="dashboard__card-title">Financeiro</h2>
          </div>
          <FinancialChart />
        </div>

        {/* Demografia de Pacientes */}
        <div className="dashboard__card dashboard__card--large">
          <div className="dashboard__card-header">
            <h2 className="dashboard__card-title">Perfil de Pacientes</h2>
          </div>
          <ClientDemographics />
        </div>
      </div>
    </div>
  );
};
