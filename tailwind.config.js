/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        pakistan: {
          green: '#16a34a',
          yellow: '#f59e0b',
          blue: '#0ea5e9',
          navy: '#1e3a8a',
        }
      },
      fontFamily: {
        'poppins': ['Poppins', 'sans-serif'],
        'inter': ['Inter', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'scale-in': 'scaleIn 0.6s ease-out',
        'float': 'float 6s ease-in-out infinite',
        'gradient-shift': 'gradientShift 15s ease infinite',
        'particle-float': 'particleFloat 40s linear infinite',
        'background-float': 'floatBackground 20s ease-in-out infinite',
        'star-pulse': 'starPulse 8s ease-in-out infinite',
        'confetti': 'confetti 3s linear infinite',
        'balloon-float': 'balloonFloat 8s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.8)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '33%': { transform: 'translateY(-20px) rotate(5deg)' },
          '66%': { transform: 'translateY(10px) rotate(-5deg)' },
        },
        gradientShift: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        particleFloat: {
          '0%': { transform: 'translateY(0px) translateX(0px)' },
          '100%': { transform: 'translateY(-1000px) translateX(200px)' },
        },
        floatBackground: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)', opacity: '0.3' },
          '33%': { transform: 'translateY(-20px) rotate(120deg)', opacity: '0.4' },
          '66%': { transform: 'translateY(20px) rotate(240deg)', opacity: '0.3' },
        },
        starPulse: {
          '0%, 100%': { opacity: '0.3', transform: 'translate(-50%, -50%) scale(1)' },
          '50%': { opacity: '0.6', transform: 'translate(-50%, -50%) scale(1.1)' },
        },
        confetti: {
          '0%': { transform: 'translateY(-100vh) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(100vh) rotate(360deg)', opacity: '0' },
        },
        balloonFloat: {
          '0%, 100%': { transform: 'translateY(0px) translateX(0px) rotate(0deg)' },
          '25%': { transform: 'translateY(-20px) translateX(10px) rotate(5deg)' },
          '50%': { transform: 'translateY(-40px) translateX(-5px) rotate(-5deg)' },
          '75%': { transform: 'translateY(-20px) translateX(5px) rotate(3deg)' },
        }
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}