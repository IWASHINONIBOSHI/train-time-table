/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'pulse-fast': 'pulse 0.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-very-slow': 'pulse 5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      colors: {
        'sendai-green': '#2D5016',
        'sendai-blue': '#0077BE',
      }
    },
  },
  plugins: [],
}
