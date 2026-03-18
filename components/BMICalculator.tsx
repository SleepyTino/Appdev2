"use client";

import { useState } from "react";
import { Scale, Ruler, Calculator, Sun, Moon } from "lucide-react";
import { useTheme } from "./ThemeProvider";

type BMICategory = "underweight" | "normal" | "overweight" | "obese";

interface BMIResult {
  value: number;
  category: BMICategory;
}

const categoryInfo: Record<BMICategory, { label: string; color: string; bgColor: string }> = {
  underweight: { 
    label: "Underweight", 
    color: "text-blue-500 dark:text-blue-400", 
    bgColor: "bg-blue-100 dark:bg-blue-900/30" 
  },
  normal: { 
    label: "Normal", 
    color: "text-green-500 dark:text-green-400", 
    bgColor: "bg-green-100 dark:bg-green-900/30" 
  },
  overweight: { 
    label: "Overweight", 
    color: "text-yellow-500 dark:text-yellow-400", 
    bgColor: "bg-yellow-100 dark:bg-yellow-900/30" 
  },
  obese: { 
    label: "Obese", 
    color: "text-red-500 dark:text-red-400", 
    bgColor: "bg-red-100 dark:bg-red-900/30" 
  },
};

function getBMICategory(bmi: number): BMICategory {
  if (bmi < 18.5) return "underweight";
  if (bmi < 25) return "normal";
  if (bmi < 30) return "overweight";
  return "obese";
}

export default function BMICalculator() {
  const { theme, toggleTheme } = useTheme();
  const [heightUnit, setHeightUnit] = useState<"cm" | "m">("cm");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [errors, setErrors] = useState<{ height?: string; weight?: string }>({});
  const [result, setResult] = useState<BMIResult | null>(null);

  const validateInputs = (): boolean => {
    const newErrors: { height?: string; weight?: string } = {};
    
    if (!height.trim()) {
      newErrors.height = "Height is required";
    } else {
      const heightNum = parseFloat(height);
      if (isNaN(heightNum) || heightNum <= 0) {
        newErrors.height = "Height must be a positive number";
      } else if (heightUnit === "cm" && (heightNum < 50 || heightNum > 300)) {
        newErrors.height = "Height must be between 50-300 cm";
      } else if (heightUnit === "m" && (heightNum < 0.5 || heightNum > 3)) {
        newErrors.height = "Height must be between 0.5-3 m";
      }
    }

    if (!weight.trim()) {
      newErrors.weight = "Weight is required";
    } else {
      const weightNum = parseFloat(weight);
      if (isNaN(weightNum) || weightNum <= 0) {
        newErrors.weight = "Weight must be a positive number";
      } else if (weightNum < 10 || weightNum > 500) {
        newErrors.weight = "Weight must be between 10-500 kg";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateBMI = () => {
    if (!validateInputs()) return;

    const weightKg = parseFloat(weight);
    let heightM = parseFloat(height);
    
    if (heightUnit === "cm") {
      heightM = heightM / 100;
    }

    const bmi = weightKg / (heightM * heightM);
    const category = getBMICategory(bmi);

    setResult({ value: Math.round(bmi * 10) / 10, category });
  };

  const resetForm = () => {
    setHeight("");
    setWeight("");
    setErrors({});
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-surface-900 transition-colors duration-300">
      <div className="max-w-lg mx-auto px-4 py-8">
        {/* Theme Toggle */}
        <div className="flex justify-end mb-6">
          <button
            onClick={toggleTheme}
            className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700/50 
                       shadow-sm hover:shadow-md transition-all duration-200 
                       text-gray-600 dark:text-slate-400 hover:text-brand-500 dark:hover:text-brand-400"
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 
                          flex items-center justify-center mx-auto mb-4 shadow-brand">
            <Calculator className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            BMI Calculator
          </h1>
          <p className="text-gray-500 dark:text-slate-400 mt-2">
            Calculate your Body Mass Index
          </p>
        </div>

        {/* Calculator Card */}
        <div className="bg-white dark:bg-slate-800/60 rounded-2xl border border-gray-200 dark:border-white/5 
                        shadow-lg dark:shadow-card p-6 sm:p-8 backdrop-blur-sm">
          {/* Height Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              Height
            </label>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500">
                  <Ruler className="w-5 h-5" />
                </div>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => {
                    setHeight(e.target.value);
                    if (errors.height) setErrors((prev) => ({ ...prev, height: undefined }));
                  }}
                  placeholder={heightUnit === "cm" ? "e.g., 175" : "e.g., 1.75"}
                  className={`w-full pl-12 pr-4 py-3.5 rounded-xl text-sm transition-all duration-200 outline-none
                              bg-gray-50 dark:bg-slate-900/60 
                              border ${errors.height 
                                ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500/20" 
                                : "border-gray-200 dark:border-slate-700/50 focus:border-brand-400 focus:ring-1 focus:ring-brand-400/20"}
                              text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500`}
                />
              </div>
              <select
                value={heightUnit}
                onChange={(e) => setHeightUnit(e.target.value as "cm" | "m")}
                className="px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 outline-none cursor-pointer
                           bg-gray-50 dark:bg-slate-900/60 border border-gray-200 dark:border-slate-700/50 
                           text-gray-900 dark:text-white
                           focus:border-brand-400 focus:ring-1 focus:ring-brand-400/20"
              >
                <option value="cm">cm</option>
                <option value="m">m</option>
              </select>
            </div>
            {errors.height && (
              <p className="mt-1.5 text-xs text-red-500">{errors.height}</p>
            )}
          </div>

          {/* Weight Input */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              Weight (kg)
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500">
                <Scale className="w-5 h-5" />
              </div>
              <input
                type="number"
                value={weight}
                onChange={(e) => {
                  setWeight(e.target.value);
                  if (errors.weight) setErrors((prev) => ({ ...prev, weight: undefined }));
                }}
                placeholder="e.g., 70"
                className={`w-full pl-12 pr-4 py-3.5 rounded-xl text-sm transition-all duration-200 outline-none
                            bg-gray-50 dark:bg-slate-900/60 
                            border ${errors.weight 
                              ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500/20" 
                              : "border-gray-200 dark:border-slate-700/50 focus:border-brand-400 focus:ring-1 focus:ring-brand-400/20"}
                            text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500`}
              />
            </div>
            {errors.weight && (
              <p className="mt-1.5 text-xs text-red-500">{errors.weight}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={resetForm}
              className="flex-1 px-5 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200
                         bg-gray-100 dark:bg-slate-700 border border-gray-200 dark:border-slate-600/50
                         text-gray-700 dark:text-white
                         hover:bg-gray-200 dark:hover:bg-slate-600"
            >
              Reset
            </button>
            <button
              onClick={calculateBMI}
              className="flex-1 px-5 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200
                         bg-gradient-to-r from-brand-400 to-brand-500 text-white shadow-brand
                         hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0"
            >
              Calculate BMI
            </button>
          </div>
        </div>

        {/* Result Card */}
        {result && (
          <div className="mt-6 bg-white dark:bg-slate-800/60 rounded-2xl border border-gray-200 dark:border-white/5 
                          shadow-lg dark:shadow-card p-6 sm:p-8 backdrop-blur-sm animate-fadeIn">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white text-center mb-4">
              Your BMI Result
            </h2>
            
            <div className="text-center mb-6">
              <div className="text-5xl font-bold text-gray-900 dark:text-white mb-2">
                {result.value}
              </div>
              <div className={`inline-block px-4 py-2 rounded-full text-sm font-semibold 
                              ${categoryInfo[result.category].color} ${categoryInfo[result.category].bgColor}`}>
                {categoryInfo[result.category].label}
              </div>
            </div>

            {/* BMI Scale */}
            <div className="mt-6">
              <div className="flex rounded-full overflow-hidden h-3 mb-2">
                <div className="flex-1 bg-blue-400" />
                <div className="flex-1 bg-green-400" />
                <div className="flex-1 bg-yellow-400" />
                <div className="flex-1 bg-red-400" />
              </div>
              <div className="flex justify-between text-xs text-gray-500 dark:text-slate-400">
                <span>Under 18.5</span>
                <span>18.5-24.9</span>
                <span>25-29.9</span>
                <span>30+</span>
              </div>
            </div>

            {/* BMI Categories Reference */}
            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-slate-700/50">
              <h3 className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-3">
                BMI Categories
              </h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {(Object.entries(categoryInfo) as [BMICategory, typeof categoryInfo[BMICategory]][]).map(([key, info]) => (
                  <div key={key} className={`flex items-center gap-2 px-3 py-2 rounded-lg 
                                             ${result.category === key ? info.bgColor : "bg-gray-50 dark:bg-slate-900/40"}`}>
                    <span className={`w-2 h-2 rounded-full ${info.color.replace("text-", "bg-")}`} />
                    <span className={`${result.category === key ? info.color : "text-gray-600 dark:text-slate-400"}`}>
                      {info.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Health Disclaimer */}
        <p className="text-center text-xs text-gray-400 dark:text-slate-500 mt-6 px-4">
          BMI is a general indicator and may not accurately reflect body composition for athletes, 
          elderly, or pregnant individuals. Consult a healthcare professional for personalized advice.
        </p>
      </div>
    </div>
  );
}
