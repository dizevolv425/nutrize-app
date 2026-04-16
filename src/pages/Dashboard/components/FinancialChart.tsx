import React, { useState, useEffect } from "react";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { FaArrowUp, FaArrowDown, FaChartLine, FaSpinner } from "react-icons/fa";
import { useAuth } from "../../../hooks/useAuth";
import {
  getFinancialSummary,
  getMonthlyFinancialData,
} from "../../../services/financialService";
import { getUpcomingAppointments } from "../../../services/appointmentService";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../lib/firebaseconfig";
import type { MonthlyFinancialData } from "../../../types/financial";
import type { User } from "../../../types/user";
import "./FinancialChart.css";

export const FinancialChart: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    incomeCount: 0,
    expenseCount: 0,
  });
  const [monthlyData, setMonthlyData] = useState<MonthlyFinancialData[]>([]);
  const [projection, setProjection] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      if (!user?.uid) return;

      try {
        setLoading(true);

        // Carregar resumo financeiro (últimos 6 meses)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        const summaryData = await getFinancialSummary(
          user.uid,
          sixMonthsAgo
        );
        setSummary(summaryData);

        // Carregar dados mensais
        const monthly = await getMonthlyFinancialData(user.uid, 6);
        setMonthlyData(monthly);

        // Calcular projeção baseada em consultas futuras
        const upcomingAppointments = await getUpcomingAppointments(user.uid, 30);
        // Buscar valor padrão do perfil do nutricionista
        let consultationValue = 200; // Valor padrão fallback
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data() as User;
            if (userData.defaultConsultationValue) {
              consultationValue = userData.defaultConsultationValue;
            }
          }
        } catch (error) {
          console.warn("Erro ao buscar valor padrão de consulta:", error);
        }
        const projectionValue =
          upcomingAppointments.filter((a) => a.status === "scheduled").length *
          consultationValue;
        setProjection(projectionValue);
      } catch (error) {
        console.error("Erro ao carregar dados financeiros:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  // Preparar dados para o gráfico
  const chartData = monthlyData.map((month) => ({
    mes: month.month,
    receber: month.income,
    pagar: month.expense,
    projecao: month.projection || 0,
  }));

  // Adicionar projeção apenas no último mês futuro
  if (chartData.length > 0 && projection > 0) {
    const lastMonth = chartData[chartData.length - 1];
    if (lastMonth.receber === 0 && lastMonth.pagar === 0) {
      lastMonth.projecao = projection;
    }
  }

  const hasChartData = chartData.some(
    (d) => d.receber > 0 || d.pagar > 0 || d.projecao > 0
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  if (loading) {
    return (
      <div className="financial-chart__loading">
        <FaSpinner className="financial-chart__spinner" />
        <p>Carregando dados financeiros...</p>
      </div>
    );
  }

  return (
    <div className="financial-chart">
      <div className="financial-chart__cards">
        <div className="financial-chart__card financial-chart__card--income">
          <div className="financial-chart__card-header">
            <FaArrowUp size={16} />
            <p className="financial-chart__card-label">Receitas</p>
          </div>
          <p className="financial-chart__card-value">
            {formatCurrency(summary.totalIncome)}
          </p>
          <p className="financial-chart__card-subtitle">
            {summary.incomeCount} {summary.incomeCount === 1 ? "transação" : "transações"}
          </p>
        </div>

        <div className="financial-chart__card financial-chart__card--expense">
          <div className="financial-chart__card-header">
            <FaArrowDown size={16} />
            <p className="financial-chart__card-label">Despesas</p>
          </div>
          <p className="financial-chart__card-value">
            {formatCurrency(summary.totalExpense)}
          </p>
          <p className="financial-chart__card-subtitle">
            {summary.expenseCount} {summary.expenseCount === 1 ? "transação" : "transações"}
          </p>
        </div>

        <div className="financial-chart__card financial-chart__card--balance">
          <div className="financial-chart__card-header">
            <FaChartLine size={16} />
            <p className="financial-chart__card-label">Saldo</p>
          </div>
          <p className="financial-chart__card-value">
            {formatCurrency(summary.balance)}
          </p>
          <p className="financial-chart__card-subtitle">
            {summary.balance > 0 ? "Positivo" : "Negativo"}
          </p>
        </div>

        <div className="financial-chart__card financial-chart__card--projection">
          <div className="financial-chart__card-header">
            <FaChartLine size={16} />
            <p className="financial-chart__card-label">Projeções de receita</p>
          </div>
          <p className="financial-chart__card-value">
            {formatCurrency(projection)}
          </p>
        </div>
      </div>

      {hasChartData ? (
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="mes" stroke="#6b7280" style={{ fontSize: "12px" }} />
            <YAxis
              stroke="#6b7280"
              style={{ fontSize: "12px" }}
              tickFormatter={(value) => `R$ ${value / 1000}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              }}
              formatter={(value: number) => formatCurrency(value)}
            />
            <Legend />
            <Bar
              dataKey="receber"
              fill="#10b981"
              name="A Receber"
              radius={[8, 8, 0, 0]}
            />
            <Bar
              dataKey="pagar"
              fill="#ef4444"
              name="A Pagar"
              radius={[8, 8, 0, 0]}
            />
            <Line
              type="monotone"
              dataKey="projecao"
              stroke="#f59e0b"
              strokeWidth={2}
              name="Projeção"
              strokeDasharray="5 5"
            />
          </ComposedChart>
        </ResponsiveContainer>
      ) : (
        <div className="financial-chart__empty">
          <p>Sem dados financeiros no período.</p>
          <p className="financial-chart__empty-subtitle">
            Registre receitas e despesas no Financeiro para ver o gráfico.
          </p>
        </div>
      )}
    </div>
  );
};
