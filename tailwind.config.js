/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        polar: {
          surface: "#06080C",
          "surface-low": "#0B0E14",
          "surface-container": "#12161F",
          "surface-high": "#181C24",
          "surface-highest": "#232838",
          ice: "#7DD3FC",
          aurora: "#34D399",
          violet: "#A78BFA",
          ember: "#FB923C",
          critical: "#F04B4B",
          "on-surface": "#F1F3F7",
          "on-surface-variant": "#8B93A6",
          outline: "#333A4A",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      animation: {
        "pulse-glow": "pulseGlow 2.4s infinite ease-in-out",
        "flow-dash": "flowDash 1s linear infinite",
        "spin-slow": "spinSlow 8s linear infinite",
      },
      keyframes: {
        pulseGlow: {
          "0%, 100%": { opacity: "0.85", transform: "scale(1)" },
          "50%": { opacity: "0.4", transform: "scale(1.18)" },
        },
        flowDash: {
          to: { strokeDashoffset: "-24" },
        },
        spinSlow: {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
      },
    },
  },
  plugins: [],
};
