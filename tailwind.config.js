/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./login.html",
    "./dashboard.html",
    "./js/**/*.js",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      colors: {
        'japan-red': '#dc2626',
        'japan-pink': '#ec4899',
        'jp-purple': '#7c3aed',
        'jp-purple-light': '#a855f7',
        'jp-red': '#dc2626',
        'jp-pink': '#db2777',
        'jp-dark': '#0f0a1e',
        primary: '#FF6B9D',      // Sakura Pink (principal)
        secondary: '#4F46E5',    // Indigo Blue (secundario)
        accent: '#F59E0B'        // Warm Amber (acento)
      }
    },
  },
  plugins: [],
}
