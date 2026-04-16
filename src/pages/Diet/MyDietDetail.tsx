import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaSpinner,
  FaExclamationTriangle,
  FaExchangeAlt,
} from "react-icons/fa";
import { Button } from "../../components/ui/Button/Button";
import { MealSection } from "./components/MealSection";
import { getDietById } from "../../services/dietService";
import { getClientByAuthUid } from "../../services/clientService";
import { useAuth } from "../../hooks/useAuth";
import type { Diet } from "../../types/food";
import "./DietDetail.css";

export const MyDietDetail: React.FC = () => {
  const navigate = useNavigate();
  const { dietId } = useParams<{ dietId: string }>();
  const { user } = useAuth();
  const [diet, setDiet] = useState<Diet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDiet = async () => {
      if (!dietId || !user?.uid) {
        setError("ID da dieta não fornecido");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Verificar se o cliente está autenticado
        const clientData = await getClientByAuthUid(user.uid);
        if (!clientData) {
          setError("Paciente não encontrado");
          setLoading(false);
          return;
        }

        const dietData = await getDietById(dietId);
        if (!dietData) {
          setError("Dieta não encontrada");
          setLoading(false);
          return;
        }

        // Verificar se a dieta pertence ao cliente
        if (dietData.clientId !== clientData.id) {
          setError("Você não tem permissão para visualizar esta dieta");
          setLoading(false);
          return;
        }

        setDiet(dietData);
      } catch (error) {
        setError("Erro ao carregar dieta");
        console.error("Erro ao carregar dieta:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDiet();
  }, [dietId, user?.uid]);

  const calculateTotalNutrition = () => {
    if (!diet) return { calories: 0, protein: 0, carbs: 0, fat: 0 };

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
      <div className="diet-detail__loading">
        <FaSpinner className="diet-detail__spinner" />
        <p>Carregando dieta...</p>
      </div>
    );
  }

  if (error || !diet) {
    return (
      <div className="diet-detail__error">
        <FaExclamationTriangle className="diet-detail__error-icon" />
        <h2>{error || "Dieta não encontrada"}</h2>
        <Button variant="primary" onClick={() => navigate("/dashboard/minhas-dietas")}>
          <FaArrowLeft /> Voltar para Lista
        </Button>
      </div>
    );
  }

  const totals = calculateTotalNutrition();

  return (
    <div className="diet-detail">
      <div className="diet-detail__header">
        <Button
          variant="secondary"
          onClick={() => navigate("/dashboard/minhas-dietas")}
          className="diet-detail__back-button"
        >
          <FaArrowLeft /> Voltar
        </Button>

        <div className="diet-detail__actions">
          <Button
            variant="primary"
            onClick={() => navigate(`/dashboard/solicitar-substituicao/${diet.id}`)}
            className="diet-detail__substitution-button"
          >
            <FaExchangeAlt /> Solicitar Substituição
          </Button>
        </div>
      </div>

      <div className="diet-detail__info">
        <div className="diet-detail__title-section">
          <h1 className="diet-detail__title">{diet.name}</h1>
          {diet.description && (
            <p className="diet-detail__description">{diet.description}</p>
          )}
          <div className="diet-detail__meta">
            <span>
              Criada em: {diet.createdAt.toLocaleDateString("pt-BR")}
            </span>
            {diet.height && diet.weight && (
              <span>
                Altura: {diet.height}cm | Peso: {diet.weight}kg
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="diet-detail__summary">
        <h2 className="diet-detail__summary-title">Resumo Nutricional Total</h2>
        <div className="diet-detail__summary-grid">
          <div className="diet-detail__summary-item">
            <span className="diet-detail__summary-label">Calorias</span>
            <span className="diet-detail__summary-value diet-detail__summary-value--calories">
              {totals.calories.toFixed(0)} kcal
            </span>
          </div>
          <div className="diet-detail__summary-item">
            <span className="diet-detail__summary-label">Proteínas</span>
            <span className="diet-detail__summary-value">
              {totals.protein.toFixed(1)}g
            </span>
          </div>
          <div className="diet-detail__summary-item">
            <span className="diet-detail__summary-label">Carboidratos</span>
            <span className="diet-detail__summary-value">
              {totals.carbs.toFixed(1)}g
            </span>
          </div>
          <div className="diet-detail__summary-item">
            <span className="diet-detail__summary-label">Lipídeos</span>
            <span className="diet-detail__summary-value">
              {totals.fat.toFixed(1)}g
            </span>
          </div>
        </div>
      </div>

      <div className="diet-detail__meals">
        {diet.meals
          .filter((meal) => meal.foods.length > 0)
          .map((meal) => (
            <MealSection key={meal.id} meal={meal} onUpdate={() => {}} readOnly={true} />
          ))}
      </div>
    </div>
  );
};

