import { useMemo } from "react";
import { useAuth } from "./useAuth";

export interface TrialStatus {
  isTrial: boolean;
  isExpired: boolean;
  daysRemaining: number | null;
  trialEndDate: Date | null;
  shouldShowWarning: boolean; // Mostrar aviso quando faltam 3 dias ou menos
  shouldBlock: boolean; // Bloquear funcionalidades durante trial
}

export const useTrial = (): TrialStatus => {
  const { user } = useAuth();

  return useMemo(() => {
    // Admin master tem acesso vitalício — nunca entra em trial nem é bloqueado.
    if (user?.role === "admin") {
      return {
        isTrial: false,
        isExpired: false,
        daysRemaining: null,
        trialEndDate: null,
        shouldShowWarning: false,
        shouldBlock: false,
      };
    }

    // Se não for nutricionista ou não tiver trialEndDate, não está em trial
    if (!user || user.role !== "nutritionist" || !user.trialEndDate) {
      return {
        isTrial: false,
        isExpired: false,
        daysRemaining: null,
        trialEndDate: null,
        shouldShowWarning: false,
        shouldBlock: false,
      };
    }

    const now = new Date();
    // Converter trialEndDate para Date se necessário (pode vir como Timestamp do Firestore)
    let trialEnd: Date;
    const trialEndDateValue = user.trialEndDate;

    if (trialEndDateValue instanceof Date) {
      trialEnd = trialEndDateValue;
    } else if (trialEndDateValue && typeof trialEndDateValue === 'object' && 'toDate' in trialEndDateValue) {
      // É um Timestamp do Firestore ou objeto similar com método toDate
      const timestampLike = trialEndDateValue as { toDate: () => Date };
      trialEnd = timestampLike.toDate();
    } else {
      // Tentar converter string ou número
      trialEnd = new Date(trialEndDateValue as string | number);
    }
    const isExpired = now > trialEnd;

    // Calcular dias restantes
    const diffTime = trialEnd.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const daysRemaining = isExpired ? 0 : diffDays;

    // Mostrar aviso quando faltam 3 dias ou menos
    const shouldShowWarning = !isExpired && daysRemaining <= 3;

    // Bloquear funcionalidades durante todo o período de trial
    const shouldBlock = !isExpired;

    return {
      isTrial: true,
      isExpired,
      daysRemaining,
      trialEndDate: trialEnd,
      shouldShowWarning,
      shouldBlock,
    };
  }, [user]);
};

