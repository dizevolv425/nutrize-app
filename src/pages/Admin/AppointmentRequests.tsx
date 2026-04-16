import React, { useState, useEffect } from "react";
import { FaCheckCircle, FaTimesCircle, FaCalendarAlt, FaClock, FaUser, FaSpinner } from "react-icons/fa";
import { Button } from "../../components/ui/Button/Button";
import { useAuth } from "../../hooks/useAuth";
import { getPendingAppointmentRequests, approveAppointmentRequest, rejectAppointmentRequest } from "../../services/appointmentService";
import type { Appointment } from "../../types/appointment";
import "./AppointmentRequests.css";

export const AppointmentRequests: React.FC = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    const loadRequests = async () => {
      if (!user?.uid) return;

      try {
        setLoading(true);
        const data = await getPendingAppointmentRequests(user.uid);
        setRequests(data);
      } catch (error) {
        console.error("Erro ao carregar solicitações:", error);
      } finally {
        setLoading(false);
      }
    };

    loadRequests();
  }, [user?.uid]);

  const handleApprove = async (appointmentId: string) => {
    try {
      setProcessing(appointmentId);
      await approveAppointmentRequest(appointmentId);
      setRequests(requests.filter((r) => r.id !== appointmentId));
    } catch (error) {
      console.error("Erro ao aprovar solicitação:", error);
      alert("Erro ao aprovar solicitação. Tente novamente.");
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (appointmentId: string) => {
    if (!confirm("Tem certeza que deseja rejeitar esta solicitação?")) {
      return;
    }

    try {
      setProcessing(appointmentId);
      await rejectAppointmentRequest(appointmentId);
      setRequests(requests.filter((r) => r.id !== appointmentId));
    } catch (error) {
      console.error("Erro ao rejeitar solicitação:", error);
      alert("Erro ao rejeitar solicitação. Tente novamente.");
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <div className="appointment-requests">
        <div className="appointment-requests__loading">
          <FaSpinner className="fa-spin" size={24} />
          <p>Carregando solicitações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="appointment-requests">
      <div className="appointment-requests__header">
        <h1 className="appointment-requests__title">Solicitações de Consulta</h1>
        <p className="appointment-requests__subtitle">
          Aprove ou rejeite as solicitações de agendamento dos pacientes
        </p>
      </div>

      {requests.length === 0 ? (
        <div className="appointment-requests__empty">
          <FaCalendarAlt size={48} />
          <p>Nenhuma solicitação pendente</p>
        </div>
      ) : (
        <div className="appointment-requests__list">
          {requests.map((request) => {
            const requestDate = new Date(request.date);
            const isProcessing = processing === request.id;

            return (
              <div key={request.id} className="appointment-requests__card">
                <div className="appointment-requests__card-header">
                  <div className="appointment-requests__client-info">
                    <FaUser />
                    <div>
                      <h3 className="appointment-requests__client-name">
                        {request.clientName}
                      </h3>
                      <p className="appointment-requests__client-id">
                        Paciente ID: {request.clientId}
                      </p>
                    </div>
                  </div>
                  <div className="appointment-requests__badge">
                    <span>Aguardando Aprovação</span>
                  </div>
                </div>

                <div className="appointment-requests__card-body">
                  <div className="appointment-requests__date-time">
                    <div className="appointment-requests__date">
                      <FaCalendarAlt />
                      <span>
                        {requestDate.toLocaleDateString("pt-BR", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="appointment-requests__time">
                      <FaClock />
                      <span>
                        {request.startTime.substring(0, 5)} -{" "}
                        {request.endTime.substring(0, 5)}
                      </span>
                    </div>
                  </div>

                  {request.notes && (
                    <div className="appointment-requests__notes">
                      <p>
                        <strong>Observações:</strong> {request.notes}
                      </p>
                    </div>
                  )}

                  <div className="appointment-requests__actions">
                    <Button
                      variant="secondary"
                      onClick={() => handleReject(request.id)}
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <>
                          <FaSpinner className="fa-spin" /> Processando...
                        </>
                      ) : (
                        <>
                          <FaTimesCircle /> Rejeitar
                        </>
                      )}
                    </Button>
                    <Button
                      variant="primary"
                      onClick={() => handleApprove(request.id)}
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <>
                          <FaSpinner className="fa-spin" /> Processando...
                        </>
                      ) : (
                        <>
                          <FaCheckCircle /> Aprovar
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

