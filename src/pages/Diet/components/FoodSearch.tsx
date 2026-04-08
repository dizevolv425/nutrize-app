import React, { useState, useEffect, useRef } from "react";
import { FaSearch, FaSpinner } from "react-icons/fa";
import { getFoods } from "../../../services/foodService";
import type { Food } from "../../../types/food";
import "./FoodSearch.css";

interface FoodSearchProps {
  onSelect: (food: Food) => void;
  placeholder?: string;
}

export const FoodSearch: React.FC<FoodSearchProps> = ({
  onSelect,
  placeholder = "Buscar alimento...",
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      // Adicionar listener apenas quando o dropdown estiver aberto
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    const searchFoods = async () => {
      if (searchTerm.trim().length < 2) {
        setFoods([]);
        return;
      }

      setLoading(true);
      try {
        const results = await getFoods(searchTerm, undefined, 150);
        setFoods(results);
      } catch (error) {
        console.error("Erro ao buscar alimentos:", error);
        setFoods([]);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(searchFoods, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleSelect = (food: Food) => {
    onSelect(food);
    setSearchTerm("");
    setIsOpen(false);
  };

  const handleInputChange = (value: string) => {
    setSearchTerm(value);
    setIsOpen(true);
  };

  return (
    <div className="food-search" ref={wrapperRef}>
      <div className="food-search__input-wrapper">
        <FaSearch className="food-search__icon" />
        <input
          type="text"
          className="food-search__input"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => setIsOpen(true)}
        />
        {loading && (
          <FaSpinner className="food-search__spinner" />
        )}
      </div>

      {isOpen && searchTerm.trim().length >= 2 && (
        <div className="food-search__dropdown">
          {loading ? (
            <div className="food-search__loading">
              <FaSpinner className="food-search__spinner" />
              <span>Buscando...</span>
            </div>
          ) : foods.length === 0 ? (
            <div className="food-search__empty">
              <p>Nenhum alimento encontrado</p>
            </div>
          ) : (
            <ul className="food-search__list">
              {foods.map((food, index) => (
                <li
                  key={`${food.id}-${index}`}
                  className="food-search__item"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSelect(food);
                  }}
                  onMouseDown={(e) => {
                    // Permitir o evento mousedown para que o clique funcione
                    e.stopPropagation();
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleSelect(food);
                    }
                  }}
                >
                  <div className="food-search__item-info">
                    <span className="food-search__item-name">{food.name}</span>
                    <span className="food-search__item-category">
                      {food.category}
                    </span>
                  </div>
                  <div className="food-search__item-nutrition">
                    <span>{food.calories} kcal</span>
                    <span>P: {food.protein}g | C: {food.carbs}g | L: {food.fat}g</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

