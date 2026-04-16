import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebaseconfig";
import { auth } from "../lib/firebaseconfig";
import { updateEmail } from "firebase/auth";
import { uploadFile } from "./storageService";
import type { User } from "../types/user";

export interface UpdateProfileData {
  name?: string;
  email?: string;
  phone?: string;
  photoURL?: string;
}

/**
 * Atualiza os horários de trabalho do usuário
 * @param userId - ID do usuário
 * @param workStartTime - Horário de início (formato HH:mm, ex: "08:00")
 * @param workEndTime - Horário de término (formato HH:mm, ex: "18:00")
 * @returns Dados atualizados do usuário
 */
export const updateUserSchedule = async (
  userId: string,
  workStartTime: string,
  workEndTime: string
): Promise<User> => {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      workStartTime,
      workEndTime,
      updatedAt: new Date(),
    });

    // Buscar dados atualizados do usuário
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
      throw new Error("Usuário não encontrado");
    }

    const userData = userDoc.data();
    const convertedUser: User = {
      ...userData,
      createdAt: userData.createdAt?.toDate ? userData.createdAt.toDate() : userData.createdAt,
      updatedAt: userData.updatedAt?.toDate ? userData.updatedAt.toDate() : userData.updatedAt,
      trialEndDate: userData.trialEndDate?.toDate ? userData.trialEndDate.toDate() : userData.trialEndDate,
    } as User;

    return convertedUser;
  } catch (error) {
    console.error("Erro ao atualizar horários do usuário:", error);
    throw new Error("Erro ao atualizar horários. Tente novamente.");
  }
};

/**
 * Atualiza dados do perfil do usuário no Firestore (e e-mail no Auth se mudou).
 */
export const updateUserProfile = async (
  userId: string,
  data: UpdateProfileData
): Promise<User> => {
  const userRef = doc(db, "users", userId);

  // Tenta atualizar o e-mail no Firebase Auth antes do Firestore para
  // garantir consistência. updateEmail pode exigir reautenticação recente.
  if (data.email) {
    const current = auth.currentUser;
    if (current && current.email !== data.email) {
      await updateEmail(current, data.email);
    }
  }

  const updatePayload: Record<string, unknown> = {
    updatedAt: new Date(),
  };
  if (data.name !== undefined) updatePayload.name = data.name;
  if (data.email !== undefined) updatePayload.email = data.email;
  if (data.phone !== undefined) updatePayload.phone = data.phone;
  if (data.photoURL !== undefined) updatePayload.photoURL = data.photoURL;

  await updateDoc(userRef, updatePayload);

  const userDoc = await getDoc(userRef);
  if (!userDoc.exists()) throw new Error("Usuário não encontrado");
  const userData = userDoc.data();
  return {
    ...userData,
    createdAt: userData.createdAt?.toDate ? userData.createdAt.toDate() : userData.createdAt,
    updatedAt: userData.updatedAt?.toDate ? userData.updatedAt.toDate() : userData.updatedAt,
    trialEndDate: userData.trialEndDate?.toDate ? userData.trialEndDate.toDate() : userData.trialEndDate,
  } as User;
};

/**
 * Faz upload da foto de perfil do usuário e retorna a URL pública.
 */
export const uploadProfilePhoto = async (
  userId: string,
  file: File
): Promise<string> => {
  const ext = file.name.split(".").pop() || "jpg";
  const path = `avatars/${userId}/profile-${Date.now()}.${ext}`;
  return uploadFile(file, path);
};
