import React, { useState, useEffect, useRef, useCallback } from "react";
import { FaSearch, FaUser, FaTimes, FaPlus } from "react-icons/fa";
import { getClientsByNutritionist } from "../../../services/clientService";
import { useAuth } from "../../../hooks/useAuth";
import { QuickClientForm } from "./QuickClientForm";
import type { Client } from "../../../types/client";
import "./ClientSearch.css";

interface ClientSearchProps {
  onSelect: (client: Client) => void;
  selectedClient: Client | null;
  error?: string;
}

export const ClientSearch: React.FC<ClientSearchProps> = ({
  onSelect,
  selectedClient,
  error,
}) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [isQuickFormOpen, setIsQuickFormOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const loadClients = useCallback(async () => {
    if (!user?.uid) return;
    try {
      setLoading(true);
      const clientsData = await getClientsByNutritionist(user.uid);
      setClients(clientsData);
    } catch (error) {
      console.error("Erro ao carregar clientes:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  const filterClients = useCallback(() => {
    if (!searchTerm.trim()) {
      setFilteredClients(clients);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = clients.filter(
      (client) =>
        client.fullName.toLowerCase().includes(term) ||
        client.email.toLowerCase().includes(term) ||
        client.phone.toLowerCase().includes(term)
    );
    setFilteredClients(filtered);
  }, [searchTerm, clients]);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  useEffect(() => {
    filterClients();
  }, [filterClients]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelect = (client: Client) => {
    onSelect(client);
    setSearchTerm("");
    setIsOpen(false);
  };

  const handleClear = () => {
    onSelect(null as unknown as Client);
    setSearchTerm("");
    setIsOpen(false);
  };

  const handleInputChange = (value: string) => {
    setSearchTerm(value);
    setIsOpen(true);
  };

  const handleQuickFormSuccess = (newClient: Client) => {
    // Adicionar novo cliente à lista
    setClients((prev) => [newClient, ...prev]);
    // Selecionar automaticamente
    onSelect(newClient);
    setIsQuickFormOpen(false);
    setSearchTerm("");
    setIsOpen(false);
  };

  return (
    <div className="client-search" ref={wrapperRef}>
      <label className="client-search__label">
        Selecione o Paciente <span className="client-search__required">*</span>
      </label>

      {selectedClient ? (
        <div className="client-search__selected">
          <div className="client-search__selected-avatar">
            <FaUser />
          </div>
          <div className="client-search__selected-info">
            <span className="client-search__selected-name">
              {selectedClient.fullName}
            </span>
            <span className="client-search__selected-email">
              {selectedClient.email}
            </span>
          </div>
          <button
            type="button"
            className="client-search__selected-clear"
            onClick={handleClear}
          >
            <FaTimes />
          </button>
        </div>
      ) : (
        <div className="client-search__input-wrapper">
          <FaSearch className="client-search__icon" />
          <input
            type="text"
            className={`client-search__input ${
              error ? "client-search__input--error" : ""
            }`}
            placeholder="Buscar paciente por nome, email ou telefone..."
            value={searchTerm}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={() => setIsOpen(true)}
          />
        </div>
      )}

      {error && <span className="client-search__error">{error}</span>}

      {isOpen && !selectedClient && (
        <div className="client-search__dropdown">
          {loading ? (
            <div className="client-search__loading">Carregando pacientes...</div>
          ) : (
            <>
              {filteredClients.length === 0 ? (
                <div className="client-search__empty">
                  {searchTerm
                    ? "Nenhum paciente encontrado"
                    : "Nenhum paciente cadastrado"}
                </div>
              ) : (
                <ul className="client-search__list">
                  {filteredClients.map((client) => (
                    <li
                      key={client.id}
                      className="client-search__item"
                      onClick={() => handleSelect(client)}
                    >
                      <div className="client-search__item-avatar">
                        <FaUser />
                      </div>
                      <div className="client-search__item-info">
                        <span className="client-search__item-name">
                          {client.fullName}
                        </span>
                        <span className="client-search__item-email">
                          {client.email} • {client.phone}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              
              <button
                type="button"
                className="client-search__add-new"
                onClick={() => {
                  setIsOpen(false);
                  setIsQuickFormOpen(true);
                }}
              >
                <FaPlus /> Cadastrar novo paciente
              </button>
            </>
          )}
        </div>
      )}

      <QuickClientForm
        isOpen={isQuickFormOpen}
        onClose={() => setIsQuickFormOpen(false)}
        onSuccess={handleQuickFormSuccess}
      />
    </div>
  );
};
