import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FaSpinner, FaUtensils, FaSearch, FaExchangeAlt } from "react-icons/fa";
import { Button } from "../../components/ui/Button/Button";
import { getDietsByClient } from "../../services/dietService";
import { getClientByAuthUid } from "../../services/clientService";
import { useAuth } from "../../hooks/useAuth";
import type { Diet } from "../../types/food";
import "./DietList.css";

export const MyDiets: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [diets, setDiets] = useState<Diet[]>([]);
  const [filteredDiets, setFilteredDiets] = useState<Diet[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDiets = useCallback(async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      setError(null);
      
      // Buscar cliente pelo authUid
      const clientData = await getClientByAuthUid(user.uid);
      if (!clientData) {
        setError("Paciente não encontrado");
        setLoading(false);
        return;
      }
      
      // Buscar dietas do cliente
      const dietsData = await getDietsByClient(clientData.id);
      setDiets(dietsData);
    } catch (error) {
      setError("Erro ao carregar dietas");
      console.error("Erro ao carregar dietas:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  const filterDiets = useCallback(() => {
    if (!searchQuery.trim()) {
      setFilteredDiets(diets);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = diets.filter(
      (diet) =>
        diet.name.toLowerCase().includes(query) ||
        diet.description?.toLowerCase().includes(query)
    );
    setFilteredDiets(filtered);
  }, [searchQuery, diets]);

  useEffect(() => {
    loadDiets();
  }, [loadDiets]);

  useEffect(() => {
    filterDiets();
  }, [filterDiets]);

  const handleDietClick = (dietId: string) => {
    navigate(`/dashboard/minhas-dietas/${dietId}`);
  };

  const handleRequestSubstitution = (dietId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    navigate(`/dashboard/solicitar-substituicao/${dietId}`);
  };

  const calculateTotalNutrition = (diet: Diet) => {
    return diet.meals.reduce(
      (totals, meal) => {
        const mealTotals = meal.foods.reduce(
          (mealTotal, mealFood) => {
            const multiplier =
              mealFood.unit === "unidades" && mealFood.food.unitWeight
                ? (mealFood.quantity * mealFood.food.unitWeight) / 100
                : mealFood.quantity / 100;

            return {
              calories: mealTotal.calories + mealFood.food.calories * multiplier,
              protein: mealTotal.protein + mealFood.food.protein * multiplier,
              carbs: mealTotal.carbs + mealFood.food.carbs * multiplier,
              fat: mealTotal.fat + mealFood.food.fat * multiplier,
            };
          },
          { calories: 0, protein: 0, carbs: 0, fat: 0 }
        );

        return {
          calories: totals.calories + mealTotals.calories,
          protein: totals.protein + mealTotals.protein,
          carbs: totals.carbs + mealTotals.carbs,
          fat: totals.fat + mealTotals.fat,
        };
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  };

  if (loading) {
    return (
      <div className="diet-list__loading">
        <FaSpinner className="diet-list__spinner" />
        <p>Carregando suas dietas...</p>
      </div>
    );
  }

  return (
    <div className="diet-list">
      <div className="diet-list__header">
        <div>
          <h1 className="diet-list__title">Minhas Dietas</h1>
          <p className="diet-list__subtitle">
            Visualize todas as dietas prescritas pelo seu nutricionista
          </p>
        </div>
      </div>

      <div className="diet-list__search">
        <div className="diet-list__search-wrapper">
          <FaSearch className="diet-list__search-icon" />
          <input
            type="text"
            className="diet-list__search-input"
            placeholder="Buscar por nome da dieta ou descrição..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <p className="diet-list__count">
          {filteredDiets.length}{" "}
          {filteredDiets.length === 1 ? "dieta encontrada" : "dietas encontradas"}
        </p>
      </div>

      {error && (
        <div className="diet-list__error">
          <p>{error}</p>
          <Button variant="primary" onClick={loadDiets}>
            Tentar Novamente
          </Button>
        </div>
      )}

      {!error && filteredDiets.length === 0 && !loading && (
        <div className="diet-list__empty">
          <div className="diet-list__empty-icon">
            <FaUtensils size={64} />
          </div>
          <h3>Nenhuma dieta encontrada</h3>
          <p>
            {searchQuery
              ? "Tente buscar com outros filtros."
              : "Você ainda não possui dietas cadastradas. Entre em contato com seu nutricionista."}
          </p>
        </div>
      )}

      {!error && filteredDiets.length > 0 && (
        <div className="diet-list__grid">
          {filteredDiets.map((diet) => {
            const totals = calculateTotalNutrition(diet);
            return (
              <div
                key={diet.id}
                className="diet-card"
                onClick={() => handleDietClick(diet.id)}
              >
                <div className="diet-card__header">
                  <h3 className="diet-card__name">{diet.name}</h3>
                </div>

                {diet.description && (
                  <p className="diet-card__description">{diet.description}</p>
                )}

                <div className="diet-card__nutrition">
                  <div className="diet-card__nutrition-item">
                    <span className="diet-card__nutrition-label">Calorias</span>
                    <span className="diet-card__nutrition-value diet-card__nutrition-value--calories">
                      {totals.calories.toFixed(0)} kcal
                    </span>
                  </div>
                  <div className="diet-card__nutrition-item">
                    <span className="diet-card__nutrition-label">Proteínas</span>
                    <span className="diet-card__nutrition-value">
                      {totals.protein.toFixed(1)}g
                    </span>
                  </div>
                  <div className="diet-card__nutrition-item">
                    <span className="diet-card__nutrition-label">Carboidratos</span>
                    <span className="diet-card__nutrition-value">
                      {totals.carbs.toFixed(1)}g
                    </span>
                  </div>
                  <div className="diet-card__nutrition-item">
                    <span className="diet-card__nutrition-label">Lipídeos</span>
                    <span className="diet-card__nutrition-value">
                      {totals.fat.toFixed(1)}g
                    </span>
                  </div>
                </div>

                <div className="diet-card__footer">
                  <span className="diet-card__date">
                    Criada em: {diet.createdAt.toLocaleDateString("pt-BR")}
                  </span>
                  <Button
                    variant="secondary"
                    size="small"
                    onClick={() => handleRequestSubstitution(diet.id)}
                    className="diet-card__substitution-button"
                  >
                    <FaExchangeAlt /> Solicitar Substituição
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

