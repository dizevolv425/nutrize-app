import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaCalendarAlt, FaClock, FaSave, FaSpinner } from "react-icons/fa";
import { Button } from "../../components/ui/Button/Button";
import { useAuth } from "../../hooks/useAuth";
import { clientAuth } from "../../lib/clientFirebaseConfig";
import { getClientByAuthUid } from "../../services/clientService";
import { createAppointmentRequest } from "../../services/appointmentService";
import { getDocs, query, collection, where } from "firebase/firestore";
import { db } from "../../lib/firebaseconfig";
import { paths } from "../../routes/paths";
import type { Client } from "../../types/client";
import "./RequestAppointment.css";

export const RequestAppointment: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingClient, setLoadingClient] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const loadClient = async () => {
      // Verificar se é um cliente autenticado (clientAuth) ou nutricionista (user)
      const clientAuthUser = clientAuth.currentUser;
      const authUid = clientAuthUser?.uid || user?.uid;

      if (!authUid) {
        // Se não está autenticado, redirecionar para login de clientes
        navigate(paths.clientLogin);
        return;
      }

      try {
        setLoadingClient(true);
        const clientData = await getClientByAuthUid(authUid);
        
        if (!clientData) {
          setError("Paciente não encontrado. Entre em contato com o suporte.");
          return;
        }

        setClient(clientData);
      } catch (error) {
        console.error("Erro ao carregar cliente:", error);
        setError("Erro ao carregar dados do cliente");
      } finally {
        setLoadingClient(false);
      }
    };

    loadClient();
  }, [user?.uid, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!date || !startTime || !endTime) {
      setError("Preencha todos os campos obrigatórios");
      return;
    }

    if (!client) {
      setError("Paciente não encontrado");
      return;
    }

    // Buscar nutritionistId do cliente
    let nutritionistId = client.nutritionistId;

    // Se o cliente não tem nutritionistId associado, buscar um nutricionista padrão
    if (!nutritionistId) {
      try {
        // Buscar primeiro nutricionista disponível
        const usersQuery = query(
          collection(db, "users"),
          where("role", "==", "nutritionist")
        );
        const usersSnapshot = await getDocs(usersQuery);
        if (!usersSnapshot.empty) {
          nutritionistId = usersSnapshot.docs[0].id;
        } else {
          setError("Nenhum nutricionista disponível. Entre em contato com o suporte.");
          return;
        }
      } catch (error) {
        console.error("Erro ao buscar nutricionista:", error);
        setError("Erro ao buscar nutricionista. Tente novamente.");
        return;
      }
    }

    try {
      setLoading(true);
      const appointmentDate = new Date(date);
      
      // Obter o UID correto (pode ser do cliente autenticado ou do nutricionista)
      const clientAuthUser = clientAuth.currentUser;
      const authUid = clientAuthUser?.uid || user?.uid || client.id;
      
      await createAppointmentRequest(
        {
          clientId: client.id,
          clientName: client.fullName,
          date: appointmentDate,
          startTime,
          endTime,
          notes: notes || undefined,
        },
        nutritionistId,
        authUid
      );

      navigate("/dashboard/minhas-consultas", {
        state: { message: "Solicitação de consulta enviada com sucesso!" },
      });
    } catch (err: any) {
      console.error("Erro ao solicitar consulta:", err);
      setError(err.message || "Erro ao solicitar consulta. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  if (loadingClient) {
    return (
      <div className="request-appointment">
        <div className="request-appointment__loading">
          <FaSpinner className="fa-spin" size={24} />
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="request-appointment">
        <div className="request-appointment__error">
          <p>{error || "Paciente não encontrado"}</p>
        </div>
      </div>
    );
  }

  // Data mínima: hoje
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="request-appointment">
      <div className="request-appointment__header">
        <Button
          variant="secondary"
          onClick={() => navigate("/dashboard")}
          className="request-appointment__back-btn"
        >
          <FaArrowLeft /> Voltar
        </Button>
        <h1 className="request-appointment__title">Solicitar Consulta</h1>
      </div>

      <form onSubmit={handleSubmit} className="request-appointment__form">
        {error && (
          <div className="request-appointment__error-message">
            <p>{error}</p>
          </div>
        )}

        <div className="request-appointment__info">
          <p>
            <strong>Paciente:</strong> {client.fullName}
          </p>
          <p>
            <strong>Email:</strong> {client.email}
          </p>
        </div>

        <div className="request-appointment__field">
          <label className="request-appointment__label">
            <FaCalendarAlt /> Data da Consulta{" "}
            <span className="request-appointment__required">*</span>
          </label>
          <input
            type="date"
            className="request-appointment__input"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            min={today}
            required
            disabled={loading}
          />
        </div>

        <div className="request-appointment__time-fields">
          <div className="request-appointment__field">
            <label className="request-appointment__label">
              <FaClock /> Horário de Início{" "}
              <span className="request-appointment__required">*</span>
            </label>
            <input
              type="time"
              className="request-appointment__input"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="request-appointment__field">
            <label className="request-appointment__label">
              <FaClock /> Horário de Término{" "}
              <span className="request-appointment__required">*</span>
            </label>
            <input
              type="time"
              className="request-appointment__input"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
              disabled={loading}
            />
          </div>
        </div>

        <div className="request-appointment__field">
          <label className="request-appointment__label">
            Observações (Opcional)
          </label>
          <textarea
            className="request-appointment__textarea"
            placeholder="Ex: Consulta de retorno, primeira consulta, etc..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            disabled={loading}
          />
        </div>

        <div className="request-appointment__actions">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate("/dashboard")}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? (
              <>
                <FaSpinner className="fa-spin" /> Enviando...
              </>
            ) : (
              <>
                <FaSave /> Solicitar Consulta
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

