import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaSave,
  FaSpinner,
  FaExclamationTriangle,
  FaCalculator,
  FaUser,
  FaPlus,
} from "react-icons/fa";
import { Button } from "../../components/ui/Button/Button";
import { MealSection } from "./components/MealSection";
import { getClientsByNutritionist } from "../../services/clientService";
import { createDiet } from "../../services/dietService";
import { useAuth } from "../../hooks/useAuth";
import type { Client } from "../../types/client";
import type { Meal } from "../../types/food";
import "./DietCalculator.css";

export const DietCalculator: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [dietName, setDietName] = useState("");
  const [dietDescription, setDietDescription] = useState("");
  const [height, setHeight] = useState<string>("");
  const [weight, setWeight] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true);

  const [meals, setMeals] = useState<Meal[]>([
    { id: "1", name: "cafe-manha", foods: [] },
    { id: "2", name: "almoco", foods: [] },
    { id: "3", name: "lanche", foods: [] },
    { id: "4", name: "jantar", foods: [] },
  ]);

  useEffect(() => {
    const initialize = async () => {
      if (!user?.uid) return;

      try {
        setInitializing(true);
        // Nota: Alimentos são buscados diretamente do Firestore através do foodService
        // O componente FoodSearch (usado em MealSection) utiliza getFoods() que consulta o banco de dados
        // Alimentos devem ser importados via sistema de importação (veja ImportTacoFoods)

        // Carregar clientes
        const clientsData = await getClientsByNutritionist(user.uid);
        setClients(clientsData);

        // Se houver clientId na URL, pré-selecionar o cliente
        const clientIdFromUrl = searchParams.get("clientId");
        if (clientIdFromUrl) {
          const client = clientsData.find((c) => c.id === clientIdFromUrl);
          if (client) {
            setSelectedClient(client);
            if (client.height) setHeight(client.height.toString());
            if (client.weight) setWeight(client.weight.toString());
          }
        }
      } catch (err) {
        console.error("Erro ao inicializar:", err);
        setError("Erro ao carregar dados. Tente novamente.");
      } finally {
        setInitializing(false);
      }
    };

    initialize();
  }, [user]);

  const handleMealUpdate = (updatedMeal: Meal) => {
    setMeals((prev) => prev.map((m) => (m.id === updatedMeal.id ? updatedMeal : m)));
  };

  const handleMealDelete = (mealId: string) => {
    if (!confirm("Deseja excluir esta refeição?")) return;
    setMeals((prev) => prev.filter((m) => m.id !== mealId));
  };

  const handleMealRename = (mealId: string, newName: string) => {
    setMeals((prev) => prev.map((m) => (m.id === mealId ? { ...m, name: newName } : m)));
  };

  const handleAddMeal = () => {
    const newId = String(Date.now());
    setMeals((prev) => [...prev, { id: newId, name: "Nova Refeição", foods: [] }]);
  };

  const calculateTotalNutrition = () => {
    return meals.reduce(
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

  const calculateBMI = (): number | null => {
    const heightNum = parseFloat(height);
    const weightNum = parseFloat(weight);
    
    if (heightNum > 0 && weightNum > 0) {
      // Altura em metros
      const heightInMeters = heightNum / 100;
      // IMC = peso (kg) / altura (m)²
      return weightNum / (heightInMeters * heightInMeters);
    }
    
    return null;
  };

  const getBMICategory = (bmi: number): { label: string; color: string } => {
    if (bmi < 18.5) return { label: "Abaixo do peso", color: "#3b82f6" };
    if (bmi < 25) return { label: "Peso normal", color: "#e88413" };
    if (bmi < 30) return { label: "Sobrepeso", color: "#f59e0b" };
    return { label: "Obesidade", color: "#ef4444" };
  };

  const handleSave = async () => {
    if (!selectedClient) {
      setError("Selecione um cliente");
      return;
    }

    if (!dietName.trim()) {
      setError("Nome da dieta é obrigatório");
      return;
    }

    if (!user?.uid) {
      setError("Usuário não autenticado");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      await createDiet(
        {
          clientId: selectedClient.id,
          name: dietName.trim(),
          description: dietDescription.trim() || undefined,
          meals: meals.map((meal) => ({
            name: meal.name,
            foods: meal.foods,
          })),
          height: height ? parseFloat(height) : undefined,
          weight: weight ? parseFloat(weight) : undefined,
        },
        user.uid
      );

      // Redirecionar para o perfil do cliente
      navigate(`/dashboard/clientes/${selectedClient.id}`);
    } catch (err) {
      console.error("Erro ao salvar dieta:", err);
      setError("Erro ao salvar dieta. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  if (initializing) {
    return (
      <div className="diet-calculator__loading">
        <FaSpinner className="diet-calculator__spinner" />
        <p>Carregando...</p>
      </div>
    );
  }

  const totals = calculateTotalNutrition();

  return (
    <div className="diet-calculator">
      <div className="diet-calculator__header">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard/clientes")}
          className="diet-calculator__back-button"
        >
          <FaArrowLeft /> Voltar
        </Button>
      </div>

      <div className="diet-calculator__title-section">
        <div className="diet-calculator__title-wrapper">
          <FaCalculator className="diet-calculator__title-icon" />
          <h1 className="diet-calculator__title">Calculadora de Dieta</h1>
        </div>
        <p className="diet-calculator__subtitle">
          Monte dietas personalizadas para seus pacientes
        </p>
      </div>

      {error && (
        <div className="diet-calculator__error">
          <FaExclamationTriangle />
          <p>{error}</p>
        </div>
      )}

      <div className="diet-calculator__form">
        {/* Seleção de Cliente */}
        <div className="diet-calculator__field">
          <label className="diet-calculator__label">
            Cliente <span className="diet-calculator__required">*</span>
          </label>
          {selectedClient ? (
            <div className="diet-calculator__client-selected">
              <FaUser />
              <span>{selectedClient.fullName}</span>
              <button
                type="button"
                onClick={() => {
                  setSelectedClient(null);
                  setHeight("");
                  setWeight("");
                }}
                className="diet-calculator__client-clear"
              >
                Alterar
              </button>
            </div>
          ) : (
            <select
              className="diet-calculator__select"
              value=""
              onChange={(e) => {
                const client = clients.find((c) => c.id === e.target.value);
                setSelectedClient(client || null);
                // Preencher altura e peso automaticamente
                if (client) {
                  setHeight(client.height?.toString() || "");
                  setWeight(client.weight?.toString() || "");
                } else {
                  setHeight("");
                  setWeight("");
                }
              }}
            >
              <option value="">Selecione um cliente...</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.fullName}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Nome da Dieta */}
        <div className="diet-calculator__field">
          <label className="diet-calculator__label">
            Nome da Dieta <span className="diet-calculator__required">*</span>
          </label>
          <input
            type="text"
            className="diet-calculator__input"
            value={dietName}
            onChange={(e) => setDietName(e.target.value)}
            placeholder="Ex: Dieta para Emagrecimento"
          />
        </div>

        {/* Descrição da Dieta */}
        <div className="diet-calculator__field">
          <label className="diet-calculator__label">Descrição (opcional)</label>
          <textarea
            className="diet-calculator__textarea"
            value={dietDescription}
            onChange={(e) => setDietDescription(e.target.value)}
            placeholder="Adicione observações sobre a dieta..."
            rows={3}
          />
        </div>

        {/* Altura e Peso */}
        <div className="diet-calculator__row">
          <div className="diet-calculator__field">
            <label className="diet-calculator__label">Altura (cm)</label>
            <input
              type="number"
              className="diet-calculator__input"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder="Ex: 175"
              min="0"
              step="0.1"
            />
          </div>
          <div className="diet-calculator__field">
            <label className="diet-calculator__label">Peso (kg)</label>
            <input
              type="number"
              className="diet-calculator__input"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="Ex: 70.5"
              min="0"
              step="0.1"
            />
          </div>
        </div>

        {/* IMC */}
        {calculateBMI() && (
          <div className="diet-calculator__bmi">
            <div className="diet-calculator__bmi-content">
              <span className="diet-calculator__bmi-label">IMC:</span>
              <span
                className="diet-calculator__bmi-value"
                style={{ color: getBMICategory(calculateBMI()!).color }}
              >
                {calculateBMI()!.toFixed(1)}
              </span>
              <span
                className="diet-calculator__bmi-category"
                style={{ color: getBMICategory(calculateBMI()!).color }}
              >
                ({getBMICategory(calculateBMI()!).label})
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Resumo Nutricional Total */}
      <div className="diet-calculator__summary">
        <h2 className="diet-calculator__summary-title">Resumo Nutricional Total</h2>
        <div className="diet-calculator__summary-grid">
          <div className="diet-calculator__summary-item">
            <span className="diet-calculator__summary-label">Calorias</span>
            <span className="diet-calculator__summary-value diet-calculator__summary-value--calories">
              {totals.calories.toFixed(0)} kcal
            </span>
          </div>
          <div className="diet-calculator__summary-item">
            <span className="diet-calculator__summary-label">Proteínas</span>
            <span className="diet-calculator__summary-value">
              {totals.protein.toFixed(1)}g
            </span>
          </div>
          <div className="diet-calculator__summary-item">
            <span className="diet-calculator__summary-label">Carboidratos</span>
            <span className="diet-calculator__summary-value">
              {totals.carbs.toFixed(1)}g
            </span>
          </div>
          <div className="diet-calculator__summary-item">
            <span className="diet-calculator__summary-label">Lipídeos</span>
            <span className="diet-calculator__summary-value">
              {totals.fat.toFixed(1)}g
            </span>
          </div>
        </div>
      </div>

      {/* Seções de Refeições */}
      <div className="diet-calculator__meals">
        {meals.map((meal) => (
          <MealSection
            key={meal.id}
            meal={meal}
            onUpdate={handleMealUpdate}
            onDelete={() => handleMealDelete(meal.id)}
            onRename={(name) => handleMealRename(meal.id, name)}
          />
        ))}
        <button className="diet-calculator__add-meal" onClick={handleAddMeal} type="button">
          <FaPlus /> Adicionar Refeição
        </button>
      </div>

      {/* Botão Salvar */}
      <div className="diet-calculator__actions">
        <Button
          variant="primary"
          size="large"
          onClick={handleSave}
          disabled={saving || !selectedClient || !dietName.trim()}
          fullWidth
        >
          {saving ? (
            <>
              <FaSpinner className="diet-calculator__spinner" /> Salvando...
            </>
          ) : (
            <>
              <FaSave /> Salvar Dieta
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

