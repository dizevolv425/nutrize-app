import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

/**
 * Inicializa o Firebase Admin SDK a partir das variáveis de ambiente.
 * Cacheia a instância para reuso entre invocações da mesma function
 * (Netlify mantém o processo "quente" por alguns minutos).
 */
let adminApp: App | null = null;

function getAdminApp(): App {
  if (adminApp) return adminApp;

  const existing = getApps().find((a) => a.name === "admin");
  if (existing) {
    adminApp = existing;
    return adminApp;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Firebase Admin não configurado. Defina FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL e FIREBASE_PRIVATE_KEY no ambiente."
    );
  }

  adminApp = initializeApp(
    {
      credential: cert({ projectId, clientEmail, privateKey }),
    },
    "admin"
  );
  return adminApp;
}

export function getAdminDb(): Firestore {
  return getFirestore(getAdminApp());
}
