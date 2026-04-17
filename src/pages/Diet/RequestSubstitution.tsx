import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaArrowLeft, FaSave, FaSpinner, FaExclamationTriangle } from "react-icons/fa";
import { Button } from "../../components/ui/Button/Button";
import { useAuth } from "../../hooks/useAuth";
import { getDietById } from "../../services/dietService";
import { getClientByAuthUid } from "../../services/clientService";
import { createSubstitutionRequest } from "../../services/substitutionService";
import { getFoods } from "../../services/foodService";
import type { Diet } from "../../types/food";
import type { Client } from "../../types/client";
import type { Food } from "../../types/food";
import "./RequestSubstitution.css";

const mealNames: Record<string, string> = {
  "cafe-manha": "Café da Manhã",
  almoco: "Almoço",
  lanche: "Lanche",
  jantar: "Jantar",
};

export const RequestSubstitution: React.FC = () => {
  const navigate = useNavigate();
  const { dietId } = useParams<{ dietId: string }>();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [diet, setDiet] = useState<Diet | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [selectedMeal, setSelectedMeal] = useState<string>("");
  const [selectedFood, setSelectedFood] = useState<string>("");
  const [requestedFood, setRequestedFood] = useState<string>("");
  const [reason, setReason] = useState("");
  const [foods, setFoods] = useState<Food[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const loadData = async () => {
      if (!dietId || !user?.uid) {
        setError("Dados não fornecidos");
        setLoadingData(false);
        return;
      }

      try {
        setLoadingData(true);
        setError(null);

        // Carregar cliente
        const clientData = await getClientByAuthUid(user.uid);
        if (!clientData) {
          setError("Paciente não encontrado");
          setLoadingData(false);
          return;
        }
        setClient(clientData);

        // Carregar dieta
        const dietData = await getDietById(dietId);
        if (!dietData) {
          setError("Dieta não encontrada");
          setLoadingData(false);
          return;
        }

        // Verificar se a dieta pertence ao cliente
        if (dietData.clientId !== clientData.id) {
          setError("Você não tem permissão para solicitar substituição nesta dieta");
          setLoadingData(false);
          return;
        }

        setDiet(dietData);

        // Carregar alimentos para busca
        const foodsData = await getFoods();
        setFoods(foodsData);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        setError("Erro ao carregar dados. Tente novamente.");
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, [dietId, user?.uid]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedMeal || !selectedFood || !reason.trim()) {
      setError("Preencha todos os campos obrigatórios");
      return;
    }

    if (!diet || !client) {
      setError("Dados não encontrados");
      return;
    }

    // Encontrar o alimento original na dieta
    const meal = diet.meals.find((m) => m.name === selectedMeal);
    if (!meal) {
      setError("Refeição não encontrada");
      return;
    }

    const originalMealFood = meal.foods.find((f) => f.foodId === selectedFood);
    if (!originalMealFood) {
      setError("Alimento não encontrado na dieta");
      return;
    }

    try {
      setLoading(true);
      await createSubstitutionRequest({
        dietId: diet.id,
        clientId: client.id,
        nutritionistId: diet.nutritionistId,
        mealName: selectedMeal as "cafe-manha" | "almoco" | "lanche" | "jantar",
        originalFoodId: selectedFood,
        originalFoodName: originalMealFood.food.name,
        requestedFoodId: requestedFood || undefined,
        requestedFoodName: requestedFood
          ? foods.find((f) => f.id === requestedFood)?.name
          : undefined,
        reason: reason.trim(),
      });

      navigate("/dashboard/minhas-dietas", {
        state: { message: "Solicitação de substituição enviada com sucesso!" },
      });
    } catch (err: any) {
      console.error("Erro ao solicitar substituição:", err);
      setError(err.message || "Erro ao solicitar substituição. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const filteredFoods = foods.filter((food) =>
    food.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loadingData) {
    return (
      <div className="request-substitution__loading">
        <FaSpinner className="request-substitution__spinner" />
        <p>Carregando...</p>
      </div>
    );
  }

  if (error && !diet) {
    return (
      <div className="request-substitution__error">
        <FaExclamationTriangle className="request-substitution__error-icon" />
        <h2>{error}</h2>
        <Button variant="primary" onClick={() => navigate("/dashboard/minhas-dietas")}>
          <FaArrowLeft /> Voltar
        </Button>
      </div>
    );
  }

  const availableMeals = diet?.meals.filter((meal) => meal.foods.length > 0) || [];
  const selectedMealData = diet?.meals.find((m) => m.name === selectedMeal);

  return (
    <div className="request-substitution">
      <div className="request-substitution__header">
        <Button
          variant="secondary"
          onClick={() => navigate(`/dashboard/minhas-dietas/${dietId}`)}
          className="request-substitution__back-button"
        >
          <FaArrowLeft /> Voltar
        </Button>
        <h1 className="request-substitution__title">Solicitar Substituição</h1>
      </div>

      {diet && (
        <div className="request-substitution__diet-info">
          <h2>{diet.name}</h2>
          {diet.description && <p>{diet.description}</p>}
        </div>
      )}

      <form onSubmit={handleSubmit} className="request-substitution__form">
        {error && (
          <div className="request-substitution__error-message">
            <FaExclamationTriangle /> {error}
          </div>
        )}

        <div className="request-substitution__field">
          <label htmlFor="meal" className="request-substitution__label">
            Refeição *
          </label>
          <select
            id="meal"
            value={selectedMeal}
            onChange={(e) => {
              setSelectedMeal(e.target.value);
              setSelectedFood("");
            }}
            className="request-substitution__select"
            required
          >
            <option value="">Selecione uma refeição</option>
            {availableMeals.map((meal) => (
              <option key={meal.id} value={meal.name}>
                {mealNames[meal.name]}
              </option>
            ))}
          </select>
        </div>

        {selectedMeal && selectedMealData && (
          <div className="request-substitution__field">
            <label htmlFor="food" className="request-substitution__label">
              Alimento a Substituir *
            </label>
            <select
              id="food"
              value={selectedFood}
              onChange={(e) => setSelectedFood(e.target.value)}
              className="request-substitution__select"
              required
            >
              <option value="">Selecione um alimento</option>
              {selectedMealData.foods.map((mealFood) => (
                <option key={mealFood.foodId} value={mealFood.foodId}>
                  {mealFood.food.name} ({mealFood.quantity}
                  {mealFood.unit === "gramas" ? "g" : " un"})
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="request-substitution__field">
          <label htmlFor="requestedFood" className="request-substitution__label">
            Alimento Desejado (Opcional)
          </label>
          <input
            type="text"
            id="requestedFood"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar alimento..."
            className="request-substitution__input"
          />
          {searchTerm && filteredFoods.length > 0 && (
            <div className="request-substitution__food-list">
              {filteredFoods.slice(0, 10).map((food) => (
                <div
                  key={food.id}
                  className="request-substitution__food-item"
                  onClick={() => {
                    setRequestedFood(food.id);
                    setSearchTerm(food.name);
                  }}
                >
                  {food.name}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="request-substitution__field">
          <label htmlFor="reason" className="request-substitution__label">
            Motivo da Substituição *
          </label>
          <textarea
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Explique o motivo da substituição (ex: alergia, indisponibilidade, preferência pessoal...)"
            className="request-substitution__textarea"
            rows={5}
            required
          />
        </div>

        <div className="request-substitution__actions">
          <Button
            variant="secondary"
            onClick={() => navigate(`/dashboard/minhas-dietas/${dietId}`)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? (
              <>
                <FaSpinner className="request-substitution__spinner" /> Enviando...
              </>
            ) : (
              <>
                <FaSave /> Enviar Solicitação
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

