/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        unipus: {
          primary: '#00A9FF',
          primaryDark: '#0088CC',
          secondary: '#89CFF3',
          accent: '#A0E9FF',
          surface: '#CDF5FD',
          dark: '#0F172A',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 169, 255, 0.08)',
        'glow': '0 8px 25px -4px rgba(0, 169, 255, 0.28)',
      },
    },
  },
  plugins: [],
};
