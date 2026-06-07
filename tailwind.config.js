/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2E7D32',
          light: '#E8F5E9',
          mid: '#43A047',
          dark: '#1B5E20',
        },
        secondary: {
          DEFAULT: '#F9A825',
          light: '#FFF8E1',
        },
        success: '#4CAF50',
        warning: '#FF9800',
        danger: '#D32F2F',
        hbg: '#F8FAF5',
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
