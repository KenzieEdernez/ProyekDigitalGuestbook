import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
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
        blush: "#f9f0ed",
        champagne: "#faf7f2",
      },
      fontFamily: {
        serif: ["var(--font-playfair)", "Georgia", "serif"],
        display: ["var(--font-cormorant)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 4px 24px rgba(26, 35, 50, 0.08)",
        "card-lg": "0 8px 40px rgba(26, 35, 50, 0.12)",
        gold: "0 0 40px rgba(197, 160, 89, 0.35)",
        glow: "0 0 60px rgba(197, 160, 89, 0.2)",
        soft: "0 20px 60px rgba(26, 35, 50, 0.06)",
        inner: "inset 0 1px 0 rgba(255,255,255,0.6)",
      },
      backgroundImage: {
        "hero-overlay":
          "linear-gradient(to bottom, rgba(15,22,32,0.75) 0%, rgba(15,22,32,0.45) 50%, rgba(15,22,32,0.85) 100%)",
        "gold-shimmer":
          "linear-gradient(110deg, transparent 25%, rgba(197,160,89,0.15) 50%, transparent 75%)",
        "radial-gold":
          "radial-gradient(ellipse at center, rgba(197,160,89,0.12) 0%, transparent 70%)",
      },
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
        "out-quart": "cubic-bezier(0.25, 1, 0.5, 1)",
        spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        shimmer: "shimmer 3s ease-in-out infinite",
        "pulse-soft": "pulseSoft 3s ease-in-out infinite",
        "fade-in": "fadeIn 0.8s ease-out forwards",
        "slide-up": "slideUp 0.8s cubic-bezier(0.16,1,0.3,1) forwards",
        "scale-in": "scaleIn 0.6s cubic-bezier(0.16,1,0.3,1) forwards",
        "spin-slow": "spin 12s linear infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "1" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(40px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          from: { opacity: "0", transform: "scale(0.92)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
