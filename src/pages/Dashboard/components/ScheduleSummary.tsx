import React, { useEffect, useState } from "react";
import { FaClock, FaUser, FaPhone, FaSpinner } from "react-icons/fa";
import { useAuth } from "../../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { getTodayAppointments } from "../../../services/appointmentService";
import { getClientById } from "../../../services/clientService";
import type { Appointment } from "../../../types/appointment";
import "./ScheduleSummary.css";

interface AppointmentWithClient extends Appointment {
  clientPhone?: string;
}

export const ScheduleSummary: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<AppointmentWithClient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTodayAppointments = async () => {
      if (!user?.uid) return;

      try {
        setLoading(true);
        const todayAppointments = await getTodayAppointments(user.uid);
        
        // Filtrar apenas agendamentos agendados (não cancelados)
        const scheduled = todayAppointments.filter(
          (apt) => apt.status !== "cancelled"
        );

        // Buscar telefones dos clientes
        const appointmentsWithClientData = await Promise.all(
          scheduled.map(async (apt) => {
            try {
              const client = await getClientById(apt.clientId);
              return {
                ...apt,
                clientPhone: client?.phone,
              } as AppointmentWithClient;
            } catch (error) {
              console.error(
                `Erro ao buscar cliente ${apt.clientId}:`,
                error
              );
              return { ...apt } as AppointmentWithClient;
            }
          })
        );

        // Ordenar por horário
        appointmentsWithClientData.sort((a, b) => {
          const timeA = a.startTime;
          const timeB = b.startTime;
          return timeA.localeCompare(timeB);
        });

        setAppointments(appointmentsWithClientData);
      } catch (error) {
        console.error("Erro ao carregar agendamentos de hoje:", error);
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    };

    loadTodayAppointments();
  }, [user?.uid]);

  const getStatusColor = (status: Appointment["status"]) => {
    switch (status) {
      case "scheduled":
        return "#10b981";
      case "completed":
        return "#6b7280";
      case "cancelled":
        return "#ef4444";
      case "no-show":
        return "#f59e0b";
      default:
        return "#6b7280";
    }
  };

  const getStatusText = (status: Appointment["status"]) => {
    switch (status) {
      case "scheduled":
        return "Confirmado";
      case "completed":
        return "Concluído";
      case "cancelled":
        return "Cancelado";
      case "no-show":
        return "Pendente";
      default:
        return status;
    }
  };

  const getAppointmentType = (notes?: string) => {
    if (!notes) return "Consulta";
    // Tentar inferir o tipo pela nota ou usar padrão
    const noteLower = notes.toLowerCase();
    if (noteLower.includes("primeira") || noteLower.includes("inicial")) {
      return "Primeira Consulta";
    }
    if (noteLower.includes("retorno")) {
      return "Retorno";
    }
    if (noteLower.includes("avaliação") || noteLower.includes("avaliacao")) {
      return "Avaliação";
    }
    return "Consulta";
  };

  if (loading) {
    return (
      <div className="schedule-summary">
        <div className="schedule-summary__loading">
          <FaSpinner className="fa-spin" size={24} />
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="schedule-summary">
      <div className="schedule-summary__header">
        <div>
          <p className="schedule-summary__header-label">Consultas Hoje</p>
          <p className="schedule-summary__header-count">
            {appointments.length}
          </p>
        </div>
        <FaClock size={32} style={{ opacity: 0.8 }} />
      </div>

      {appointments.length === 0 ? (
        <div className="schedule-summary__empty">
          <p>Nenhuma consulta agendada para hoje</p>
        </div>
      ) : (
        <div className="schedule-summary__list">
          {appointments.map((appointment) => (
            <div key={appointment.id} className="schedule-summary__appointment" onClick={() => navigate("/dashboard/agenda")} style={{ cursor: "pointer" }}>
              <div className="schedule-summary__appointment-header">
                <div className="schedule-summary__appointment-time">
                  <FaClock size={14} color="#667eea" />
                  <span className="schedule-summary__time-text">
                    {appointment.startTime.substring(0, 5)}
                  </span>
                </div>
                <span
                  className="schedule-summary__status-badge"
                  style={{
                    background: getStatusColor(appointment.status) + "20",
                    color: getStatusColor(appointment.status),
                  }}
                >
                  {getStatusText(appointment.status)}
                </span>
              </div>
              <div className="schedule-summary__appointment-row">
                <FaUser size={12} color="#6b7280" />
                <span className="schedule-summary__client-name">
                  {appointment.clientName}
                </span>
              </div>
              {appointment.clientPhone && (
                <div className="schedule-summary__appointment-row">
                  <FaPhone size={12} color="#6b7280" />
                  <span className="schedule-summary__phone">
                    {appointment.clientPhone}
                  </span>
                </div>
              )}
              <div className="schedule-summary__appointment-type">
                <span className="schedule-summary__type-text">
                  {getAppointmentType(appointment.notes)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
