import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#1FC7D4",
          50: "#EAFCFD",
          100: "#C4F3F6",
          200: "#8CE7ED",
          300: "#54DBE4",
          400: "#1FC7D4",
          500: "#1AB0BC",
          600: "#14899A",
          700: "#0F6678",
          800: "#0A4456",
          900: "#052234",
        },
        surface: {
          DEFAULT: "#1a2332",
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          700: "#1e293b",
          800: "#1a2332",
          900: "#0d1620",
          950: "#080e18",
        },
      },
      fontFamily: {
        sans: [
          "var(--font-inter)",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      backgroundImage: {
        "gradient-brand": "linear-gradient(135deg, #1FC7D4, #14b8c7)",
        "gradient-surface":
          "linear-gradient(180deg, #0d1620 0%, #1a2332 100%)",
      },
      boxShadow: {
        brand: "0 8px 20px rgba(31, 199, 212, 0.4)",
        card: "0 4px 24px rgba(0, 0, 0, 0.2)",
        "card-hover": "0 8px 32px rgba(0, 0, 0, 0.3)",
      },
    },
  },
  plugins: [],
};

export default config;
