import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaSpinner,
  FaExchangeAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
  FaUtensils,
} from "react-icons/fa";
import { useAuth } from "../../hooks/useAuth";
import { getSubstitutionsByClient } from "../../services/substitutionService";
import { getClientByAuthUid } from "../../services/clientService";
import { getDietById } from "../../services/dietService";
import type { DietSubstitution } from "../../services/substitutionService";
import type { Diet } from "../../types/food";
import "./MySubstitutions.css";

const mealNames: Record<string, string> = {
  "cafe-manha": "Café da Manhã",
  almoco: "Almoço",
  lanche: "Lanche",
  jantar: "Jantar",
};

const statusLabels: Record<DietSubstitution["status"], string> = {
  pending: "Aguardando Aprovação",
  approved: "Aprovada",
  rejected: "Rejeitada",
  completed: "Concluída",
};

export const MySubstitutions: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [substitutions, setSubstitutions] = useState<DietSubstitution[]>([]);
  const [diets, setDiets] = useState<Record<string, Diet>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSubstitutions = useCallback(async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      setError(null);

      // Buscar cliente pelo authUid
      const client = await getClientByAuthUid(user.uid);
      if (!client) {
        setError("Paciente não encontrado");
        setLoading(false);
        return;
      }

      // Buscar solicitações de substituição
      const substitutionsData = await getSubstitutionsByClient(client.id);
      setSubstitutions(substitutionsData);

      // Buscar dietas relacionadas
      const dietIds = [...new Set(substitutionsData.map((s) => s.dietId))];
      const dietsData: Record<string, Diet> = {};
      for (const dietId of dietIds) {
        try {
          const diet = await getDietById(dietId);
          if (diet) {
            dietsData[dietId] = diet;
          }
        } catch (error) {
          console.error(`Erro ao carregar dieta ${dietId}:`, error);
        }
      }
      setDiets(dietsData);
    } catch (error) {
      console.error("Erro ao carregar solicitações:", error);
      setError("Erro ao carregar solicitações de substituição");
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    loadSubstitutions();
  }, [loadSubstitutions]);

  const getStatusInfo = (status: DietSubstitution["status"]) => {
    switch (status) {
      case "pending":
        return {
          icon: <FaHourglassHalf />,
          text: statusLabels.pending,
          color: "#f59e0b",
          bgColor: "#fef3c7",
        };
      case "approved":
        return {
          icon: <FaCheckCircle />,
          text: statusLabels.approved,
          color: "#10b981",
          bgColor: "#d1fae5",
        };
      case "rejected":
        return {
          icon: <FaTimesCircle />,
          text: statusLabels.rejected,
          color: "#ef4444",
          bgColor: "#fee2e2",
        };
      case "completed":
        return {
          icon: <FaCheckCircle />,
          text: statusLabels.completed,
          color: "#6b7280",
          bgColor: "#f3f4f6",
        };
      default:
        return {
          icon: <FaExchangeAlt />,
          text: status,
          color: "#6b7280",
          bgColor: "#f3f4f6",
        };
    }
  };

  const handleViewDiet = (dietId: string) => {
    navigate(`/dashboard/minhas-dietas/${dietId}`);
  };

  if (loading) {
    return (
      <div className="my-substitutions">
        <div className="my-substitutions__loading">
          <FaSpinner className="my-substitutions__spinner" />
          <p>Carregando solicitações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="my-substitutions">
      <div className="my-substitutions__header">
        <h1 className="my-substitutions__title">Minhas Solicitações de Substituição</h1>
        <p className="my-substitutions__subtitle">
          Acompanhe o status das suas solicitações de alteração na dieta
        </p>
      </div>

      {error && (
        <div className="my-substitutions__error">
          <p>{error}</p>
          <button onClick={loadSubstitutions}>Tentar Novamente</button>
        </div>
      )}

      {!error && substitutions.length === 0 && (
        <div className="my-substitutions__empty">
          <FaExchangeAlt size={48} />
          <p>Você ainda não possui solicitações de substituição</p>
          <p className="my-substitutions__empty-hint">
            Acesse uma dieta e clique em "Solicitar Substituição" para fazer uma solicitação
          </p>
        </div>
      )}

      {!error && substitutions.length > 0 && (
        <div className="my-substitutions__list">
          {substitutions.map((substitution) => {
            const statusInfo = getStatusInfo(substitution.status);
            const diet = diets[substitution.dietId];

            return (
              <div key={substitution.id} className="my-substitutions__card">
                <div className="my-substitutions__card-header">
                  <div className="my-substitutions__diet-info">
                    <FaUtensils />
                    <div>
                      <h3>{diet?.name || "Dieta não encontrada"}</h3>
                      <span className="my-substitutions__meal">
                        {mealNames[substitution.mealName]}
                      </span>
                    </div>
                  </div>
                  <div
                    className="my-substitutions__status"
                    style={{
                      color: statusInfo.color,
                      backgroundColor: statusInfo.bgColor,
                    }}
                  >
                    {statusInfo.icon}
                    <span>{statusInfo.text}</span>
                  </div>
                </div>

                <div className="my-substitutions__card-body">
                  <div className="my-substitutions__substitution-details">
                    <div className="my-substitutions__food-change">
                      <div className="my-substitutions__food-item">
                        <span className="my-substitutions__label">Alimento Original:</span>
                        <span className="my-substitutions__food-name">
                          {substitution.originalFoodName}
                        </span>
                      </div>
                      {substitution.requestedFoodName && (
                        <div className="my-substitutions__arrow">→</div>
                      )}
                      {substitution.requestedFoodName && (
                        <div className="my-substitutions__food-item">
                          <span className="my-substitutions__label">Alimento Solicitado:</span>
                          <span className="my-substitutions__food-name my-substitutions__food-name--requested">
                            {substitution.requestedFoodName}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="my-substitutions__reason">
                      <span className="my-substitutions__label">Motivo:</span>
                      <p>{substitution.reason}</p>
                    </div>
                  </div>

                  <div className="my-substitutions__card-footer">
                    <span className="my-substitutions__date">
                      Solicitado em:{" "}
                      {substitution.createdAt.toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {diet && (
                      <button
                        className="my-substitutions__view-diet-button"
                        onClick={() => handleViewDiet(substitution.dietId)}
                      >
                        Ver Dieta
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

