import React, { useState, useEffect } from "react";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSpinner,
  FaArrowUp,
  FaArrowDown,
  FaFilter,
  FaDownload,
  FaCalendarAlt,
  FaUser,
  FaTag,
} from "react-icons/fa";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../../components/ui/Button/Button";
import {
  getTransactionsByNutritionist,
  deleteTransaction,
  getFinancialSummary,
} from "../../services/financialService";
import { getClientsByNutritionist } from "../../services/clientService";
import type { FinancialTransaction } from "../../types/financial";
import type { Client } from "../../types/client";
import { ExpenseModal } from "./components/ExpenseModal";
import { IncomeModal } from "./components/IncomeModal";
import "./Financeiro.css";

export const Financeiro: React.FC = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalPaidIncome: 0,
    totalPendingIncome: 0,
    totalExpense: 0,
    totalPaidExpense: 0,
    totalPendingExpense: 0,
    balance: 0,
    incomeCount: 0,
    expenseCount: 0,
  });
  const [filter, setFilter] = useState<"all" | "income" | "expense">("all");
  const [clientFilter, setClientFilter] = useState<string | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<FinancialTransaction | null>(null);
  const [dateFilter, setDateFilter] = useState<{
    startDate?: string;
    endDate?: string;
  }>({});
  const [quickRange, setQuickRange] = useState<"day" | "week" | "month" | null>(null);

  useEffect(() => {
    loadData();
  }, [user, filter, dateFilter, clientFilter]);

  useEffect(() => {
    const loadClients = async () => {
      if (!user?.uid) return;
      try {
        const clientsData = await getClientsByNutritionist(user.uid);
        setClients(clientsData);
      } catch (error) {
        console.error("Erro ao carregar clientes:", error);
      }
    };
    loadClients();
  }, [user?.uid]);

  const loadData = async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);

      // Preparar filtros de data
      const startDate = dateFilter.startDate
        ? new Date(dateFilter.startDate)
        : undefined;
      const endDate = dateFilter.endDate
        ? new Date(dateFilter.endDate)
        : undefined;

      // Carregar transações
      const transactionsData = await getTransactionsByNutritionist(
        user.uid,
        startDate,
        endDate,
        filter === "all" ? undefined : filter
      );
      setTransactions(transactionsData);

      // Carregar resumo (com mesmo período)
      const summaryData = await getFinancialSummary(
        user.uid,
        startDate,
        endDate
      );
      setSummary(summaryData);
    } catch (error) {
      console.error("Erro ao carregar dados financeiros:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (transactionId: string) => {
    if (
      !window.confirm("Tem certeza que deseja excluir esta transação?")
    ) {
      return;
    }

    try {
      await deleteTransaction(transactionId);
      loadData();
    } catch (error) {
      console.error("Erro ao excluir transação:", error);
      alert("Erro ao excluir transação. Tente novamente.");
    }
  };

  const handleEdit = (transaction: FinancialTransaction) => {
    setEditingTransaction(transaction);
    if (transaction.type === "expense") {
      setShowExpenseModal(true);
    } else {
      setShowIncomeModal(true);
    }
  };

  const handleCloseExpenseModal = () => {
    setShowExpenseModal(false);
    setEditingTransaction(null);
    loadData();
  };

  const handleCloseIncomeModal = () => {
    setShowIncomeModal(false);
    setEditingTransaction(null);
    loadData();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  };

  const handleExportCSV = () => {
    const headers = ["Tipo", "Data", "Descrição", "Valor", "Cliente", "Categoria"];
    const rows = transactions.map((t) => [
      t.type === "income" ? "Receita" : "Despesa",
      formatDate(t.date),
      t.description,
      t.amount.toFixed(2).replace(".", ","),
      t.clientName || "-",
      t.category || "-",
    ]);

    const csvContent = [
      headers.join(";"),
      ...rows.map((row) => row.join(";")),
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `transacoes_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleClearDateFilter = () => {
    setDateFilter({});
    setQuickRange(null);
  };

  const applyQuickRange = (range: "day" | "week" | "month") => {
    const today = new Date();
    let start: Date;
    let end: Date;
    if (range === "day") {
      start = new Date(today);
      end = new Date(today);
    } else if (range === "week") {
      start = new Date(today);
      start.setDate(today.getDate() - today.getDay());
      end = new Date(start);
      end.setDate(start.getDate() + 6);
    } else {
      start = new Date(today.getFullYear(), today.getMonth(), 1);
      end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    }
    const toInputDate = (d: Date) => {
      const yy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      return `${yy}-${mm}-${dd}`;
    };
    setDateFilter({ startDate: toInputDate(start), endDate: toInputDate(end) });
    setQuickRange(range);
  };

  if (loading) {
    return (
      <div className="financeiro__loading">
        <FaSpinner className="financeiro__spinner" />
        <p>Carregando dados financeiros...</p>
      </div>
    );
  }

  return (
    <div className="financeiro">
      <div className="financeiro__header">
        <div>
          <h1 className="financeiro__title">Financeiro</h1>
          <p className="financeiro__subtitle">
            Gerencie suas receitas e despesas
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <Button
            variant="primary"
            onClick={() => {
              setEditingTransaction(null);
              setShowIncomeModal(true);
            }}
            className="financeiro__add-button"
          >
            <FaPlus /> Adicionar Receita
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              setEditingTransaction(null);
              setShowExpenseModal(true);
            }}
            className="financeiro__add-button"
          >
            <FaPlus /> Adicionar Despesa
          </Button>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="financeiro__summary">
        <div className="financeiro__summary-card financeiro__summary-card--income">
          <div className="financeiro__summary-header">
            <FaArrowUp />
            <span>Receitas Pagas</span>
          </div>
          <div className="financeiro__summary-value">
            {formatCurrency(summary.totalPaidIncome)}
          </div>
          <div className="financeiro__summary-count">
            {summary.incomeCount} {summary.incomeCount === 1 ? "transação" : "transações"}
          </div>
          {summary.totalPendingIncome > 0 && (
            <div className="financeiro__summary-avg">
              A receber: {formatCurrency(summary.totalPendingIncome)}
            </div>
          )}
        </div>

        <div className="financeiro__summary-card financeiro__summary-card--expense">
          <div className="financeiro__summary-header">
            <FaArrowDown />
            <span>Despesas Pagas</span>
          </div>
          <div className="financeiro__summary-value">
            {formatCurrency(summary.totalPaidExpense)}
          </div>
          <div className="financeiro__summary-count">
            {summary.expenseCount} {summary.expenseCount === 1 ? "transação" : "transações"}
          </div>
          {summary.totalPendingExpense > 0 && (
            <div className="financeiro__summary-avg">
              Pendente: {formatCurrency(summary.totalPendingExpense)}
            </div>
          )}
        </div>

        <div className="financeiro__summary-card financeiro__summary-card--balance">
          <div className="financeiro__summary-header">
            <span>Saldo Real</span>
          </div>
          <div className="financeiro__summary-value">
            {formatCurrency(summary.balance)}
          </div>
          <div className="financeiro__summary-count">
            {summary.balance > 0 ? "Positivo" : summary.balance < 0 ? "Negativo" : "Neutro"}
          </div>
          {summary.totalPendingIncome > 0 && (
            <div className="financeiro__summary-avg">
              Projeção: {formatCurrency(summary.balance + summary.totalPendingIncome)}
            </div>
          )}
        </div>
      </div>

      {/* Filtros */}
      <div className="financeiro__filters">
        <div className="financeiro__filter-group">
          <FaFilter size={16} />
          <span className="financeiro__filter-label">Filtrar:</span>
          <div className="financeiro__filter-buttons">
            <button
              className={`financeiro__filter-btn ${
                filter === "all" ? "financeiro__filter-btn--active" : ""
              }`}
              onClick={() => setFilter("all")}
            >
              Todas
            </button>
            <button
              className={`financeiro__filter-btn ${
                filter === "income" ? "financeiro__filter-btn--active" : ""
              }`}
              onClick={() => setFilter("income")}
            >
              Receitas
            </button>
            <button
              className={`financeiro__filter-btn ${
                filter === "expense" ? "financeiro__filter-btn--active" : ""
              }`}
              onClick={() => setFilter("expense")}
            >
              Despesas
            </button>
          </div>
        </div>

        <div className="financeiro__filter-group">
          <FaUser size={16} />
          <span className="financeiro__filter-label">Cliente:</span>
          <select
            className="financeiro__date-input"
            value={clientFilter || ""}
            onChange={(e) => setClientFilter(e.target.value || null)}
            style={{ minWidth: "200px" }}
          >
            <option value="">Todos os clientes</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.fullName}
              </option>
            ))}
          </select>
          {clientFilter && (
            <button
              className="financeiro__filter-btn financeiro__filter-btn--clear"
              onClick={() => setClientFilter(null)}
              title="Limpar filtro de cliente"
              style={{ marginLeft: "0.5rem" }}
            >
              Limpar
            </button>
          )}
        </div>

        <div className="financeiro__filter-group">
          <FaCalendarAlt size={16} />
          <span className="financeiro__filter-label">Período:</span>
          <div className="financeiro__filter-buttons">
            <button
              className={`financeiro__filter-btn ${
                quickRange === "day" ? "financeiro__filter-btn--active" : ""
              }`}
              onClick={() => applyQuickRange("day")}
            >
              Hoje
            </button>
            <button
              className={`financeiro__filter-btn ${
                quickRange === "week" ? "financeiro__filter-btn--active" : ""
              }`}
              onClick={() => applyQuickRange("week")}
            >
              Semana
            </button>
            <button
              className={`financeiro__filter-btn ${
                quickRange === "month" ? "financeiro__filter-btn--active" : ""
              }`}
              onClick={() => applyQuickRange("month")}
            >
              Mês
            </button>
          </div>
          <div className="financeiro__date-inputs">
            <input
              type="date"
              className="financeiro__date-input"
              value={dateFilter.startDate || ""}
              onChange={(e) => {
                setQuickRange(null);
                setDateFilter({ ...dateFilter, startDate: e.target.value });
              }}
              placeholder="Data inicial"
            />
            <span className="financeiro__date-separator">até</span>
            <input
              type="date"
              className="financeiro__date-input"
              value={dateFilter.endDate || ""}
              onChange={(e) => {
                setQuickRange(null);
                setDateFilter({ ...dateFilter, endDate: e.target.value });
              }}
              placeholder="Data final"
            />
            {(dateFilter.startDate || dateFilter.endDate) && (
              <button
                className="financeiro__filter-btn financeiro__filter-btn--clear"
                onClick={handleClearDateFilter}
                title="Limpar filtro de data"
              >
                Limpar
              </button>
            )}
          </div>
        </div>

        <div className="financeiro__filter-group financeiro__filter-group--export">
          <Button
            variant="secondary"
            size="small"
            onClick={handleExportCSV}
            disabled={transactions.length === 0}
            className="financeiro__export-btn"
          >
            <FaDownload /> Exportar CSV
          </Button>
        </div>
      </div>

      {/* Lista de Transações */}
      <div className="financeiro__transactions">
        {transactions.length === 0 ? (
          <div className="financeiro__empty">
            <p>Nenhuma transação encontrada</p>
            <p className="financeiro__empty-subtitle">
              {filter === "all"
                ? "Adicione uma despesa ou aguarde receitas de consultas realizadas"
                : filter === "income"
                ? "Receitas são criadas automaticamente quando você marca uma consulta como realizada"
                : "Adicione sua primeira despesa clicando no botão acima"}
            </p>
          </div>
        ) : (
          <div className="financeiro__transactions-list">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className={`financeiro__transaction financeiro__transaction--${transaction.type}`}
              >
                <div className="financeiro__transaction-info">
                  <div className="financeiro__transaction-header">
                    <span className="financeiro__transaction-type">
                      {transaction.type === "income" ? (
                        <FaArrowUp />
                      ) : (
                        <FaArrowDown />
                      )}
                      {transaction.type === "income" ? "Receita" : "Despesa"}
                    </span>
                    <span className="financeiro__transaction-date">
                      {formatDate(transaction.date)}
                    </span>
                  </div>
                  <div className="financeiro__transaction-description">
                    {transaction.description}
                  </div>
                  {transaction.clientName && (
                    <div className="financeiro__transaction-client">
                      <FaUser size={12} />
                      <span>Cliente: {transaction.clientName}</span>
                    </div>
                  )}
                  {transaction.paymentStatus && (
                    <div
                      className={`financeiro__transaction-status financeiro__transaction-status--${transaction.paymentStatus}`}
                    >
                      <span>
                        {transaction.paymentStatus === "paid"
                          ? "✓ Pago"
                          : "⏳ Pendente"}
                      </span>
                    </div>
                  )}
                  {transaction.category && (
                    <div className="financeiro__transaction-category">
                      <FaTag size={12} />
                      <span>Categoria: {transaction.category}</span>
                    </div>
                  )}
                </div>
                <div className="financeiro__transaction-actions">
                  <div className="financeiro__transaction-value">
                    {transaction.type === "income" ? "+" : "-"}
                    {formatCurrency(transaction.amount)}
                  </div>
                  <div className="financeiro__transaction-buttons">
                    <button
                      className="financeiro__transaction-btn financeiro__transaction-btn--edit"
                      onClick={() => handleEdit(transaction)}
                      title="Editar"
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="financeiro__transaction-btn financeiro__transaction-btn--delete"
                      onClick={() => handleDelete(transaction.id)}
                      title="Excluir"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Despesa */}
      {showExpenseModal && (
        <ExpenseModal
          transaction={editingTransaction}
          onClose={handleCloseExpenseModal}
        />
      )}

      {/* Modal de Receita */}
      {showIncomeModal && (
        <IncomeModal
          transaction={editingTransaction}
          onClose={handleCloseIncomeModal}
        />
      )}
    </div>
  );
};

