/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        romantic: {
          hot: '#FF4D8D',
          rose: '#FFB3CF',
          blush: '#FFF0F6',
          berry: '#C2185B',
          deep: '#9B1146',
          peach: '#FFB09C',
          lavender: '#E8D5FF',
          darkBg: '#120710',
          darkCard: '#1E0C1C',
          darkBorder: '#381632',
          darkBubble: '#2A1026',
        }
      },
      fontFamily: {
        romantic: ['"Dancing Script"', 'cursive'],
        sans: ['"Nunito"', 'sans-serif'],
        display: ['"Poppins"', 'sans-serif'],
      },
      borderRadius: {
        'romantic': '24px',
        'romantic-lg': '28px',
        'romantic-xl': '36px',
      },
      boxShadow: {
        'glow': '0 0 25px -3px rgba(255, 77, 141, 0.4)',
        'glow-lg': '0 0 40px -5px rgba(255, 77, 141, 0.6)',
        'glass': '0 8px 32px 0 rgba(255, 77, 141, 0.12)',
        'glass-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.45)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.85', transform: 'scale(1.05)' },
        },
        heartRain: {
          '0%': { transform: 'translateY(100vh) scale(0.6)', opacity: '0' },
          '20%': { opacity: '0.9' },
          '80%': { opacity: '0.9' },
          '100%': { transform: 'translateY(-20vh) scale(1.2)', opacity: '0' }
        }
      },
      animation: {
        float: 'float 3s ease-in-out infinite',
        pulseGlow: 'pulseGlow 2s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}
