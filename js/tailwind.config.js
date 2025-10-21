/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./js/**/*.js",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'japan-red': '#dc2626',
        'japan-pink': '#ec4899',
        primary: '#FF6B9D',      // Sakura Pink (principal)
        secondary: '#4F46E5',    // Indigo Blue (secundario)
        accent: '#F59E0B'        // Warm Amber (acento)
      }
    },
  },
  plugins: [],
}