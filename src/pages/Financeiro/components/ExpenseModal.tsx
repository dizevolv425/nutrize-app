import React, { useState, useEffect } from "react";
import { FaTimes, FaSpinner } from "react-icons/fa";
import { useAuth } from "../../../hooks/useAuth";
import { Button } from "../../../components/ui/Button/Button";
import {
  createExpense,
  updateTransaction,
} from "../../../services/financialService";
import type { FinancialTransaction } from "../../../types/financial";
import "./ExpenseModal.css";

interface ExpenseModalProps {
  transaction: FinancialTransaction | null;
  onClose: () => void;
}

export const ExpenseModal: React.FC<ExpenseModalProps> = ({
  transaction,
  onClose,
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    category: "",
    paymentStatus: "paid" as "paid" | "pending",
    isRecurring: false,
    recurrenceFrequency: "monthly" as "weekly" | "monthly",
    recurrenceEndDate: "",
  });

  useEffect(() => {
    if (transaction) {
      setFormData({
        amount: transaction.amount.toString(),
        description: transaction.description,
        date: transaction.date.toISOString().split("T")[0],
        category: transaction.category || "",
        paymentStatus: transaction.paymentStatus || "paid",
        isRecurring: transaction.isRecurring || false,
        recurrenceFrequency: transaction.recurrenceFrequency || "monthly",
        recurrenceEndDate: "",
      });
    }
  }, [transaction]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid) return;

    setError(null);

    // Validações
    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      setError("Valor deve ser maior que zero");
      return;
    }

    if (!formData.description.trim()) {
      setError("Descrição é obrigatória");
      return;
    }

    try {
      setLoading(true);

      if (transaction) {
        // Editar despesa existente
        await updateTransaction(transaction.id, {
          amount,
          description: formData.description.trim(),
          date: new Date(formData.date + "T00:00:00"),
          category: formData.category.trim() || undefined,
          paymentStatus: formData.paymentStatus,
        });
      } else {
        // Criar nova despesa
        await createExpense({
          nutritionistId: user.uid,
          amount,
          description: formData.description.trim(),
          date: new Date(formData.date + "T00:00:00"),
          category: formData.category.trim() || undefined,
          paymentStatus: formData.paymentStatus,
          isRecurring: formData.isRecurring,
          recurrenceFrequency: formData.isRecurring ? formData.recurrenceFrequency : undefined,
          recurrenceEndDate: formData.isRecurring && formData.recurrenceEndDate
            ? new Date(formData.recurrenceEndDate + "T00:00:00")
            : undefined,
        });
      }

      onClose();
    } catch (err) {
      console.error("Erro ao salvar despesa:", err);
      setError("Erro ao salvar despesa. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="expense-modal__overlay" onClick={onClose}>
      <div
        className="expense-modal__content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="expense-modal__header">
          <h2 className="expense-modal__title">
            {transaction ? "Editar Despesa" : "Nova Despesa"}
          </h2>
          <button
            className="expense-modal__close"
            onClick={onClose}
            disabled={loading}
          >
            <FaTimes />
          </button>
        </div>

        {error && (
          <div className="expense-modal__error">
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="expense-modal__form">
          <div className="expense-modal__field">
            <label className="expense-modal__label">
              Valor (R$) <span className="expense-modal__required">*</span>
            </label>
            <input
              type="number"
              className="expense-modal__input"
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: e.target.value })
              }
              placeholder="0.00"
              min="0"
              step="0.01"
              required
              disabled={loading}
            />
          </div>

          <div className="expense-modal__field">
            <label className="expense-modal__label">
              Descrição <span className="expense-modal__required">*</span>
            </label>
            <input
              type="text"
              className="expense-modal__input"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Ex: Aluguel do consultório"
              required
              disabled={loading}
            />
          </div>

          <div className="expense-modal__field">
            <label className="expense-modal__label">
              Data <span className="expense-modal__required">*</span>
            </label>
            <input
              type="date"
              className="expense-modal__input"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              required
              disabled={loading}
            />
          </div>

          <div className="expense-modal__field">
            <label className="expense-modal__label">Categoria (opcional)</label>
            <input
              type="text"
              className="expense-modal__input"
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              placeholder="Ex: Aluguel, Material, Marketing"
              disabled={loading}
            />
          </div>

          <div className="expense-modal__field">
            <label className="expense-modal__label">
              Status <span className="expense-modal__required">*</span>
            </label>
            <select
              className="expense-modal__input"
              value={formData.paymentStatus}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  paymentStatus: e.target.value as "paid" | "pending",
                })
              }
              disabled={loading}
            >
              <option value="paid">Pago</option>
              <option value="pending">Pendente</option>
            </select>
          </div>

          {!transaction && (
            <div className="expense-modal__field">
              <label className="expense-modal__label expense-modal__label--toggle">
                <input
                  type="checkbox"
                  checked={formData.isRecurring}
                  onChange={(e) =>
                    setFormData({ ...formData, isRecurring: e.target.checked })
                  }
                  disabled={loading}
                  className="expense-modal__checkbox"
                />
                Despesa recorrente
              </label>
            </div>
          )}

          {!transaction && formData.isRecurring && (
            <>
              <div className="expense-modal__field">
                <label className="expense-modal__label">Frequência</label>
                <select
                  className="expense-modal__input"
                  value={formData.recurrenceFrequency}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      recurrenceFrequency: e.target.value as "weekly" | "monthly",
                    })
                  }
                  disabled={loading}
                >
                  <option value="monthly">Mensal</option>
                  <option value="weekly">Semanal</option>
                </select>
              </div>
              <div className="expense-modal__field">
                <label className="expense-modal__label">
                  Repetir até <span className="expense-modal__required">*</span>
                </label>
                <input
                  type="date"
                  className="expense-modal__input"
                  value={formData.recurrenceEndDate}
                  onChange={(e) =>
                    setFormData({ ...formData, recurrenceEndDate: e.target.value })
                  }
                  min={formData.date}
                  required={formData.isRecurring}
                  disabled={loading}
                />
              </div>
            </>
          )}

          <div className="expense-modal__actions">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? (
                <>
                  <FaSpinner className="expense-modal__spinner" /> Salvando...
                </>
              ) : transaction ? (
                "Salvar Alterações"
              ) : (
                "Adicionar Despesa"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

