import { initializeApp, getApps, deleteApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
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
  password: string;
  permissions: SecretaryModule[];
}

export interface Secretary extends User {
  role: "secretary";
  nutritionistId: string;
  permissions: SecretaryModule[];
}

/**
 * Cria uma conta Firebase Auth usando app secundário para não deslogar o nutricionista atual.
 */
async function createSecretaryFirebaseAccount(
  email: string,
  password: string
): Promise<string> {
  const appName = `secretary-${Date.now()}`;
  const secondaryApp = initializeApp(firebaseConfig, appName);
  try {
    const secondaryAuth = getAuth(secondaryApp);
    const credential = await createUserWithEmailAndPassword(
      secondaryAuth,
      email,
      password
    );
    return credential.user.uid;
  } finally {
    // Sempre limpar o app secundário
    const apps = getApps();
    const appToDelete = apps.find((a) => a.name === appName);
    if (appToDelete) await deleteApp(appToDelete);
  }
}

/**
 * Cria uma nova secretária para o nutricionista.
 * Cria conta no Firebase Auth (app secundário) + documento na coleção 'users'.
 */
export async function createSecretary(
  nutritionistId: string,
  data: CreateSecretaryData
): Promise<Secretary> {
  const uid = await createSecretaryFirebaseAccount(data.email, data.password);

  const secretaryDoc: Omit<Secretary, "createdAt" | "updatedAt"> & {
    createdAt: ReturnType<typeof Timestamp.now>;
    updatedAt: ReturnType<typeof Timestamp.now>;
  } = {
    uid,
    name: data.name,
    email: data.email,
    role: "secretary",
    nutritionistId,
    permissions: data.permissions,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  await setDoc(doc(db, "users", uid), secretaryDoc);

  return {
    ...secretaryDoc,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
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
