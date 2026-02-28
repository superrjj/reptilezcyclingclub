/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary": "#16a34a", // green-600
        "accent": "#ef4444", // Red
        "background-light": "#fafafa", // off-white
        "background-dark": "#0a0a0a", // near black
        "reptilez-green": {
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
        },
        "reptilez-white": {
          50: "#ffffff",
          100: "#fafafa",
          200: "#f5f5f5",
          300: "#f0f0f0",
          400: "#e5e5e5",
        },
      },
      fontFamily: {
        "display": ["Poppins", "sans-serif"],
        "sans-simple": ["DM Sans", "sans-serif"]
      },
      borderRadius: {
        "DEFAULT": "0.75rem", // 12px
        "lg": "0.5rem",
        "xl": "0.75rem",
        "full": "9999px"
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries'),
  ],
}

