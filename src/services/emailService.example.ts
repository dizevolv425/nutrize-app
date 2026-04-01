/**
 * EXEMPLO DE USO DO SERVIÇO DE EMAIL
 * 
 * Este arquivo mostra como usar o serviço de email em diferentes cenários.
 * 
 * IMPORTANTE: Antes de usar, você precisa configurar o serviço de email.
 * Veja as opções abaixo.
 */

import {
  sendAppointmentConfirmationEmail,
  sendAppointmentReminderEmail,
  sendAppointmentApprovedEmail,
  sendAppointmentRejectedEmail,
  sendEmail,
} from "./emailService";

// ============================================
// CONFIGURAÇÃO DO SERVIÇO
// ============================================

/**
 * OPÇÃO 1: Usar Firebase Cloud Functions (Recomendado)
 * 
 * 1. Crie uma Cloud Function no Firebase:
 *    - functions/src/index.ts
 *    - Implemente a função sendEmail usando um serviço de email (SendGrid, Resend, etc.)
 * 
 * 2. Configure o serviço:
 */
/*
import { getFunctions, httpsCallable } from "firebase/functions";

configureEmailService({
  enabled: true,
  fromEmail: "noreply@nutrimanager.com",
  fromName: "Nutrize",
});
*/

/**
 * OPÇÃO 2: Usar API Externa Diretamente (SendGrid, Resend, AWS SES)
 * 
 * 1. Instale o SDK do serviço escolhido:
 *    npm install @sendgrid/mail
 *    ou
 *    npm install resend
 * 
 * 2. Modifique emailService.ts para usar o SDK diretamente
 */

// ============================================
// EXEMPLOS DE USO
// ============================================

/**
 * Exemplo 1: Enviar confirmação de agendamento
 */
export async function exemploEnviarConfirmacao() {
  const result = await sendAppointmentConfirmationEmail(
    "cliente@example.com",
    "João Silva",
    "15/03/2025",
    "14:00",
    "Dr. Maria Santos"
  );

  if (result.success) {
    console.log("Email enviado com sucesso!");
  } else {
    console.error("Erro ao enviar email:", result.error);
  }
}

/**
 * Exemplo 2: Enviar lembrete de consulta
 */
export async function exemploEnviarLembrete() {
  const result = await sendAppointmentReminderEmail(
    "cliente@example.com",
    "João Silva",
    "15/03/2025",
    "14:00"
  );

  if (result.success) {
    console.log("Lembrete enviado!");
  }
}

/**
 * Exemplo 3: Enviar aprovação de consulta
 */
export async function exemploEnviarAprovacao() {
  const result = await sendAppointmentApprovedEmail(
    "cliente@example.com",
    "João Silva",
    "15/03/2025",
    "14:00"
  );

  if (result.success) {
    console.log("Aprovação enviada!");
  }
}

/**
 * Exemplo 4: Enviar rejeição de consulta
 */
export async function exemploEnviarRejeicao() {
  const result = await sendAppointmentRejectedEmail(
    "cliente@example.com",
    "João Silva",
    "Horário não disponível. Por favor, escolha outro horário."
  );

  if (result.success) {
    console.log("Rejeição enviada!");
  }
}

/**
 * Exemplo 5: Enviar email customizado
 */
export async function exemploEnviarCustomizado() {
  const result = await sendEmail({
    to: {
      email: "cliente@example.com",
      name: "João Silva",
    },
    template: "welcome",
    data: {
      userName: "João Silva",
    },
  });

  if (result.success) {
    console.log("Email customizado enviado!");
  }
}

/**
 * Exemplo 6: Enviar para múltiplos destinatários
 */
export async function exemploEnviarMultiplos() {
  const result = await sendEmail({
    to: [
      { email: "cliente1@example.com", name: "Cliente 1" },
      { email: "cliente2@example.com", name: "Cliente 2" },
    ],
    template: "trial_warning",
    data: {
      userName: "Usuário",
      daysRemaining: 3,
    },
  });

  if (result.success) {
    console.log("Emails enviados para múltiplos destinatários!");
  }
}

// ============================================
// INTEGRAÇÃO COM SISTEMA DE NOTIFICAÇÕES
// ============================================

/**
 * Exemplo: Integrar envio de email quando uma notificação é criada
 * 
 * No seu código, você pode fazer:
 */
/*
import { useNotifications } from "../hooks/useNotifications";
import { useEmail } from "../hooks/useEmail";

function MeuComponente() {
  const { success, error } = useNotifications();
  const { sendAppointmentConfirmation } = useEmail();

  const handleAppointmentCreated = async (appointmentData) => {
    // Criar notificação no sistema
    success("Consulta agendada!", "Sua consulta foi agendada com sucesso.");

    // Enviar email
    const emailResult = await sendAppointmentConfirmation(
      appointmentData.clientEmail,
      appointmentData.clientName,
      appointmentData.date,
      appointmentData.time,
      appointmentData.nutritionistName
    );

    if (!emailResult.success) {
      error("Erro ao enviar email", "O agendamento foi criado, mas houve um problema ao enviar o email de confirmação.");
    }
  };

  return <div>...</div>;
}
*/

