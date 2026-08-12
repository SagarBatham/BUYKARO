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
        primary: '#ffffff',
        secondary: '#a3a3a3',
        danger: '#f5f5f5',
        success: '#e5e7eb',
        warning: '#d4d4d8',
      },
    },
  },
  plugins: [],
};
