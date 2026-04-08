export type TransactionType = "income" | "expense";

export interface FinancialTransaction {
  id: string;
  nutritionistId: string;
  type: TransactionType;
  amount: number; // valor em reais
  description: string;
  date: Date;
  // Para receitas (income)
  appointmentId?: string; // ID da consulta que gerou a receita
  clientId?: string; // ID do cliente (se vinculado a consulta)
  clientName?: string; // Nome do cliente (para facilitar visualização)
  paymentStatus?: "paid" | "pending"; // Status do pagamento (pago/pendente)
  // Para despesas (expense)
  category?: string; // categoria da despesa (opcional)
  isRecurring?: boolean;
  recurrenceFrequency?: "weekly" | "monthly";
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateIncomeData {
  nutritionistId: string;
  amount: number;
  description: string;
  date: Date;
  appointmentId?: string;
  clientId?: string;
  clientName?: string;
  paymentStatus?: "paid" | "pending";
}

export interface CreateExpenseData {
  nutritionistId: string;
  amount: number;
  description: string;
  date: Date;
  category?: string;
  paymentStatus?: "paid" | "pending";
  isRecurring?: boolean;
  recurrenceFrequency?: "weekly" | "monthly";
  recurrenceEndDate?: Date;
}

export interface UpdateTransactionData {
  amount?: number;
  description?: string;
  date?: Date;
  category?: string;
  paymentStatus?: "paid" | "pending";
  clientId?: string;
  clientName?: string;
}

export interface FinancialSummary {
  totalIncome: number;
  totalPaidIncome: number;
  totalPendingIncome: number;
  totalExpense: number;
  totalPaidExpense: number;
  totalPendingExpense: number;
  balance: number; // totalPaidIncome - totalPaidExpense
  incomeCount: number;
  expenseCount: number;
}

export interface MonthlyFinancialData {
  month: string; // "Jan", "Fev", etc.
  monthIndex: number; // 0-11
  year: number;
  income: number;
  expense: number;
  projection?: number; // projeção baseada em consultas futuras
}

