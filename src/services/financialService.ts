import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  Timestamp,
  limit,
} from "firebase/firestore";
import { db } from "../lib/firebaseconfig";
import type {
  FinancialTransaction,
  CreateIncomeData,
  CreateExpenseData,
  UpdateTransactionData,
  FinancialSummary,
  MonthlyFinancialData,
} from "../types/financial";

const TRANSACTIONS_COLLECTION = "financialTransactions";

// ========== CRUD DE TRANSAÇÕES ==========

export const createIncome = async (
  data: CreateIncomeData
): Promise<string> => {
  try {
    const transactionDoc = {
      nutritionistId: data.nutritionistId,
      type: "income" as const,
      amount: data.amount,
      description: data.description,
      date: Timestamp.fromDate(data.date),
      appointmentId: data.appointmentId || null,
      clientId: data.clientId || null,
      clientName: data.clientName || null,
      paymentStatus: data.paymentStatus || "pending",
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await addDoc(
      collection(db, TRANSACTIONS_COLLECTION),
      transactionDoc
    );

    return docRef.id;
  } catch (error) {
    console.error("Erro ao criar receita:", error);
    throw error;
  }
};

const createExpenseDoc = async (
  data: CreateExpenseData,
  date: Date
): Promise<string> => {
  const transactionDoc = {
    nutritionistId: data.nutritionistId,
    type: "expense" as const,
    amount: data.amount,
    description: data.description,
    date: Timestamp.fromDate(date),
    category: data.category || null,
    paymentStatus: data.paymentStatus || "paid",
    isRecurring: data.isRecurring || false,
    recurrenceFrequency: data.recurrenceFrequency || null,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  const docRef = await addDoc(
    collection(db, TRANSACTIONS_COLLECTION),
    transactionDoc
  );
  return docRef.id;
};

export const createExpense = async (
  data: CreateExpenseData
): Promise<string> => {
  try {
    if (data.isRecurring && data.recurrenceFrequency && data.recurrenceEndDate) {
      const dates: Date[] = [];
      const current = new Date(data.date);
      const end = new Date(data.recurrenceEndDate);

      while (current <= end) {
        dates.push(new Date(current));
        if (data.recurrenceFrequency === "monthly") {
          current.setMonth(current.getMonth() + 1);
        } else {
          current.setDate(current.getDate() + 7);
        }
      }

      let firstId = "";
      for (const date of dates) {
        const id = await createExpenseDoc(data, date);
        if (!firstId) firstId = id;
      }
      return firstId;
    }

    return await createExpenseDoc(data, data.date);
  } catch (error) {
    console.error("Erro ao criar despesa:", error);
    throw error;
  }
};

export const getTransactionsByNutritionist = async (
  nutritionistId: string,
  startDate?: Date,
  endDate?: Date,
  type?: "income" | "expense"
): Promise<FinancialTransaction[]> => {
  try {
    // Buscar todas as transações do nutricionista (sem filtro de tipo)
    // Isso evita problemas de índice composto no Firestore
    let q = query(
      collection(db, TRANSACTIONS_COLLECTION),
      where("nutritionistId", "==", nutritionistId),
      orderBy("date", "desc")
    );

    // Aplicar filtros de data no Firestore (mais eficiente)
    if (startDate) {
      q = query(q, where("date", ">=", Timestamp.fromDate(startDate)));
    }
    if (endDate) {
      q = query(q, where("date", "<=", Timestamp.fromDate(endDate)));
    }

    const querySnapshot = await getDocs(q);

    // Converter para array de transações
    let transactions = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        date: data.date.toDate(),
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      } as FinancialTransaction;
    });

    // Filtrar por tipo no cliente (JavaScript) para evitar problemas de índice
    if (type) {
      transactions = transactions.filter((t) => t.type === type);
    }

    return transactions;
  } catch (error) {
    console.error("Erro ao buscar transações:", error);
    throw error;
  }
};

export const getTransactionById = async (
  transactionId: string
): Promise<FinancialTransaction | null> => {
  try {
    const docRef = doc(db, TRANSACTIONS_COLLECTION, transactionId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        date: data.date.toDate(),
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      } as FinancialTransaction;
    }

    return null;
  } catch (error) {
    console.error("Erro ao buscar transação:", error);
    throw error;
  }
};

export const updateTransaction = async (
  transactionId: string,
  data: UpdateTransactionData
): Promise<void> => {
  try {
    const docRef = doc(db, TRANSACTIONS_COLLECTION, transactionId);
    const updateData: Record<string, unknown> = {
      updatedAt: Timestamp.now(),
    };

    // Atualizar apenas os campos fornecidos
    if (data.amount !== undefined) {
      updateData.amount = data.amount;
    }
    if (data.description !== undefined) {
      updateData.description = data.description;
    }
    if (data.date) {
      updateData.date = Timestamp.fromDate(data.date);
    }
    if (data.category !== undefined) {
      updateData.category = data.category || null;
    }
    if (data.paymentStatus !== undefined) {
      updateData.paymentStatus = data.paymentStatus;
    }
    if (data.clientId !== undefined) {
      updateData.clientId = data.clientId || null;
    }
    if (data.clientName !== undefined) {
      updateData.clientName = data.clientName || null;
    }

    await updateDoc(docRef, updateData);
  } catch (error) {
    console.error("Erro ao atualizar transação:", error);
    throw error;
  }
};

export const deleteTransaction = async (
  transactionId: string
): Promise<void> => {
  try {
    const docRef = doc(db, TRANSACTIONS_COLLECTION, transactionId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Erro ao deletar transação:", error);
    throw error;
  }
};

// ========== FUNÇÕES DE RESUMO E ESTATÍSTICAS ==========

export const getFinancialSummary = async (
  nutritionistId: string,
  startDate?: Date,
  endDate?: Date
): Promise<FinancialSummary> => {
  try {
    const transactions = await getTransactionsByNutritionist(
      nutritionistId,
      startDate,
      endDate
    );

    const incomes = transactions.filter((t) => t.type === "income");
    const expenses = transactions.filter((t) => t.type === "expense");

    const totalIncome = incomes.reduce((sum, t) => sum + t.amount, 0);
    const totalPaidIncome = incomes
      .filter((t) => t.paymentStatus === "paid")
      .reduce((sum, t) => sum + t.amount, 0);
    const totalPendingIncome = incomes
      .filter((t) => !t.paymentStatus || t.paymentStatus === "pending")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = expenses.reduce((sum, t) => sum + t.amount, 0);
    const totalPaidExpense = expenses
      .filter((t) => !t.paymentStatus || t.paymentStatus === "paid")
      .reduce((sum, t) => sum + t.amount, 0);
    const totalPendingExpense = expenses
      .filter((t) => t.paymentStatus === "pending")
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      totalIncome,
      totalPaidIncome,
      totalPendingIncome,
      totalExpense,
      totalPaidExpense,
      totalPendingExpense,
      balance: totalPaidIncome - totalPaidExpense,
      incomeCount: incomes.length,
      expenseCount: expenses.length,
    };
  } catch (error) {
    console.error("Erro ao calcular resumo financeiro:", error);
    throw error;
  }
};

export const getMonthlyFinancialData = async (
  nutritionistId: string,
  months: number = 6
): Promise<MonthlyFinancialData[]> => {
  try {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setMonth(startDate.getMonth() - months);
    startDate.setDate(1); // Primeiro dia do mês
    startDate.setHours(0, 0, 0, 0);

    const transactions = await getTransactionsByNutritionist(
      nutritionistId,
      startDate
    );

    // Agrupar por mês
    const monthlyData: Record<string, MonthlyFinancialData> = {};

    const monthNames = [
      "Jan",
      "Fev",
      "Mar",
      "Abr",
      "Mai",
      "Jun",
      "Jul",
      "Ago",
      "Set",
      "Out",
      "Nov",
      "Dez",
    ];

    // Inicializar todos os meses do período
    for (let i = 0; i < months; i++) {
      const date = new Date(startDate);
      date.setMonth(date.getMonth() + i);
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      monthlyData[monthKey] = {
        month: monthNames[date.getMonth()],
        monthIndex: date.getMonth(),
        year: date.getFullYear(),
        income: 0,
        expense: 0,
      };
    }

    // Processar transações
    transactions.forEach((transaction) => {
      const date = transaction.date;
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;

      if (monthlyData[monthKey]) {
        if (transaction.type === "income") {
          monthlyData[monthKey].income += transaction.amount;
        } else {
          monthlyData[monthKey].expense += transaction.amount;
        }
      }
    });

    // Converter para array e ordenar
    return Object.values(monthlyData).sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.monthIndex - b.monthIndex;
    });
  } catch (error) {
    console.error("Erro ao calcular dados mensais:", error);
    throw error;
  }
};

// ========== FUNÇÕES AUXILIARES ==========

export const checkIfIncomeExistsForAppointment = async (
  appointmentId: string
): Promise<boolean> => {
  try {
    const q = query(
      collection(db, TRANSACTIONS_COLLECTION),
      where("appointmentId", "==", appointmentId),
      where("type", "==", "income"),
      limit(1)
    );

    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error("Erro ao verificar receita da consulta:", error);
    return false;
  }
};

