"use client";

import { useState, useEffect } from "react";
import {
  UtensilsCrossed,
  Coffee,
  Sun,
  Moon,
  Cookie,
  Plus,
  Trash2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Card from "@/components/ui/Card";

interface MealEntry {
  id: string;
  meal_type: string;
  food_item: string;
  calories: number;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  created_at: string;
}

const mealIcons: Record<string, typeof Coffee> = {
  breakfast: Coffee,
  lunch: Sun,
  dinner: Moon,
  snack: Cookie,
};

export default function MealsPage() {
  const [meals, setMeals] = useState<MealEntry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [mealType, setMealType] = useState("breakfast");
  const [foodItem, setFoodItem] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    loadMeals();
  }, []);

  const loadMeals = async () => {
    setIsLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const { data } = await supabase
      .from("meals")
      .select("*")
      .eq("user_id", user.id)
      .gte("created_at", todayStart.toISOString())
      .order("created_at", { ascending: false });

    setMeals(data || []);
    setIsLoading(false);
  };

  const logMeal = async () => {
    if (!foodItem || !calories) return;

    setIsSaving(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from("meals").insert({
        user_id: user.id,
        meal_type: mealType,
        food_item: foodItem,
        calories: parseInt(calories),
        protein: protein ? parseInt(protein) : null,
        carbs: carbs ? parseInt(carbs) : null,
        fat: fat ? parseInt(fat) : null,
      });

      if (error) throw error;

      // Reset & reload
      setFoodItem("");
      setCalories("");
      setProtein("");
      setCarbs("");
      setFat("");
      setShowForm(false);
      await loadMeals();
    } catch (err) {
      console.error("Failed to log meal:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const deleteMeal = async (id: string) => {
    await supabase.from("meals").delete().eq("id", id);
    setMeals((prev) => prev.filter((m) => m.id !== id));
  };

  const totalCalories = meals.reduce((sum, m) => sum + m.calories, 0);
  const totalProtein = meals.reduce((sum, m) => sum + (m.protein || 0), 0);
  const totalCarbs = meals.reduce((sum, m) => sum + (m.carbs || 0), 0);
  const totalFat = meals.reduce((sum, m) => sum + (m.fat || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Meals</h1>
          <p className="text-slate-400 text-sm mt-1">
            Track your daily nutrition
          </p>
        </div>
        <Button
          variant={showForm ? "ghost" : "primary"}
          size="sm"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Cancel" : <><Plus className="w-4 h-4" /> Log Meal</>}
        </Button>
      </div>

      {/* Today's Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Calories", value: totalCalories, unit: "kcal", color: "text-orange-400" },
          { label: "Protein", value: totalProtein, unit: "g", color: "text-blue-400" },
          { label: "Carbs", value: totalCarbs, unit: "g", color: "text-green-400" },
          { label: "Fat", value: totalFat, unit: "g", color: "text-yellow-400" },
        ].map((item) => (
          <div
            key={item.label}
            className="bg-slate-800/60 rounded-xl border border-white/5 p-4 text-center"
          >
            <p className={`text-xl font-bold ${item.color}`}>
              {item.value}
              <span className="text-xs text-slate-500 ml-1">{item.unit}</span>
            </p>
            <p className="text-[10px] text-slate-500 mt-1">{item.label}</p>
          </div>
        ))}
      </div>

      {/* Log Meal Form */}
      {showForm && (
        <Card padding="lg" className="space-y-4">
          <h3 className="font-semibold text-white">Log a Meal</h3>
          <Select
            label="Meal Type"
            value={mealType}
            onChange={(e) => setMealType(e.target.value)}
            options={[
              { value: "breakfast", label: "Breakfast" },
              { value: "lunch", label: "Lunch" },
              { value: "dinner", label: "Dinner" },
              { value: "snack", label: "Snack" },
            ]}
          />
          <Input
            label="Food Item"
            value={foodItem}
            onChange={(e) => setFoodItem(e.target.value)}
            placeholder="e.g., Grilled Chicken Salad"
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Calories"
              type="number"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              placeholder="kcal"
            />
            <Input
              label="Protein (g)"
              type="number"
              value={protein}
              onChange={(e) => setProtein(e.target.value)}
              placeholder="g"
            />
            <Input
              label="Carbs (g)"
              type="number"
              value={carbs}
              onChange={(e) => setCarbs(e.target.value)}
              placeholder="g"
            />
            <Input
              label="Fat (g)"
              type="number"
              value={fat}
              onChange={(e) => setFat(e.target.value)}
              placeholder="g"
            />
          </div>
          <Button
            variant="primary"
            fullWidth
            isLoading={isSaving}
            onClick={logMeal}
            disabled={!foodItem || !calories}
          >
            Log Meal
          </Button>
        </Card>
      )}

      {/* Meal List */}
      <div>
        <h3 className="text-sm font-semibold text-slate-300 mb-3">
          Today&apos;s Meals
        </h3>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-20 rounded-xl" />
            ))}
          </div>
        ) : meals.length === 0 ? (
          <Card className="text-center py-10">
            <UtensilsCrossed className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-sm text-slate-400">No meals logged today</p>
            <p className="text-xs text-slate-500 mt-1">
              Tap &quot;Log Meal&quot; to get started
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {meals.map((meal) => {
              const Icon = mealIcons[meal.meal_type] || UtensilsCrossed;
              return (
                <div
                  key={meal.id}
                  className="flex items-center gap-4 p-4 bg-slate-800/60 rounded-xl border border-white/5
                             hover:border-white/10 transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-brand-400/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-brand-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {meal.food_item}
                    </p>
                    <p className="text-xs text-slate-500 capitalize">
                      {meal.meal_type}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-semibold text-brand-400">
                      {meal.calories} kcal
                    </p>
                    <p className="text-[10px] text-slate-500">
                      P:{meal.protein || 0}g · C:{meal.carbs || 0}g · F:
                      {meal.fat || 0}g
                    </p>
                  </div>
                  <button
                    onClick={() => deleteMeal(meal.id)}
                    className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-400/10
                               opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
