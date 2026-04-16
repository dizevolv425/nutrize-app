import React, { useState, useEffect, useCallback } from "react";
import {
  FaSpinner,
  FaSearch,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSave,
  FaTimes,
  FaDatabase,
  FaArrowUp,
} from "react-icons/fa";
import { Button } from "../../components/ui/Button/Button";
import {
  getFoods,
  createFood,
  updateFood,
  deleteFood,
} from "../../services/foodService";
import tacoFoods from "../../data/taco-foods-complete.json";
import type { Food } from "../../types/food";
import "./FoodManagement.css";

export const FoodManagement: React.FC = () => {
  const [foods, setFoods] = useState<Food[]>([]);
  const [filteredFoods, setFilteredFoods] = useState<Food[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingFood, setEditingFood] = useState<Food | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [tacoConfirmOpen, setTacoConfirmOpen] = useState(false);
  const [tacoImporting, setTacoImporting] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 300);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () =>
    window.scrollTo({ top: 0, behavior: "smooth" });
  const [formData, setFormData] = useState<Partial<Food>>({
    name: "",
    category: "",
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    unit: "gramas",
    unitWeight: undefined,
  });

  const loadFoods = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const foodsData = await getFoods();
      setFoods(foodsData);
    } catch (error) {
      setError("Erro ao carregar alimentos");
      console.error("Erro ao carregar alimentos:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const filterFoods = useCallback(() => {
    if (!searchQuery.trim()) {
      setFilteredFoods(foods);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = foods.filter(
      (food) =>
        food.name.toLowerCase().includes(query) ||
        food.category.toLowerCase().includes(query)
    );
    setFilteredFoods(filtered);
  }, [searchQuery, foods]);

  useEffect(() => {
    loadFoods();
  }, [loadFoods]);

  useEffect(() => {
    filterFoods();
  }, [filterFoods]);

  const handleCreate = () => {
    setIsCreating(true);
    setEditingFood(null);
    setFormData({
      name: "",
      category: "",
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      unit: "gramas",
      unitWeight: undefined,
    });
  };

  const handleEdit = (food: Food) => {
    setEditingFood(food);
    setIsCreating(false);
    setFormData({
      name: food.name,
      category: food.category,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      fiber: food.fiber || 0,
      unit: food.unit,
      unitWeight: food.unitWeight,
    });
  };

  const handleCancel = () => {
    setEditingFood(null);
    setIsCreating(false);
    setFormData({
      name: "",
      category: "",
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      unit: "gramas",
      unitWeight: undefined,
    });
  };

  const handleSave = async () => {
    try {
      setError(null);

      if (!formData.name || !formData.category) {
        setError("Nome e categoria são obrigatórios");
        return;
      }

      if (isCreating) {
        await createFood({
          name: formData.name,
          category: formData.category,
          calories: formData.calories || 0,
          protein: formData.protein || 0,
          carbs: formData.carbs || 0,
          fat: formData.fat || 0,
          fiber: formData.fiber,
          unit: formData.unit || "gramas",
          unitWeight: formData.unitWeight,
        } as Omit<Food, "id" | "createdAt" | "updatedAt">);
      } else if (editingFood) {
        await updateFood(editingFood.id, {
          name: formData.name,
          category: formData.category,
          calories: formData.calories || 0,
          protein: formData.protein || 0,
          carbs: formData.carbs || 0,
          fat: formData.fat || 0,
          fiber: formData.fiber,
          unit: formData.unit || "gramas",
          unitWeight: formData.unitWeight,
        });
      }

      await loadFoods();
      handleCancel();
    } catch (error: any) {
      console.error("Erro ao salvar alimento:", error);
      setError(error.message || "Erro ao salvar alimento");
    }
  };

  const handleDelete = async (foodId: string) => {
    if (!window.confirm("Tem certeza que deseja excluir este alimento?")) {
      return;
    }

    try {
      await deleteFood(foodId);
      await loadFoods();
    } catch (error: any) {
      console.error("Erro ao excluir alimento:", error);
      setError(error.message || "Erro ao excluir alimento");
    }
  };

  const handleRestoreTaco = async () => {
    try {
      setTacoImporting(true);
      setError(null);
      const foods = (tacoFoods as { foods: Omit<Food, "id" | "createdAt" | "updatedAt">[] }).foods;
      for (const food of foods) {
        await createFood(food);
      }
      await loadFoods();
      setTacoConfirmOpen(false);
    } catch (err: any) {
      console.error("Erro ao importar base TACO:", err);
      setError(err.message || "Erro ao importar base TACO");
    } finally {
      setTacoImporting(false);
    }
  };

  if (loading) {
    return (
      <div className="food-management__loading">
        <FaSpinner className="food-management__spinner" />
        <p>Carregando alimentos...</p>
      </div>
    );
  }

  return (
    <div className="food-management">
      <div className="food-management__header">
        <div>
          <h1 className="food-management__title">Gerenciar Base de Alimentos</h1>
          <p className="food-management__subtitle">
            Adicione, edite ou remova alimentos da base de dados
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <Button variant="secondary" onClick={() => setTacoConfirmOpen(true)}>
            <FaDatabase /> Restaurar base TACO
          </Button>
          <Button variant="primary" onClick={handleCreate}>
            <FaPlus /> Adicionar Alimento
          </Button>
        </div>
      </div>

      <div className="food-management__search">
        <div className="food-management__search-wrapper">
          <FaSearch className="food-management__search-icon" />
          <input
            type="text"
            className="food-management__search-input"
            placeholder="Buscar por nome ou categoria..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <p className="food-management__count">
          {filteredFoods.length}{" "}
          {filteredFoods.length === 1 ? "alimento encontrado" : "alimentos encontrados"}
        </p>
      </div>

      {error && (
        <div className="food-management__error">
          <p>{error}</p>
          <Button variant="primary" onClick={() => setError(null)}>
            Fechar
          </Button>
        </div>
      )}

      {(isCreating || editingFood) && (
        <div className="food-management__form-container">
          <div className="food-management__form">
            <div className="food-management__form-header">
              <h2>{isCreating ? "Novo Alimento" : "Editar Alimento"}</h2>
              <Button variant="secondary" onClick={handleCancel}>
                <FaTimes /> Cancelar
              </Button>
            </div>

            <div className="food-management__form-grid">
              <div className="food-management__form-field">
                <label>Nome *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="food-management__form-field">
                <label>Categoria *</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                />
              </div>

              <div className="food-management__form-field">
                <label>Unidade</label>
                <select
                  value={formData.unit}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      unit: e.target.value as "gramas" | "unidades",
                    })
                  }
                >
                  <option value="gramas">Gramas</option>
                  <option value="unidades">Unidades</option>
                </select>
              </div>

              {formData.unit === "unidades" && (
                <div className="food-management__form-field">
                  <label>Peso por Unidade (g)</label>
                  <input
                    type="number"
                    value={formData.unitWeight || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        unitWeight: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                  />
                </div>
              )}

              <div className="food-management__form-field">
                <label>Calorias (por 100g)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.calories || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, calories: Number(e.target.value) })
                  }
                />
              </div>

              <div className="food-management__form-field">
                <label>Proteínas (por 100g)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.protein || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, protein: Number(e.target.value) })
                  }
                />
              </div>

              <div className="food-management__form-field">
                <label>Carboidratos (por 100g)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.carbs || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, carbs: Number(e.target.value) })
                  }
                />
              </div>

              <div className="food-management__form-field">
                <label>Lipídeos (por 100g)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.fat || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, fat: Number(e.target.value) })
                  }
                />
              </div>

              <div className="food-management__form-field">
                <label>Fibras (por 100g)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.fiber || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, fiber: Number(e.target.value) })
                  }
                />
              </div>

            </div>

            <div className="food-management__form-actions">
              <Button variant="primary" onClick={handleSave}>
                <FaSave /> Salvar
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="food-management__table-container">
        <table className="food-management__table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Categoria</th>
              <th>Calorias</th>
              <th>Proteínas</th>
              <th>Carboidratos</th>
              <th>Lipídeos</th>
              <th>Unidade</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredFoods.map((food) => (
              <tr key={food.id}>
                <td>{food.name}</td>
                <td>{food.category}</td>
                <td>{food.calories.toFixed(1)}</td>
                <td>{food.protein.toFixed(1)}g</td>
                <td>{food.carbs.toFixed(1)}g</td>
                <td>{food.fat.toFixed(1)}g</td>
                <td>{food.unit === "gramas" ? "g" : "un"}</td>
                <td>
                  <div className="food-management__actions">
                    <Button
                      variant="secondary"
                      size="small"
                      onClick={() => handleEdit(food)}
                    >
                      <FaEdit /> Editar
                    </Button>
                    <Button
                      variant="secondary"
                      size="small"
                      onClick={() => handleDelete(food.id)}
                    >
                      <FaTrash /> Excluir
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredFoods.length === 0 && !loading && (
        <div className="food-management__empty">
          <p>Nenhum alimento encontrado</p>
        </div>
      )}

      {tacoConfirmOpen && (
        <div className="food-management__modal-overlay">
          <div className="food-management__modal">
            <h2 className="food-management__modal-title">Restaurar Base TACO</h2>
            <p className="food-management__modal-text">
              Isso irá importar <strong>{(tacoFoods as { totalFoods: number }).totalFoods} alimentos</strong> da Tabela Brasileira de Composição de Alimentos (TACO/UNICAMP) para a base de dados.
              Os alimentos já existentes não serão removidos.
            </p>
            <p className="food-management__modal-text food-management__modal-text--warning">
              A operação pode demorar alguns minutos.
            </p>
            <div className="food-management__modal-actions">
              <Button variant="secondary" onClick={() => setTacoConfirmOpen(false)} disabled={tacoImporting}>
                Cancelar
              </Button>
              <Button variant="primary" onClick={handleRestoreTaco} disabled={tacoImporting}>
                {tacoImporting ? <><FaSpinner className="food-management__spinner" /> Importando...</> : <><FaDatabase /> Confirmar Importação</>}
              </Button>
            </div>
          </div>
        </div>
      )}

      {showBackToTop && (
        <button
          className="food-management__back-to-top"
          onClick={scrollToTop}
          aria-label="Voltar ao topo"
          title="Voltar ao topo"
        >
          <FaArrowUp />
        </button>
      )}
    </div>
  );
};

