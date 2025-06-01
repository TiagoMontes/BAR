/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1a56db',
        secondary: '#7c3aed',
        success: '#059669',
        danger: '#dc2626',
        warning: '#d97706',
      },
    },
  },
  plugins: [],
} 