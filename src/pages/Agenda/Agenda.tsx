import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Calendar, momentLocalizer, type View } from "react-big-calendar";
import withDragAndDrop, { type EventInteractionArgs } from "react-big-calendar/lib/addons/dragAndDrop";
import moment from "moment";
import "moment/locale/pt-br";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import { FaPlus, FaSpinner, FaCog } from "react-icons/fa";
import { Button } from "../../components/ui/Button/Button";
import { AppointmentModal } from "./components/AppointmentModal";
import { EditScheduleModal } from "./components/EditScheduleModal";
import { AppointmentRequestsList } from "./components/AppointmentRequestsList";
import { getAppointmentsByNutritionist } from "../../services/appointmentService";
import { getOrCreateSchedule, getMinMaxWorkingHours, isTimeSlotAvailable } from "../../services/scheduleService";
import { updateAppointment } from "../../services/appointmentService";
import { useAuth } from "../../hooks/useAuth";
import type { Appointment, CalendarEvent } from "../../types/appointment";
import type { NutritionistSchedule } from "../../types/schedule";
import type { User } from "../../types/user";
import "./Agenda.css";

// Configurar locale para português
moment.locale("pt-br");
const localizer = momentLocalizer(moment);
const DnDCalendar = withDragAndDrop<CalendarEvent>(Calendar);

const messages = {
  allDay: "Dia inteiro",
  previous: "Anterior",
  next: "Próximo",
  today: "Hoje",
  month: "Mês",
  week: "Semana",
  day: "Dia",
  agenda: "Agenda",
  date: "Data",
  time: "Horário",
  event: "Evento",
  noEventsInRange: "Nenhum evento no período selecionado",
  showMore: (total: number) => `+ Ver mais ${total}`,
};

type TabType = "agenda" | "requests";

export const Agenda: React.FC = () => {
  const { user, reloadUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<View>("week");
  const [date, setDate] = useState(new Date());
  const [schedule, setSchedule] = useState<NutritionistSchedule | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("agenda");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [initialTime, setInitialTime] = useState<string | undefined>(undefined);

  const loadAppointments = useCallback(async () => {
    if (!user?.uid) return;
    try {
      setLoading(true);
      setError(null);
      const appointments = await getAppointmentsByNutritionist(user.uid);
      setAppointments(appointments);
    } catch (err) {
      console.error("Erro ao carregar agendamentos:", err);
      setError("Erro ao carregar agendamentos. Por favor, tente novamente.");
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  const convertAppointmentsToEvents = useCallback(() => {
    const calendarEvents: CalendarEvent[] = appointments.map((appointment) => {
      const [startHour, startMinute] = appointment.startTime.split(":");
      const [endHour, endMinute] = appointment.endTime.split(":");

      const start = new Date(appointment.date);
      start.setHours(parseInt(startHour), parseInt(startMinute), 0, 0);

      const end = new Date(appointment.date);
      end.setHours(parseInt(endHour), parseInt(endMinute), 0, 0);

      return {
        id: appointment.id,
        title: appointment.clientName,
        start,
        end,
        resource: appointment,
      };
    });
    setEvents(calendarEvents);
  }, [appointments]);

  const loadSchedule = useCallback(async () => {
    if (!user?.uid) return;
    try {
      const scheduleData = await getOrCreateSchedule(user.uid);
      setSchedule(scheduleData);
    } catch (err) {
      console.error("Erro ao carregar configuração de horários:", err);
    }
  }, [user?.uid]);

  useEffect(() => {
    loadAppointments();
    loadSchedule();
  }, [loadAppointments, loadSchedule]);

  useEffect(() => {
    convertAppointmentsToEvents();
  }, [convertAppointmentsToEvents]);

  // Abrir modal automaticamente se vier com ?appointment={id}
  useEffect(() => {
    const appointmentId = searchParams.get("appointment");
    if (!appointmentId || appointments.length === 0) return;
    const found = appointments.find((a) => a.id === appointmentId);
    if (found) {
      setSelectedAppointment(found);
      setSelectedDate(undefined);
      setIsModalOpen(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, appointments, setSearchParams]);

  const handleSelectSlot = ({ start }: { start: Date; end: Date }) => {
    setSelectedAppointment(null);
    
    // Extrair data e horário do slot clicado
    const clickedDate = start;
    const clickedTime = `${String(start.getHours()).padStart(2, '0')}:${String(start.getMinutes()).padStart(2, '0')}`;
    
    setSelectedDate(clickedDate);
    setInitialTime(clickedTime);
    setIsModalOpen(true);
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedAppointment(event.resource);
    setSelectedDate(undefined);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAppointment(null);
    setSelectedDate(undefined);
    setInitialTime(undefined);
  };

  const handleSuccess = () => {
    loadAppointments();
  };

  const handleRequestApprove = () => {
    // Recarregar agenda quando uma solicitação é aprovada
    loadAppointments();
  };

  const handleNewAppointment = () => {
    setSelectedAppointment(null);
    setSelectedDate(new Date());
    setInitialTime(undefined);
    setIsModalOpen(true);
  };

  const handleEditSchedule = () => {
    setIsScheduleModalOpen(true);
  };

  const handleScheduleSuccess = async (updatedUser: User) => {
    // Atualizar o usuário no contexto com os dados atualizados
    reloadUser(updatedUser);
    // Recarregar configuração de horários
    await loadSchedule();
  };

  const slotPropGetter = useCallback((date: Date) => {
    if (!schedule) return {};
    const weekday = date.getDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6;
    const timeStr = `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
    const available = isTimeSlotAvailable(schedule, weekday, timeStr);
    // 5.4 — contraste: disponíveis em branco, indisponíveis em cinza claro
    // com borda sutil para separação visual.
    return available
      ? { style: { backgroundColor: "#FFFFFF" } }
      : {
          style: {
            backgroundColor: "#F9FAFB",
            borderLeft: "1px solid #E5E7EB",
            cursor: "not-allowed",
          },
        };
  }, [schedule]);

  const handleEventDrop = useCallback(async ({ event, start, end }: EventInteractionArgs<CalendarEvent>) => {
    try {
      const s = start instanceof Date ? start : new Date(start);
      const e = end instanceof Date ? end : new Date(end);
      const newDate = new Date(s.getFullYear(), s.getMonth(), s.getDate());
      const startTime = `${String(s.getHours()).padStart(2, "0")}:${String(s.getMinutes()).padStart(2, "0")}`;
      const endTime = `${String(e.getHours()).padStart(2, "0")}:${String(e.getMinutes()).padStart(2, "0")}`;
      await updateAppointment(event.id, { date: newDate, startTime, endTime });
      loadAppointments();
    } catch (err) {
      console.error("Erro ao mover agendamento:", err);
    }
  }, [loadAppointments]);

  const handleEventResize = useCallback(async ({ event, start, end }: EventInteractionArgs<CalendarEvent>) => {
    try {
      const s = start instanceof Date ? start : new Date(start);
      const e = end instanceof Date ? end : new Date(end);
      const startTime = `${String(s.getHours()).padStart(2, "0")}:${String(s.getMinutes()).padStart(2, "0")}`;
      const endTime = `${String(e.getHours()).padStart(2, "0")}:${String(e.getMinutes()).padStart(2, "0")}`;
      await updateAppointment(event.id, { startTime, endTime });
      loadAppointments();
    } catch (err) {
      console.error("Erro ao redimensionar agendamento:", err);
    }
  }, [loadAppointments]);

  const eventStyleGetter = (event: CalendarEvent) => {
    const appointment = event.resource;

    switch (appointment.status) {
      case "pending":
        return {
          style: {
            backgroundColor: "rgba(232, 132, 19, 0.35)",
            borderRadius: "8px",
            color: "#92400e",
            border: "1px dashed #e88413",
            display: "block",
            fontWeight: "500",
            fontSize: "0.875rem",
          },
        };
      case "completed":
        return { style: { backgroundColor: "#10b981", borderRadius: "8px", opacity: 0.9, color: "white", border: "none", display: "block", fontWeight: "500", fontSize: "0.875rem" } };
      case "cancelled":
        return { style: { backgroundColor: "#ef4444", borderRadius: "8px", opacity: 0.9, color: "white", border: "none", display: "block", fontWeight: "500", fontSize: "0.875rem" } };
      case "no-show":
        return { style: { backgroundColor: "#f59e0b", borderRadius: "8px", opacity: 0.9, color: "white", border: "none", display: "block", fontWeight: "500", fontSize: "0.875rem" } };
      default:
        return { style: { backgroundColor: "#e88413", borderRadius: "8px", opacity: 0.9, color: "white", border: "none", display: "block", fontWeight: "500", fontSize: "0.875rem" } };
    }
  };

  if (loading) {
    return (
      <div className="agenda__loading">
        <FaSpinner className="agenda__spinner" />
        <p> Carregando agenda... </p>
      </div>
    );
  }

  const renderCalendar = (isSplitView: boolean = false) => (
    <div className={`agenda__calendar-wrapper ${isSplitView ? "agenda__calendar-wrapper--split" : ""}`}>
      <DnDCalendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        messages={messages}
        view={view}
        onView={setView}
        date={date}
        onNavigate={setDate}
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent}
        selectable
        popup
        eventPropGetter={eventStyleGetter}
        slotPropGetter={slotPropGetter}
        onEventDrop={handleEventDrop}
        onEventResize={handleEventResize}
        resizable
        style={{
          height: isSplitView ? "calc(100vh - 300px)" : "calc(100vh - 250px)",
          minHeight: isSplitView ? "400px" : "600px"
        }}
        views={["month", "week", "day", "agenda"]}
        step={30}
        timeslots={2}
        min={
          schedule
            ? (() => {
                const { minHour } = getMinMaxWorkingHours(schedule);
                return new Date(0, 0, 0, minHour, 0, 0);
              })()
            : user?.workStartTime
            ? (() => {
                const [hour, minute] = user.workStartTime.split(":").map(Number);
                return new Date(0, 0, 0, hour, minute, 0);
              })()
            : new Date(0, 0, 0, 7, 0, 0)
        }
        max={
          schedule
            ? (() => {
                const { maxHour } = getMinMaxWorkingHours(schedule);
                return new Date(0, 0, 0, maxHour, 0, 0);
              })()
            : user?.workEndTime
            ? (() => {
                const [hour, minute] = user.workEndTime.split(":").map(Number);
                return new Date(0, 0, 0, hour, minute, 0);
              })()
            : new Date(0, 0, 0, 20, 0, 0)
        }
        defaultView="week"
        culture="pt-BR"
      />
    </div>
  );

  return (
    <div className="agenda">
      <div className="agenda__header">
        <div>
          <h1 className="agenda__title">Agenda de Consultas</h1>
          <p className="agenda__subtitle">
            Gerencie seus agendamentos e compromissos
          </p>
        </div>
        <div className="agenda__header-actions">
          <Button
            variant="secondary"
            onClick={handleEditSchedule}
            className="agenda__schedule-button"
          >
            <FaCog /> Configurações da agenda
          </Button>
          <Button
            variant="primary"
            onClick={handleNewAppointment}
            className="agenda__add-button"
          >
            <FaPlus /> Novo Agendamento
          </Button>
        </div>
      </div>

      {/* Sistema de Abas */}
      <div className="agenda__tabs">
        <button
          className={`agenda__tab ${
            activeTab === "agenda" ? "agenda__tab--active" : ""
          }`}
          onClick={() => setActiveTab("agenda")}
          type="button"
        >
          Agenda
        </button>
        <button
          className={`agenda__tab ${
            activeTab === "requests" ? "agenda__tab--active" : ""
          }`}
          onClick={() => setActiveTab("requests")}
          type="button"
        >
          Solicitações
        </button>
      </div>

      {error && (
        <div className="agenda__error">
          <p>{error}</p>
          <Button variant="secondary" onClick={loadAppointments}>
            Tentar novamente
          </Button>
        </div>
      )}

      {/* Conteúdo baseado na aba ativa */}
      {activeTab === "agenda" ? (
        <>
          {renderCalendar(false)}
          <div className="agenda__legend">
            <h3 className="agenda__legend-title">Legenda:</h3>
            <div className="agenda__legend-items">
              <div className="agenda__legend-item">
                <span className="agenda__legend-color" style={{ backgroundColor: "#e88413" }}></span>
                <span>Agendado</span>
              </div>
              <div className="agenda__legend-item">
                <span className="agenda__legend-color" style={{ backgroundColor: "rgba(232, 132, 19, 0.35)", border: "1px dashed #e88413" }}></span>
                <span>Solicitação pendente</span>
              </div>
              <div className="agenda__legend-item">
                <span className="agenda__legend-color" style={{ backgroundColor: "#10b981" }}></span>
                <span>Concluído</span>
              </div>
              <div className="agenda__legend-item">
                <span className="agenda__legend-color" style={{ backgroundColor: "#ef4444" }}></span>
                <span>Cancelado</span>
              </div>
              <div className="agenda__legend-item">
                <span className="agenda__legend-color" style={{ backgroundColor: "#f59e0b" }}></span>
                <span>Faltou</span>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="agenda__split-view">
          <div className="agenda__split-view-left">
            {renderCalendar(true)}
          </div>
          <div className="agenda__split-view-right">
            <AppointmentRequestsList onApprove={handleRequestApprove} />
          </div>
        </div>
      )}

      <AppointmentModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleSuccess}
        appointment={selectedAppointment}
        initialDate={selectedDate}
        initialTime={initialTime}
      />

      <EditScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        onSuccess={handleScheduleSuccess}
      />
    </div>
  );
};
