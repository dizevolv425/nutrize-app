export interface Food {
  id: string;
  name: string;
  category: string;
  calories: number; // por 100g
  protein: number; // por 100g
  carbs: number; // por 100g
  fat: number; // por 100g
  fiber?: number; // por 100g
  unit: "gramas" | "unidades";
  unitWeight?: number; // peso de uma unidade em gramas (para alimentos vendidos por unidade)
  allowedMeals?: ("cafe-manha" | "almoco" | "lanche" | "jantar")[]; // refeições onde o alimento pode aparecer
  createdAt: Date;
  updatedAt: Date;
}

export interface MealFood {
  foodId: string;
  food: Food;
  quantity: number; // em gramas ou unidades
  unit: "gramas" | "unidades";
}

export interface Meal {
  id: string;
  name: string;
  foods: MealFood[];
}

export interface Diet {
  id: string;
  clientId: string;
  name: string;
  description?: string;
  meals: Meal[];
  height?: number; // altura em cm
  weight?: number; // peso em kg
  createdAt: Date;
  updatedAt: Date;
  nutritionistId: string;
}

export interface CreateDietData {
  clientId: string;
  name: string;
  description?: string;
  meals: Omit<Meal, "id">[];
  height?: number; // altura em cm
  weight?: number; // peso em kg
}

