import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#1a2332",
          50: "#f0f3f7",
          100: "#d9e0ea",
          200: "#b3c1d5",
          300: "#8da2c0",
          400: "#6783ab",
          500: "#4a648f",
          600: "#3a5072",
          700: "#2b3c55",
          800: "#1a2332",
          900: "#0f1620",
        },
        royal: {
          DEFAULT: "#c5a059",
          50: "#faf6ef",
          100: "#f3ead5",
          200: "#e7d5ab",
          300: "#d9bc7d",
          400: "#c5a059",
          500: "#b08840",
          600: "#946d33",
          700: "#78542a",
          800: "#624425",
          900: "#523a22",
        },
        cream: "#f8f6f2",
        parchment: "#f3efe6",
      },
      fontFamily: {
        serif: ["var(--font-playfair)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 4px 24px rgba(26, 35, 50, 0.08)",
        "card-lg": "0 8px 40px rgba(26, 35, 50, 0.12)",
        gold: "0 0 40px rgba(197, 160, 89, 0.35)",
      },
      backgroundImage: {
        "hero-overlay":
          "linear-gradient(to bottom, rgba(15,22,32,0.75) 0%, rgba(15,22,32,0.45) 50%, rgba(15,22,32,0.85) 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
