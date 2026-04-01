import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { getEngagementData } from "../../../services/masterDashboardService";
import { FaSpinner } from "react-icons/fa";
import "./EngagementChart.css";

export const EngagementChart: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const engagementData = await getEngagementData(12);
        setData(engagementData);
      } catch (err) {
        console.error("Erro ao carregar dados de engajamento:", err);
        setError("Erro ao carregar dados");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="engagement-chart__loading">
        <FaSpinner className="spinner" />
        <p>Carregando dados de engajamento...</p>
      </div>
    );
  }

  if (error || data.length === 0) {
    return (
      <div className="engagement-chart__error">
        <p>{error || "Não há dados de engajamento disponíveis"}</p>
      </div>
    );
  }

  // Formatar dados para o gráfico
  const chartData = data.map((item) => ({
    month: `${item.month}/${item.year.toString().slice(-2)}`,
    "Agendamentos": item.appointments,
    "Dietas Salvas": item.diets,
  }));

  return (
    <div className="engagement-chart">
      <div className="engagement-chart__header">
        <h3 className="engagement-chart__title">Engajamento do Sistema</h3>
        <p className="engagement-chart__subtitle">
          Total de Agendamentos e Dietas Salvas (Últimos 12 meses)
        </p>
      </div>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="month"
            stroke="#6b7280"
            style={{ fontSize: "0.875rem" }}
          />
          <YAxis stroke="#6b7280" style={{ fontSize: "0.875rem" }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            }}
          />
          <Legend
            wrapperStyle={{ paddingTop: "1rem" }}
            iconType="line"
          />
          <Line
            type="monotone"
            dataKey="Agendamentos"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ fill: "#3b82f6", r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="Dietas Salvas"
            stroke="#e88413"
            strokeWidth={2}
            dot={{ fill: "#e88413", r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
