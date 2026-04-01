import React, { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useAuth } from "../../../hooks/useAuth";
import { getAppointmentsByClientAuthUid } from "../../../services/appointmentService";
import { FaSpinner } from "react-icons/fa";
import "./WeeklyAppointmentsChart.css";

interface DayData {
  day: string;
  consultas: number;
}

const DAYS_OF_WEEK = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export const ClientWeeklyAppointmentsChart: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DayData[]>([]);

  useEffect(() => {
    const loadData = async () => {
      if (!user?.uid) return;

      try {
        setLoading(true);
        const appointments = await getAppointmentsByClientAuthUid(user.uid);

        // Inicializar contadores para cada dia da semana
        const dayCount: Record<number, number> = {
          0: 0, // Domingo
          1: 0, // Segunda
          2: 0, // Terça
          3: 0, // Quarta
          4: 0, // Quinta
          5: 0, // Sexta
          6: 0, // Sábado
        };

        // Contar consultas por dia da semana
        appointments.forEach((apt) => {
          const dayOfWeek = apt.date.getDay();
          dayCount[dayOfWeek]++;
        });

        // Converter para formato do gráfico
        const chartData: DayData[] = DAYS_OF_WEEK.map((dayName, index) => ({
          day: dayName,
          consultas: dayCount[index],
        }));

        setData(chartData);
      } catch (error) {
        console.error("Erro ao carregar dados semanais:", error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  if (loading) {
    return (
      <div className="weekly-appointments-chart">
        <div className="weekly-appointments-chart__loading">
          <FaSpinner className="spinner" />
          <p>Carregando dados...</p>
        </div>
      </div>
    );
  }

  if (data.length === 0 || data.every((d) => d.consultas === 0)) {
    return (
      <div className="weekly-appointments-chart">
        <div className="weekly-appointments-chart__empty">
          <p>Não há dados de consultas disponíveis</p>
        </div>
      </div>
    );
  }

  return (
    <div className="weekly-appointments-chart">
      <div className="weekly-appointments-chart__header">
        <h3 className="weekly-appointments-chart__title">Minhas Consultas por Dia da Semana</h3>
        <p className="weekly-appointments-chart__subtitle">
          Distribuição das minhas consultas ao longo da semana
        </p>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="consultas" fill="#e88413" name="Consultas" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
