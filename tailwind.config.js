/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cafe: {
          dark: '#0f231a',       // Deepest dark forest background
          card: '#163327',       // Main graph & container dark green
          cardLight: '#1e4233',  // Slightly lighter green
          border: '#27523f',     // Subtle green border
          cream: '#f4ede2',      // Warm cream for headers, banner & tiles
          creamLight: '#faf6f0', // Crisp off-white cream
          beige: '#e5d7c5',      // Sand/beige bevel accents
          accent: '#4ade80',     // Bright mint green accent
          accentDark: '#27a35e', // Medium green accent
          gold: '#d9a752',       // Warm amber/gold accent
          orange: '#e67e22',     // Swiggy / Online badge orange
          zomato: '#cb202d',     // Zomato red
          redAlert: '#dc2626',   // Low stock alert red
        }
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'tile': '0 8px 24px -4px rgba(0, 0, 0, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.4)',
        'tile-inset': 'inset 0 2px 4px rgba(0, 0, 0, 0.15)',
        'green-glow': '0 0 20px rgba(74, 222, 128, 0.25)',
      }
    },
  },
  plugins: [],
}
