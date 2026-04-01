import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { useAuth } from "../../../hooks/useAuth";
import { getAppointmentsByClientAuthUid } from "../../../services/appointmentService";
import { FaSpinner } from "react-icons/fa";
import "./AppointmentStatusChart.css";

interface StatusData {
  name: string;
  value: number;
  color: string;
  [key: string]: string | number;
}

export const ClientAppointmentStatusChart: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<StatusData[]>([]);

  useEffect(() => {
    const loadData = async () => {
      if (!user?.uid) return;

      try {
        setLoading(true);
        const appointments = await getAppointmentsByClientAuthUid(user.uid);

        // Contar por status
        const statusCount: Record<string, number> = {
          scheduled: 0,
          completed: 0,
          cancelled: 0,
          pending: 0,
        };

        appointments.forEach((apt) => {
          if (apt.status in statusCount) {
            statusCount[apt.status]++;
          }
        });

        const chartData: StatusData[] = [
          {
            name: "Agendadas",
            value: statusCount.scheduled,
            color: "#3b82f6",
          },
          {
            name: "Pendentes",
            value: statusCount.pending,
            color: "#f59e0b",
          },
          {
            name: "Concluídas",
            value: statusCount.completed,
            color: "#e88413",
          },
          {
            name: "Canceladas",
            value: statusCount.cancelled,
            color: "#ef4444",
          },
        ].filter((item) => item.value > 0); // Remover status sem consultas

        setData(chartData);
      } catch (error) {
        console.error("Erro ao carregar dados de status:", error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  if (loading) {
    return (
      <div className="appointment-status-chart">
        <div className="appointment-status-chart__loading">
          <FaSpinner className="spinner" />
          <p>Carregando dados...</p>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="appointment-status-chart">
        <div className="appointment-status-chart__empty">
          <p>Não há dados de consultas disponíveis</p>
        </div>
      </div>
    );
  }

  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="appointment-status-chart">
      <div className="appointment-status-chart__header">
        <h3 className="appointment-status-chart__title">Status das Minhas Consultas</h3>
        <p className="appointment-status-chart__subtitle">Total: {total} consultas</p>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={(props: any) => {
              const entry = props as StatusData & { percent?: number };
              return entry.percent ? `${entry.name}: ${(entry.percent * 100).toFixed(0)}%` : entry.name;
            }}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
