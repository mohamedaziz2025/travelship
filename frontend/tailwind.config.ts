import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: '#3B82F6',
          light: '#60A5FA',
          dark: '#2563EB',
          gradient: {
            from: '#3B82F6',
            to: '#9333EA',
          },
        },
        secondary: {
          DEFAULT: '#9333EA',
          light: '#A855F7',
          dark: '#7C3AED',
        },
        accent: {
          DEFAULT: '#00E5A8',
          light: '#34EDB8',
          dark: '#00C792',
        },
        dark: {
          DEFAULT: '#0F172A',
          light: '#1E293B',
          lighter: '#334155',
        },
        light: {
          DEFAULT: '#F8FAFC',
          dark: '#F1F5F9',
          darker: '#E2E8F0',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: '20px',
        md: '16px',
        sm: '12px',
      },
      fontFamily: {
        sans: ['Inter', 'SF Pro Display', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 10px 40px rgba(0, 0, 0, 0.15)',
        'premium': '0 20px 60px rgba(59, 130, 246, 0.3)',
        'lift': '0 8px 30px rgba(0, 0, 0, 0.12)',
      },
      backdropBlur: {
        glass: '16px',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #3B82F6 0%, #9333EA 100%)',
        'gradient-accent': 'linear-gradient(135deg, #00E5A8 0%, #3B82F6 100%)',
        'gradient-dark': 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-out',
        'fade-up': 'fade-up 0.6s ease-out',
        'slide-in': 'slide-in 0.3s ease-out',
        'scale-in': 'scale-in 0.3s ease-out',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
}

export default config
