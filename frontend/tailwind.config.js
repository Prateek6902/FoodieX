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
          DEFAULT: "#FF9F1C",
          light: "#FFBF69",
          dark: "#E88C12",
          50: "#FFF8F0",
          100: "#FFEFE0",
          200: "#FFDFC2",
          300: "#FFCFA3",
          400: "#FFBF85",
          500: "#FF9F1C",
          600: "#E88C12",
          700: "#D07A0E",
          800: "#B8680A",
          900: "#A05606",
        },
        secondary: {
          DEFAULT: "#2EC4B6",
          light: "#CBF3F0",
          dark: "#25A89C",
          50: "#F0FBF9",
          100: "#E1F7F4",
          200: "#C3EFEA",
          300: "#A5E7DF",
          400: "#87DFD5",
          500: "#2EC4B6",
          600: "#25A89C",
          700: "#1D8C82",
          800: "#147068",
          900: "#0C544E",
        },
        background: {
          DEFAULT: "#FFFFFF",
          light: "#F8F9FA",
          dark: "#E9ECEF",
        },
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}