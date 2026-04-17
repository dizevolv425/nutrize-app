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
} from "firebase/firestore";
import { createUserWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { db } from "../lib/firebaseconfig";
import { clientAuth } from "../lib/clientFirebaseConfig";
import type {
  Client,
  CreateClientData,
  ClientNote,
  ClientDocument,
  Consultation,
  CreateConsultationData,
  UpdateConsultationData,
  ClientGoal,
  CreateClientGoalData,
  UpdateClientGoalData,
} from "../types/client";

const CLIENTS_COLLECTION = "clients";
const NOTES_COLLECTION = "clientNotes";
const DOCUMENTS_COLLECTION = "clientDocuments";
const CONSULTATIONS_COLLECTION = "consultations";
const GOALS_COLLECTION = "clientGoals";

function generateStrongPassword(length = 16): string {
  const charset =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*-_";
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => charset[b % charset.length]).join("");
}

// ========== CRUD DE CLIENTES ==========

export const createClient = async (
  clientData: CreateClientData,
  nutritionistId: string
): Promise<string> => {
  try {
    // 1. Criar conta com senha aleatória forte; paciente define via e-mail de reset.
    const randomPassword = generateStrongPassword();

    const userCredential = await createUserWithEmailAndPassword(
      clientAuth,
      clientData.email,
      randomPassword
    );

    const clientUid = userCredential.user.uid;
    console.log("Cliente criado no Firebase Auth. UID:", clientUid, "Email:", clientData.email);

    // 2. Criar registro do cliente no Firestore
    const fullName = `${clientData.firstName} ${clientData.lastName}`.trim();
    const clientDoc = {
      firstName: clientData.firstName,
      lastName: clientData.lastName,
      fullName,
      email: clientData.email,
      phone: clientData.phone,
      birthDate: clientData.birthDate,
      gender: clientData.gender,
      height: clientData.height || null,
      weight: clientData.weight || null,
      nutritionistId,
      authUid: clientUid,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    console.log("Criando documento no Firestore com authUid:", clientUid);
    const docRef = await addDoc(collection(db, CLIENTS_COLLECTION), clientDoc);
    console.log("Documento criado no Firestore. ID:", docRef.id, "authUid salvo:", clientUid);

    // Verificar se foi salvo corretamente (com pequeno delay para garantir que foi indexado)
    await new Promise(resolve => setTimeout(resolve, 100));
    const savedDoc = await getDoc(docRef);
    if (savedDoc.exists()) {
      const savedData = savedDoc.data();
      console.log("Verificação: Documento salvo com authUid:", savedData.authUid);
      if (savedData.authUid !== clientUid) {
        console.error("ERRO: authUid salvo não corresponde ao UID do Auth!", {
          esperado: clientUid,
          salvo: savedData.authUid,
        });
      } else {
        console.log("✅ Verificação OK: authUid salvo corretamente!");
      }
    } else {
      console.error("ERRO: Documento não encontrado após criação!");
    }

    // 3. Enviar e-mail para o paciente definir a própria senha.
    try {
      await sendPasswordResetEmail(clientAuth, clientData.email);
    } catch (emailErr) {
      console.error(
        `[clientService] Falha ao enviar e-mail de definição de senha para "${clientData.email}":`,
        emailErr
      );
    }

    return docRef.id;
  } catch (error) {
    console.error("Erro ao criar cliente:", error);
    throw error;
  }
};

export const getClientsByNutritionist = async (
  nutritionistId: string
): Promise<Client[]> => {
  try {
    // Buscar todos os clientes e filtrar:
    // 1. Clientes que têm este nutritionistId
    // 2. Clientes que têm authUid mas não têm nutritionistId (ou têm vazio)
    //    (esses são clientes auto-cadastrados que ainda não foram associados)
    const q = query(
      collection(db, CLIENTS_COLLECTION),
      orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(q);

    const clients = querySnapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate(),
        updatedAt: doc.data().updatedAt.toDate(),
      })) as Client[];

    return clients.filter((client) => client.nutritionistId === nutritionistId);
  } catch (error) {
    console.error("Erro ao buscar clientes:", error);
    throw error;
  }
};

export const getClientById = async (
  clientId: string
): Promise<Client | null> => {
  try {
    const docRef = doc(db, CLIENTS_COLLECTION, clientId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt.toDate(),
        updatedAt: docSnap.data().updatedAt.toDate(),
      } as Client;
    }

    return null;
  } catch (error) {
    console.error("Erro ao buscar cliente:", error);
    throw error;
  }
};

export const getClientByEmail = async (
  email: string
): Promise<Client | null> => {
  try {
    console.log("Buscando cliente com email:", email);
    const q = query(
      collection(db, CLIENTS_COLLECTION),
      where("email", "==", email)
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.warn("Nenhum cliente encontrado com email:", email);
      return null;
    }

    const clientDoc = querySnapshot.docs[0];
    const clientData = clientDoc.data();
    console.log("Cliente encontrado por email:", {
      id: clientDoc.id,
      email: clientData.email,
      fullName: clientData.fullName,
      authUid: clientData.authUid,
    });
    
    return {
      id: clientDoc.id,
      ...clientData,
      createdAt: clientData.createdAt.toDate(),
      updatedAt: clientData.updatedAt.toDate(),
    } as Client;
  } catch (error) {
    console.error("Erro ao buscar cliente por email:", error);
    throw error;
  }
};

export const getClientByAuthUid = async (
  authUid: string
): Promise<Client | null> => {
  try {
    console.log("🔍 Buscando cliente com authUid:", authUid);
    
    // SEMPRE fazer busca manual primeiro para garantir que funciona
    // A query pode falhar por falta de índice ou outros problemas
    console.log("📋 Buscando todos os clientes para busca manual...");
    const allClientsQuery = query(collection(db, CLIENTS_COLLECTION));
    const allSnapshot = await getDocs(allClientsQuery);
    
    console.log(`📊 Total de clientes no Firestore: ${allSnapshot.docs.length}`);
    
    // Buscar manualmente pelo authUid
    const foundDoc = allSnapshot.docs.find((doc) => {
      const data = doc.data();
      const docAuthUid = data.authUid;
      const match = docAuthUid === authUid;
      if (match) {
        console.log(`✅ MATCH encontrado! Cliente ID: ${doc.id}, Email: ${data.email}`);
      }
      return match;
    });
    
    if (foundDoc) {
      console.log("✅ Cliente encontrado via busca manual!");
      const clientData = foundDoc.data();
      console.log("📄 Dados do cliente encontrado:", {
        id: foundDoc.id,
        email: clientData.email,
        fullName: clientData.fullName,
        authUid: clientData.authUid,
      });
      
      return {
        id: foundDoc.id,
        ...clientData,
        createdAt: clientData.createdAt.toDate(),
        updatedAt: clientData.updatedAt.toDate(),
      } as Client;
    }
    
    // Se não encontrou, logar todos os authUids para debug
    console.warn("⚠️ Cliente não encontrado. Listando todos os authUids para debug:");
    allSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      console.log(`  - Cliente ID: ${doc.id}, Email: ${data.email}, authUid: "${data.authUid || "NÃO TEM"}"`);
    });
    console.error(`❌ Cliente não encontrado. authUid procurado: "${authUid}"`);
    
    // Tentar também com query (pode funcionar se houver índice)
    try {
      const q = query(
        collection(db, CLIENTS_COLLECTION),
        where("authUid", "==", authUid)
      );
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        console.log("✅ Cliente encontrado via query do Firestore!");
        const clientDoc = querySnapshot.docs[0];
        const clientData = clientDoc.data();
        return {
          id: clientDoc.id,
          ...clientData,
          createdAt: clientData.createdAt.toDate(),
          updatedAt: clientData.updatedAt.toDate(),
        } as Client;
      }
    } catch (queryError) {
      console.warn("⚠️ Query do Firestore falhou (pode ser falta de índice):", queryError);
    }
    
    return null;

  } catch (error) {
    console.error("❌ Erro ao buscar cliente por authUid:", error);
    
    // Em caso de erro, tentar buscar todos e filtrar manualmente
    try {
      console.warn("🔄 Tentando busca alternativa após erro...");
      const allSnapshot = await getDocs(collection(db, CLIENTS_COLLECTION));
      console.log(`📊 Busca alternativa: ${allSnapshot.docs.length} documentos encontrados`);
      
      const found = allSnapshot.docs.find((doc) => {
        const data = doc.data();
        const docAuthUid = data.authUid;
        const match = docAuthUid === authUid;
        if (match) {
          console.log(`✅ MATCH na busca alternativa! Cliente ID: ${doc.id}`);
        }
        return match;
      });
      
      if (found) {
        console.log("✅ Cliente encontrado na busca alternativa!");
        const clientData = found.data();
        return {
          id: found.id,
          ...clientData,
          createdAt: clientData.createdAt.toDate(),
          updatedAt: clientData.updatedAt.toDate(),
        } as Client;
      } else {
        console.error("❌ Cliente não encontrado na busca alternativa. authUid procurado:", authUid);
      }
    } catch (fallbackError) {
      console.error("❌ Erro na busca alternativa:", fallbackError);
    }
    
    // Se não conseguiu encontrar, retornar null ao invés de lançar erro
    // Isso permite que o fallback por email funcione
    return null;
  }
};

export const updateClient = async (
  clientId: string,
  data: Record<string, unknown>
): Promise<void> => {
  try {
    const docRef = doc(db, CLIENTS_COLLECTION, clientId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error("Erro ao atualizar cliente:", error);
    throw error;
  }
};

export const deleteClient = async (clientId: string): Promise<void> => {
  try {
    // 1. Buscar o cliente para obter o authUid antes de deletar
    const clientDocRef = doc(db, CLIENTS_COLLECTION, clientId);
    const clientDoc = await getDoc(clientDocRef);
    
    if (!clientDoc.exists()) {
      throw new Error("Cliente não encontrado");
    }

    const clientData = clientDoc.data();
    const authUid = clientData.authUid as string | undefined;

    // 2. Deletar documento do cliente no Firestore
    await deleteDoc(clientDocRef);

    // 3. Tentar deletar a conta do Firebase Auth via Cloud Function
    // Nota: Não podemos deletar outro usuário diretamente do cliente.
    // A solução ideal é usar uma Cloud Function com Admin SDK.
    if (authUid) {
      try {
        // Tentar chamar Cloud Function se existir
        // Se não existir, a conta ficará "órfã" no Auth, mas o documento foi deletado
        const functionsUrl = import.meta.env.VITE_FIREBASE_FUNCTIONS_URL;
        if (functionsUrl) {
          const response = await fetch(`${functionsUrl}/deleteClientAuth`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ authUid }),
          });
          
          if (!response.ok) {
            console.warn(
              `Não foi possível deletar a conta do Firebase Auth (UID: ${authUid}). ` +
              `O documento do Firestore foi deletado, mas a conta do Auth permanece.`
            );
          }
        } else {
          console.warn(
            `Conta do Firebase Auth (UID: ${authUid}) não foi deletada. ` +
            `Configure VITE_FIREBASE_FUNCTIONS_URL para habilitar deleção automática. ` +
            `O documento do Firestore foi deletado, mas a conta do Auth permanece ativa.`
          );
        }
      } catch (authError) {
        console.error("Erro ao tentar deletar conta do Firebase Auth:", authError);
        // Não lançar erro aqui, pois o documento do Firestore já foi deletado
        // A conta do Auth ficará "órfã", mas isso não impede o funcionamento do sistema
      }
    }
  } catch (error) {
    console.error("Erro ao deletar cliente:", error);
    throw error;
  }
};

// ========== ANOTAÇÕES ==========

export const addClientNote = async (
  clientId: string,
  content: string
): Promise<string> => {
  try {
    const noteDoc = {
      clientId,
      content,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, NOTES_COLLECTION), noteDoc);
    return docRef.id;
  } catch (error) {
    console.error("Erro ao adicionar nota:", error);
    throw error;
  }
};

export const getClientNotes = async (
  clientId: string
): Promise<ClientNote[]> => {
  try {
    const q = query(
      collection(db, NOTES_COLLECTION),
      where("clientId", "==", clientId),
      orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate(),
    })) as ClientNote[];
  } catch (error) {
    console.error("Erro ao buscar notas:", error);
    throw error;
  }
};

export const updateClientNote = async (
  noteId: string,
  content: string
): Promise<void> => {
  try {
    const docRef = doc(db, NOTES_COLLECTION, noteId);
    await updateDoc(docRef, {
      content,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error("Erro ao atualizar nota:", error);
    throw error;
  }
};

export const deleteClientNote = async (noteId: string): Promise<void> => {
  try {
    const docRef = doc(db, NOTES_COLLECTION, noteId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Erro ao deletar nota:", error);
    throw error;
  }
};

// ========== DOCUMENTOS ==========

export const addClientDocument = async (
  clientId: string,
  name: string,
  type: "exame-sangue" | "bioimpedancia" | "outro",
  fileUrl: string
): Promise<string> => {
  try {
    const docData = {
      clientId,
      name,
      type,
      fileUrl,
      uploadedAt: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, DOCUMENTS_COLLECTION), docData);
    return docRef.id;
  } catch (error) {
    console.error("Erro ao adicionar documento:", error);
    throw error;
  }
};

export const getClientDocuments = async (
  clientId: string
): Promise<ClientDocument[]> => {
  try {
    const q = query(
      collection(db, DOCUMENTS_COLLECTION),
      where("clientId", "==", clientId),
      orderBy("uploadedAt", "desc")
    );

    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      uploadedAt: doc.data().uploadedAt.toDate(),
    })) as ClientDocument[];
  } catch (error) {
    console.error("Erro ao buscar documentos:", error);
    throw error;
  }
};

export const deleteClientDocument = async (docId: string): Promise<void> => {
  try {
    const docRef = doc(db, DOCUMENTS_COLLECTION, docId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Erro ao deletar documento:", error);
    throw error;
  }
};

// ========== CONSULTAS (HISTÓRICO) ==========

export const createConsultation = async (
  clientId: string,
  nutritionistId: string,
  consultationData: CreateConsultationData
): Promise<string> => {
  try {
    const consultationDoc = {
      clientId,
      nutritionistId,
      date: Timestamp.fromDate(consultationData.date),
      weight: consultationData.weight || null,
      height: consultationData.height || null,
      bodyFat: consultationData.bodyFat || null,
      muscleMass: consultationData.muscleMass || null,
      notes: consultationData.notes || "",
      complaints: consultationData.complaints || "",
      observations: consultationData.observations || "",
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, CONSULTATIONS_COLLECTION), consultationDoc);
    return docRef.id;
  } catch (error) {
    console.error("Erro ao criar consulta:", error);
    throw error;
  }
};

export const getConsultationsByClient = async (
  clientId: string
): Promise<Consultation[]> => {
  try {
    const q = query(
      collection(db, CONSULTATIONS_COLLECTION),
      where("clientId", "==", clientId)
    );

    const querySnapshot = await getDocs(q);

    const consultations = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date.toDate(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate(),
    })) as Consultation[];

    // Ordenar no cliente ao invés do servidor
    return consultations.sort((a, b) => b.date.getTime() - a.date.getTime());
  } catch (error) {
    console.error("Erro ao buscar consultas:", error);
    throw error;
  }
};

export const getConsultationById = async (
  consultationId: string
): Promise<Consultation | null> => {
  try {
    const docRef = doc(db, CONSULTATIONS_COLLECTION, consultationId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
        date: docSnap.data().date.toDate(),
        createdAt: docSnap.data().createdAt.toDate(),
        updatedAt: docSnap.data().updatedAt.toDate(),
      } as Consultation;
    }

    return null;
  } catch (error) {
    console.error("Erro ao buscar consulta:", error);
    throw error;
  }
};

export const updateConsultation = async (
  consultationId: string,
  data: UpdateConsultationData
): Promise<void> => {
  try {
    const docRef = doc(db, CONSULTATIONS_COLLECTION, consultationId);
    const updateData: any = {
      ...data,
      updatedAt: Timestamp.now(),
    };

    if (data.date) {
      updateData.date = Timestamp.fromDate(data.date);
    }

    await updateDoc(docRef, updateData);
  } catch (error) {
    console.error("Erro ao atualizar consulta:", error);
    throw error;
  }
};

export const deleteConsultation = async (consultationId: string): Promise<void> => {
  try {
    const docRef = doc(db, CONSULTATIONS_COLLECTION, consultationId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Erro ao deletar consulta:", error);
    throw error;
  }
};

export const getConsultationCount = async (clientId: string): Promise<number> => {
  try {
    const q = query(
      collection(db, CONSULTATIONS_COLLECTION),
      where("clientId", "==", clientId)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
  } catch (error) {
    console.error("Erro ao contar consultas:", error);
    throw error;
  }
};

export const getLatestBodyMeasurements = async (
  clientId: string
): Promise<{ weight?: number; height?: number; date?: Date } | null> => {
  try {
    const consultations = await getConsultationsByClient(clientId);
    const withMeasurements = consultations.find(
      (c) => c.weight || c.height
    );
    if (!withMeasurements) return null;
    return {
      weight: withMeasurements.weight,
      height: withMeasurements.height,
      date: withMeasurements.date,
    };
  } catch (error) {
    console.error("Erro ao buscar medidas:", error);
    return null;
  }
};

// ========== OBJETIVOS ==========

export const createClientGoal = async (
  clientId: string,
  nutritionistId: string,
  goalData: CreateClientGoalData
): Promise<string> => {
  try {
    const goalDoc = {
      clientId,
      nutritionistId,
      title: goalData.title,
      description: goalData.description || "",
      targetValue: goalData.targetValue || null,
      currentValue: goalData.currentValue || null,
      unit: goalData.unit || "",
      status: "active" as const,
      startDate: Timestamp.now(),
      targetDate: goalData.targetDate ? Timestamp.fromDate(goalData.targetDate) : null,
      completedDate: null,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, GOALS_COLLECTION), goalDoc);
    return docRef.id;
  } catch (error) {
    console.error("Erro ao criar objetivo:", error);
    throw error;
  }
};

export const getClientGoals = async (
  clientId: string
): Promise<ClientGoal[]> => {
  try {
    const q = query(
      collection(db, GOALS_COLLECTION),
      where("clientId", "==", clientId)
    );

    const querySnapshot = await getDocs(q);

    const goals = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      startDate: doc.data().startDate.toDate(),
      targetDate: doc.data().targetDate?.toDate(),
      completedDate: doc.data().completedDate?.toDate(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate(),
    })) as ClientGoal[];

    // Ordenar no cliente ao invés do servidor
    return goals.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  } catch (error) {
    console.error("Erro ao buscar objetivos:", error);
    throw error;
  }
};

export const getClientGoalById = async (
  goalId: string
): Promise<ClientGoal | null> => {
  try {
    const docRef = doc(db, GOALS_COLLECTION, goalId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
        startDate: docSnap.data().startDate.toDate(),
        targetDate: docSnap.data().targetDate?.toDate(),
        completedDate: docSnap.data().completedDate?.toDate(),
        createdAt: docSnap.data().createdAt.toDate(),
        updatedAt: docSnap.data().updatedAt.toDate(),
      } as ClientGoal;
    }

    return null;
  } catch (error) {
    console.error("Erro ao buscar objetivo:", error);
    throw error;
  }
};

export const updateClientGoal = async (
  goalId: string,
  data: UpdateClientGoalData
): Promise<void> => {
  try {
    const docRef = doc(db, GOALS_COLLECTION, goalId);
    const updateData: any = {
      ...data,
      updatedAt: Timestamp.now(),
    };

    if (data.targetDate) {
      updateData.targetDate = Timestamp.fromDate(data.targetDate);
    }

    if (data.completedDate) {
      updateData.completedDate = Timestamp.fromDate(data.completedDate);
    }

    await updateDoc(docRef, updateData);
  } catch (error) {
    console.error("Erro ao atualizar objetivo:", error);
    throw error;
  }
};

export const deleteClientGoal = async (goalId: string): Promise<void> => {
  try {
    const docRef = doc(db, GOALS_COLLECTION, goalId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Erro ao deletar objetivo:", error);
    throw error;
  }
};
