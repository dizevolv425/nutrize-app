import React, { useState, useEffect } from "react";
import { FaPlus, FaEdit, FaTrash, FaToggleOn, FaToggleOff, FaSpinner } from "react-icons/fa";
import { Button } from "../../../components/ui/Button/Button";
import { useAuth } from "../../../hooks/useAuth";
import {
  getServicesByNutritionist,
  createService,
  updateService,
  deleteService,
  toggleServiceStatus,
} from "../../../services/serviceService";
import { maskCurrency, parseCurrency } from "../../../utils/masks";
import type { Service, CreateServiceData } from "../../../types/service";
import "./ServicesManager.css";

interface ServicesManagerProps {
  onServiceChange?: () => void;
}

export const ServicesManager: React.FC<ServicesManagerProps> = ({ onServiceChange }) => {
  const { user } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  // Form state
  const [formData, setFormData] = useState<CreateServiceData>({
    name: "",
    duration: 60,
    price: 0,
  });
  const [formErrors, setFormErrors] = useState<{
    name?: string;
    duration?: string;
    price?: string;
  }>({});
  const [priceDisplay, setPriceDisplay] = useState("R$ 0,00");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadServices();
  }, [user?.uid]);

  const loadServices = async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      setError(null);
      const data = await getServicesByNutritionist(user.uid);
      setServices(data);
    } catch (err) {
      console.error("Erro ao carregar serviços:", err);
      setError("Erro ao carregar serviços. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenForm = (service?: Service) => {
    setError(null);
    if (service) {
      setEditingService(service);
      setFormData({ name: service.name, duration: service.duration, price: service.price });
      setPriceDisplay(maskCurrency(Math.round(service.price * 100).toString()));
    } else {
      setEditingService(null);
      setFormData({ name: "", duration: 60, price: 0 });
      setPriceDisplay("R$ 0,00");
    }
    setFormErrors({});
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingService(null);
    setFormData({ name: "", duration: 60, price: 0 });
    setPriceDisplay("R$ 0,00");
    setFormErrors({});
  };

  const validateForm = (): boolean => {
    const errors: typeof formErrors = {};

    if (!formData.name.trim()) {
      errors.name = "Nome do serviço é obrigatório";
    }

    if (!formData.duration || formData.duration <= 0) {
      errors.duration = "Duração deve ser maior que 0";
    }

    if (formData.price < 0) {
      errors.price = "Valor não pode ser negativo";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !user?.uid) return;

    try {
      setSubmitting(true);
      setError(null);

      if (editingService) {
        await updateService(editingService.id, formData);
      } else {
        await createService(formData, user.uid);
      }

      await loadServices();
      handleCloseForm();
      onServiceChange?.();
    } catch (err) {
      console.error("Erro ao salvar serviço:", err);
      setError("Erro ao salvar serviço. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (service: Service) => {
    try {
      await toggleServiceStatus(service.id, !service.isActive);
      await loadServices();
      onServiceChange?.();
    } catch (err) {
      console.error("Erro ao alterar status:", err);
      setError("Erro ao alterar status do serviço.");
    }
  };

  const handleDelete = async (service: Service) => {
    if (!confirm(`Tem certeza que deseja excluir o serviço "${service.name}"?`)) {
      return;
    }

    try {
      await deleteService(service.id);
      await loadServices();
      onServiceChange?.();
    } catch (err) {
      console.error("Erro ao excluir serviço:", err);
      setError("Erro ao excluir serviço. Tente novamente.");
    }
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  if (loading) {
    return (
      <div className="services-manager__loading">
        <FaSpinner className="services-manager__spinner" />
        <p>Carregando serviços...</p>
      </div>
    );
  }

  return (
    <div className="services-manager">
      {error && (
        <div className="services-manager__error">
          <p>{error}</p>
        </div>
      )}

      <div className="services-manager__header">
        <div>
          <h3 className="services-manager__title">Seus Serviços</h3>
          <p className="services-manager__subtitle">
            Configure os serviços que você oferece
          </p>
        </div>
        <Button variant="primary" onClick={() => handleOpenForm()}>
          <FaPlus /> Adicionar Serviço
        </Button>
      </div>

      {services.length === 0 ? (
        <div className="services-manager__empty">
          <p>Nenhum serviço cadastrado ainda.</p>
          <p className="services-manager__empty-hint">
            Clique em "Adicionar Serviço" para começar.
          </p>
        </div>
      ) : (
        <div className="services-manager__list">
          {services.map((service) => (
            <div
              key={service.id}
              className={`services-manager__item ${
                !service.isActive ? "services-manager__item--inactive" : ""
              }`}
            >
              <div className="services-manager__item-main">
                <div className="services-manager__item-info">
                  <h4 className="services-manager__item-name">{service.name}</h4>
                  <div className="services-manager__item-details">
                    <span className="services-manager__item-duration">
                      {service.duration} min
                    </span>
                    <span className="services-manager__item-separator">•</span>
                    <span className="services-manager__item-price">
                      {formatCurrency(service.price)}
                    </span>
                    {!service.isActive && (
                      <>
                        <span className="services-manager__item-separator">•</span>
                        <span className="services-manager__item-status">Inativo</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="services-manager__item-actions">
                  <button
                    className="services-manager__action-btn services-manager__action-btn--toggle"
                    onClick={() => handleToggleStatus(service)}
                    title={service.isActive ? "Desativar" : "Ativar"}
                  >
                    {service.isActive ? <FaToggleOn /> : <FaToggleOff />}
                  </button>
                  <button
                    className="services-manager__action-btn services-manager__action-btn--edit"
                    onClick={() => handleOpenForm(service)}
                    title="Editar"
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="services-manager__action-btn services-manager__action-btn--delete"
                    onClick={() => handleDelete(service)}
                    title="Excluir"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isFormOpen && (
        <div className="services-manager__modal-overlay" onClick={handleCloseForm}>
          <div
            className="services-manager__modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="services-manager__modal-title">
              {editingService ? "Editar Serviço" : "Novo Serviço"}
            </h3>

            <form onSubmit={handleSubmit} className="services-manager__form">
              {error && (
                <div className="services-manager__form-error">
                  <p>{error}</p>
                </div>
              )}
              <div className="services-manager__field">
                <label className="services-manager__label">
                  Nome do Serviço <span className="services-manager__required">*</span>
                </label>
                <input
                  type="text"
                  className={`services-manager__input ${
                    formErrors.name ? "services-manager__input--error" : ""
                  }`}
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Ex: Consulta Individual"
                  disabled={submitting}
                />
                {formErrors.name && (
                  <span className="services-manager__error-text">
                    {formErrors.name}
                  </span>
                )}
              </div>

              <div className="services-manager__row">
                <div className="services-manager__field">
                  <label className="services-manager__label">
                    Duração (min) <span className="services-manager__required">*</span>
                  </label>
                  <input
                    type="number"
                    className={`services-manager__input ${
                      formErrors.duration ? "services-manager__input--error" : ""
                    }`}
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData({ ...formData, duration: Number(e.target.value) })
                    }
                    min="1"
                    max="480"
                    step="1"
                    disabled={submitting}
                  />
                  {formErrors.duration && (
                    <span className="services-manager__error-text">
                      {formErrors.duration}
                    </span>
                  )}
                </div>

                <div className="services-manager__field">
                  <label className="services-manager__label">
                    Valor (R$) <span className="services-manager__required">*</span>
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    className={`services-manager__input ${
                      formErrors.price ? "services-manager__input--error" : ""
                    }`}
                    value={priceDisplay}
                    onChange={(e) => {
                      const masked = maskCurrency(e.target.value);
                      setPriceDisplay(masked);
                      setFormData({ ...formData, price: parseCurrency(masked) });
                    }}
                    disabled={submitting}
                  />
                  {formErrors.price && (
                    <span className="services-manager__error-text">
                      {formErrors.price}
                    </span>
                  )}
                </div>
              </div>

              <div className="services-manager__modal-actions">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCloseForm}
                  disabled={submitting}
                >
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" disabled={submitting}>
                  {submitting ? (
                    <>
                      <FaSpinner className="services-manager__spinner" /> Salvando...
                    </>
                  ) : (
                    "Salvar"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
