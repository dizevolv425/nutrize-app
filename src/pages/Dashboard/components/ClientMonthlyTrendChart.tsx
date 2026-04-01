import React, { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useAuth } from "../../../hooks/useAuth";
import { getAppointmentsByClientAuthUid } from "../../../services/appointmentService";
import { FaSpinner } from "react-icons/fa";
import "./MonthlyTrendChart.css";

interface MonthlyData {
  month: string;
  consultas: number;
}

export const ClientMonthlyTrendChart: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<MonthlyData[]>([]);

  useEffect(() => {
    const loadData = async () => {
      if (!user?.uid) return;

      try {
        setLoading(true);
        const appointments = await getAppointmentsByClientAuthUid(user.uid);

        // Agrupar por mês (últimos 6 meses)
        const now = new Date();
        const monthsData: Record<string, number> = {};

        // Inicializar últimos 6 meses
        for (let i = 5; i >= 0; i--) {
          const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
          monthsData[monthKey] = 0;
        }

        // Contar consultas por mês
        appointments.forEach((apt) => {
          const aptDate = apt.date;
          const monthKey = `${aptDate.getFullYear()}-${String(aptDate.getMonth() + 1).padStart(2, "0")}`;
          if (monthsData.hasOwnProperty(monthKey)) {
            monthsData[monthKey]++;
          }
        });

        // Converter para formato do gráfico
        const chartData: MonthlyData[] = Object.keys(monthsData)
          .sort()
          .map((key) => {
            const [year, month] = key.split("-");
            const date = new Date(parseInt(year), parseInt(month) - 1, 1);
            return {
              month: date.toLocaleDateString("pt-BR", { month: "short", year: "numeric" }),
              consultas: monthsData[key],
            };
          });

        setData(chartData);
      } catch (error) {
        console.error("Erro ao carregar dados mensais:", error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  if (loading) {
    return (
      <div className="monthly-trend-chart">
        <div className="monthly-trend-chart__loading">
          <FaSpinner className="spinner" />
          <p>Carregando dados...</p>
        </div>
      </div>
    );
  }

  if (data.length === 0 || data.every((d) => d.consultas === 0)) {
    return (
      <div className="monthly-trend-chart">
        <div className="monthly-trend-chart__empty">
          <p>Não há dados de consultas disponíveis</p>
        </div>
      </div>
    );
  }

  return (
    <div className="monthly-trend-chart">
      <div className="monthly-trend-chart__header">
        <h3 className="monthly-trend-chart__title">Evolução das Minhas Consultas</h3>
        <p className="monthly-trend-chart__subtitle">Últimos 6 meses</p>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="consultas"
            stroke="#e88413"
            strokeWidth={3}
            name="Consultas"
            dot={{ fill: "#e88413", r: 5 }}
            activeDot={{ r: 7 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
