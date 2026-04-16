import { initializeApp, getApps, deleteApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import { db } from "../lib/firebaseconfig";
import firebaseConfig from "../lib/firebaseconfig";
import type { SecretaryModule, User } from "../types/user";

export interface CreateSecretaryData {
  name: string;
  email: string;
  permissions: SecretaryModule[];
}

export interface Secretary extends User {
  role: "secretary";
  nutritionistId: string;
  permissions: SecretaryModule[];
}

function generateStrongPassword(length = 16): string {
  const charset =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*-_";
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => charset[b % charset.length]).join("");
}

/**
 * Cria uma nova secretária para o nutricionista.
 * Fluxo: cria conta Auth (app secundário) com senha aleatória → grava doc em 'users'
 * → envia e-mail para a secretária definir a senha. Se o Firestore falhar, faz rollback
 * da conta Auth para não deixar e-mail órfão.
 */
export async function createSecretary(
  nutritionistId: string,
  data: CreateSecretaryData
): Promise<Secretary> {
  const appName = `secretary-${Date.now()}`;
  const secondaryApp = initializeApp(firebaseConfig, appName);
  const secondaryAuth = getAuth(secondaryApp);

  try {
    const randomPassword = generateStrongPassword();
    const credential = await createUserWithEmailAndPassword(
      secondaryAuth,
      data.email,
      randomPassword
    );
    const uid = credential.user.uid;

    const secretaryDoc = {
      uid,
      name: data.name,
      email: data.email,
      role: "secretary" as const,
      nutritionistId,
      permissions: data.permissions,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    try {
      await setDoc(doc(db, "users", uid), secretaryDoc);
    } catch (firestoreErr) {
      // Rollback: deletar a conta Auth recém-criada p/ não deixar e-mail órfão.
      try {
        await credential.user.delete();
      } catch (deleteErr) {
        console.error(
          `[secretaryService] ROLLBACK FALHOU — conta Auth órfã para o e-mail "${data.email}". ` +
            `Remova manualmente no console do Firebase. Erro original do delete:`,
          deleteErr
        );
      }
      throw firestoreErr;
    }

    try {
      await sendPasswordResetEmail(secondaryAuth, data.email);
    } catch (emailErr) {
      console.error(
        `[secretaryService] Falha ao enviar e-mail de definição de senha para "${data.email}":`,
        emailErr
      );
    }

    return {
      ...secretaryDoc,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  } finally {
    const apps = getApps();
    const appToDelete = apps.find((a) => a.name === appName);
    if (appToDelete) await deleteApp(appToDelete);
  }
}

/**
 * Lista todas as secretárias de um nutricionista.
 */
export async function getSecretaries(
  nutritionistId: string
): Promise<Secretary[]> {
  const q = query(
    collection(db, "users"),
    where("role", "==", "secretary"),
    where("nutritionistId", "==", nutritionistId)
  );
  const snapshot = await getDocs(q);

  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data();
    return {
      ...data,
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
      updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(),
    } as Secretary;
  });
}

/**
 * Atualiza as permissões de uma secretária.
 */
export async function updateSecretaryPermissions(
  uid: string,
  permissions: SecretaryModule[]
): Promise<void> {
  await updateDoc(doc(db, "users", uid), {
    permissions,
    updatedAt: Timestamp.now(),
  });
}

/**
 * Remove a secretária do Firestore.
 * Nota: a conta Firebase Auth não pode ser deletada pelo cliente sem a Admin SDK.
 * O documento é removido, efetivamente impedindo o acesso.
 */
export async function deleteSecretary(uid: string): Promise<void> {
  await deleteDoc(doc(db, "users", uid));
}

export const MODULE_LABELS: Record<SecretaryModule, string> = {
  clients: "Pacientes",
  agenda: "Agenda",
  financial: "Financeiro",
};
