import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FaPlus, FaSpinner, FaUserFriends, FaFileImport, FaLock } from "react-icons/fa";
import { Button } from "../../components/ui/Button/Button";
import { SearchBar } from "./components/SearchBar";
import { ClientCard } from "./components/ClientCard";
import { ImportClientsModal } from "./components/ImportClientsModal";
import { getClientsByNutritionist } from "../../services/clientService";
import { useAuth } from "../../hooks/useAuth";
import type { Client } from "../../types/client";
import "./ClientList.css";

const STARTER_CLIENT_LIMIT = 30;

export const ClientList: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [importModalOpen, setImportModalOpen] = useState(false);

  const isStarterLimitReached =
    user?.plan === "starter" && clients.length >= STARTER_CLIENT_LIMIT;

  const loadClients = useCallback(async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      setError(null);
      const clientsData = await getClientsByNutritionist(user.uid);
      setClients(clientsData);
    } catch (error) {
      setError("Erro ao carregar pacientes");
      console.error("Erro ao carregar clientes:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  const filterClients = useCallback(() => {
    if (!searchQuery.trim()) {
      setFilteredClients(clients);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = clients.filter((client) =>
      client.fullName.toLowerCase().includes(query)
    );
    setFilteredClients(filtered);
  }, [searchQuery, clients]);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  useEffect(() => {
    filterClients();
  }, [filterClients]);

  const handleClientClick = (clientId: string) => {
    navigate(`/dashboard/clientes/${clientId}`);
  };

  const handleAddNewClient = () => {
    navigate("/dashboard/clientes/new");
  };

  if (loading) {
    return (
      <div className="client-list__loading">
        <FaSpinner className="client-list__spinner" />
        <p>Carregando pacientes...</p>
      </div>
    );
  }

  return (
    <div className="client-list">
      <div className="client-list__header">
        <div>
          <h1 className="client-list__title">Meus Pacientes</h1>
          <p className="client-list__subtitle">
            Gerencie seus pacientes e acompanhe o progresso
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <Button
            variant="secondary"
            onClick={() => setImportModalOpen(true)}
            className="client-list__add-button"
            disabled={isStarterLimitReached}
          >
            <FaFileImport /> Importar em lote
          </Button>
          <Button
            variant="primary"
            onClick={handleAddNewClient}
            className="client-list__add-button"
            disabled={isStarterLimitReached}
          >
            {isStarterLimitReached ? <FaLock /> : <FaPlus />}{" "}
            Adicionar Novo Paciente
          </Button>
        </div>
      </div>

      {isStarterLimitReached && (
        <div className="client-list__plan-limit-banner">
          <FaLock />
          <span>
            Você atingiu o limite de <strong>{STARTER_CLIENT_LIMIT} pacientes</strong> do
            plano Starter.{" "}
            <a href="/assinatura">Faça upgrade para o plano Plus</a> para ter pacientes
            ilimitados.
          </span>
        </div>
      )}

      <div className="client-list__search">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Buscar paciente por nome..."
        />
        <p className="client-list__count">
          {filteredClients.length}{" "}
          {filteredClients.length === 1
            ? "paciente encontrado"
            : "pacientes encontrados"}
        </p>
      </div>

      {error && (
        <div className="client-list__error">
          <p>{error}</p>
          <Button variant="primary" onClick={loadClients}>
            Tentar Novamente
          </Button>
        </div>
      )}

      {!error && filteredClients.length === 0 && !loading && (
        <div className="client-list__empty">
          <div className="client-list__empty-icon">
            <FaUserFriends size={64} />
          </div>
          <h3>Nenhum paciente encontrado</h3>
          <p>
            {searchQuery
              ? "Tente buscar com outros filtros."
              : "Comece adicionando um novo paciente."}
          </p>
          {!searchQuery && (
            <Button variant="primary" onClick={handleAddNewClient}>
              <FaPlus /> Adicionar Primeiro Paciente
            </Button>
          )}
        </div>
      )}

      {!error && filteredClients.length > 0 && (
        <div className="client-list__grid">
          {filteredClients.map((client) => (
            <ClientCard
              key={client.id}
              client={client}
              onClick={() => handleClientClick(client.id)}
            />
          ))}
        </div>
      )}
      {user?.uid && (
        <ImportClientsModal
          isOpen={importModalOpen}
          onClose={() => setImportModalOpen(false)}
          onSuccess={() => { setImportModalOpen(false); loadClients(); }}
          nutritionistId={user.uid}
        />
      )}
    </div>
  );
};
