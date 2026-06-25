/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        omni: {
          bg: "#0d0d14",
          card: "#13131f",
          border: "#1e1e2e",
          indigo: "#6366f1",
          purple: "#8b5cf6",
          cyan: "#22d3ee",
          emerald: "#34d399",
          rose: "#fb7185",
        },
      },
      fontFamily: {
        mono: ["JetBrains Mono", "SFMono-Regular", "Consolas", "monospace"],
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 40px rgba(99, 102, 241, 0.16)",
      },
    },
  },
  plugins: [],
};
