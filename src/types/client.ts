export interface Client {
  id: string;
  firstName?: string;
  lastName?: string;
  fullName: string;
  email: string;
  phone: string;
  birthDate: string;
  gender?: "masculino" | "feminino" | "outro";
  height?: number; // altura em cm
  weight?: number; // peso em kg
  createdAt: Date;
  updatedAt: Date;
  nutritionistId: string; // Pode estar vazio inicialmente para clientes auto-cadastrados
  authUid?: string; // UID do Firebase Auth
}

export interface ClientNote {
  id: string;
  clientId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ClientDocument {
  id: string;
  clientId: string;
  name: string;
  type: "exame-sangue" | "bioimpedancia" | "outro";
  fileUrl: string;
  uploadedAt: Date;
}

export interface CreateClientData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthDate: string;
  gender?: "masculino" | "feminino" | "outro";
  height?: number; // altura em cm
  weight?: number; // peso em kg
}

// Histórico de Consultas
export interface Consultation {
  id: string;
  clientId: string;
  nutritionistId: string;
  date: Date;
  weight?: number; // peso na consulta (kg)
  height?: number; // altura na consulta (cm)
  bodyFat?: number; // percentual de gordura corporal
  muscleMass?: number; // massa muscular (kg)
  notes?: string; // anotações da consulta
  complaints?: string; // queixas do paciente
  observations?: string; // observações do nutricionista
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateConsultationData {
  date: Date;
  weight?: number;
  height?: number;
  bodyFat?: number;
  muscleMass?: number;
  notes?: string;
  complaints?: string;
  observations?: string;
}

export interface UpdateConsultationData {
  date?: Date;
  weight?: number;
  height?: number;
  bodyFat?: number;
  muscleMass?: number;
  notes?: string;
  complaints?: string;
  observations?: string;
}

// Objetivos do Cliente
export interface ClientGoal {
  id: string;
  clientId: string;
  nutritionistId: string;
  title: string; // título do objetivo (ex: "Perda de peso", "Ganho de massa")
  description?: string; // descrição detalhada
  targetValue?: number; // valor alvo (ex: 5kg para perda de peso)
  currentValue?: number; // valor atual
  unit?: string; // unidade (ex: "kg", "%", "cm")
  status: "active" | "completed" | "paused" | "cancelled";
  startDate: Date;
  targetDate?: Date; // data prevista para alcançar o objetivo
  completedDate?: Date; // data em que foi completado
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateClientGoalData {
  title: string;
  description?: string;
  targetValue?: number;
  currentValue?: number;
  unit?: string;
  targetDate?: Date;
}

export interface UpdateClientGoalData {
  title?: string;
  description?: string;
  targetValue?: number;
  currentValue?: number;
  unit?: string;
  status?: "active" | "completed" | "paused" | "cancelled";
  targetDate?: Date;
  completedDate?: Date;
}
