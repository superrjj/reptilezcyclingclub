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
        "background-light": "#f3f4f6", // gray-100
        "background-dark": "#0a0a0a", // near black
      },
      fontFamily: {
        "display": ["Roboto", "sans-serif"]
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

