/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        google: {
          blue: '#1a73e8',
          'blue-hover': '#1557b0',
          red: '#d93025',
          'red-hover': '#b3261e',
          yellow: '#f9ab00',
          'yellow-hover': '#e09200',
          green: '#1e8e3e',
          'green-hover': '#167d34',
          gray: '#5f6368',
          'gray-bg': '#f8f9fa',
          'gray-border': '#dadce0',
          dark: '#202124',
        },
      },
      fontFamily: {
        sans: [
          'Google Sans',
          'Roboto',
          'system-ui',
          '-apple-system',
          'sans-serif',
        ],
      },
      boxShadow: {
        'google': '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08)',
        'google-hover': '0 1px 5px rgba(0,0,0,0.2), 0 2px 4px rgba(0,0,0,0.12)',
        'google-btn': '0 1px 3px rgba(26,115,232,0.3)',
      },
    },
  },
  plugins: [],
};
