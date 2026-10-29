/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        display: ["Space Grotesk", "sans-serif"],
      },
      colors: {
        ink: "#050611",
        panel: "#0b0d1b",
        violetGlow: "#8b5cf6",
        cyanGlow: "#22d3ee",
      },
      boxShadow: {
        neon: "0 0 35px rgba(124, 58, 237, .28)",
      },
    },
  },
  plugins: [],
};
