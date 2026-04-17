import React, { useState, useEffect } from "react";
import { FaTimes, FaSpinner, FaUser } from "react-icons/fa";
import { useAuth } from "../../../hooks/useAuth";
import { Button } from "../../../components/ui/Button/Button";
import {
  createIncome,
  updateTransaction,
} from "../../../services/financialService";
import { getClientsByNutritionist } from "../../../services/clientService";
import type { FinancialTransaction } from "../../../types/financial";
import type { Client } from "../../../types/client";
import "./IncomeModal.css";

interface IncomeModalProps {
  transaction: FinancialTransaction | null;
  onClose: () => void;
}

export const IncomeModal: React.FC<IncomeModalProps> = ({
  transaction,
  onClose,
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    clientId: "",
    clientName: "",
    paymentStatus: "pending" as "paid" | "pending",
  });

  useEffect(() => {
    const loadClients = async () => {
      if (!user?.uid) return;
      try {
        setLoadingClients(true);
        const clientsData = await getClientsByNutritionist(user.uid);
        setClients(clientsData);
      } catch (error) {
        console.error("Erro ao carregar clientes:", error);
      } finally {
        setLoadingClients(false);
      }
    };

    loadClients();
  }, [user?.uid]);

  useEffect(() => {
    if (transaction) {
      setFormData({
        amount: transaction.amount.toString(),
        description: transaction.description,
        date: transaction.date.toISOString().split("T")[0],
        clientId: transaction.clientId || "",
        clientName: transaction.clientName || "",
        paymentStatus: transaction.paymentStatus || "pending",
      });
    }
  }, [transaction]);

  const handleClientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedClientId = e.target.value;
    const selectedClient = clients.find((c) => c.id === selectedClientId);
    
    setFormData({
      ...formData,
      clientId: selectedClientId,
      clientName: selectedClient?.fullName || "",
    });
  };

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
        // Editar receita existente
        await updateTransaction(transaction.id, {
          amount,
          description: formData.description.trim(),
          date: new Date(formData.date),
          clientId: formData.clientId || undefined,
          clientName: formData.clientName || undefined,
          paymentStatus: formData.paymentStatus,
        });
      } else {
        // Criar nova receita
        await createIncome({
          nutritionistId: user.uid,
          amount,
          description: formData.description.trim(),
          date: new Date(formData.date),
          clientId: formData.clientId || undefined,
          clientName: formData.clientName || undefined,
          paymentStatus: formData.paymentStatus,
        });
      }

      onClose();
    } catch (err) {
      console.error("Erro ao salvar receita:", err);
      setError("Erro ao salvar receita. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="income-modal__overlay" onClick={onClose}>
      <div
        className="income-modal__content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="income-modal__header">
          <h2 className="income-modal__title">
            {transaction ? "Editar Receita" : "Nova Receita"}
          </h2>
          <button
            className="income-modal__close"
            onClick={onClose}
            disabled={loading}
          >
            <FaTimes />
          </button>
        </div>

        {error && (
          <div className="income-modal__error">
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="income-modal__form">
          <div className="income-modal__field">
            <label className="income-modal__label">
              Valor (R$) <span className="income-modal__required">*</span>
            </label>
            <input
              type="number"
              className="income-modal__input"
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

          <div className="income-modal__field">
            <label className="income-modal__label">
              Descrição <span className="income-modal__required">*</span>
            </label>
            <input
              type="text"
              className="income-modal__input"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Ex: Consulta com João Silva"
              required
              disabled={loading}
            />
          </div>

          <div className="income-modal__field">
            <label className="income-modal__label">
              Data <span className="income-modal__required">*</span>
            </label>
            <input
              type="date"
              className="income-modal__input"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              required
              disabled={loading}
            />
          </div>

          <div className="income-modal__field">
            <label className="income-modal__label">
              <FaUser size={14} style={{ marginRight: "4px" }} />
              Paciente (opcional)
            </label>
            <select
              className="income-modal__input"
              value={formData.clientId}
              onChange={handleClientChange}
              disabled={loading || loadingClients}
            >
              <option value="">Selecione um paciente...</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.fullName}
                </option>
              ))}
            </select>
          </div>

          <div className="income-modal__field">
            <label className="income-modal__label">
              Status do Pagamento <span className="income-modal__required">*</span>
            </label>
            <select
              className="income-modal__input"
              value={formData.paymentStatus}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  paymentStatus: e.target.value as "paid" | "pending",
                })
              }
              required
              disabled={loading}
            >
              <option value="pending">Pendente</option>
              <option value="paid">Pago</option>
            </select>
          </div>

          <div className="income-modal__actions">
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
                  <FaSpinner className="income-modal__spinner" /> Salvando...
                </>
              ) : transaction ? (
                "Salvar Alterações"
              ) : (
                "Adicionar Receita"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
