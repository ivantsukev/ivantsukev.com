/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        // Backgrounds
        'bg-primary': '#0B0D0F',
        'bg-secondary': '#12161A',
        'bg-tertiary': '#1A1F25',
        // Text
        'text-primary': '#E8EAED',
        'text-secondary': '#9AA0A6',
        'text-muted': '#5F6368',
        // Accent (Neural Blue)
        'accent': '#4A9EFF',
        'accent-hover': '#6CB2FF',
        'accent-muted': 'rgba(74, 158, 255, 0.15)',
        // Secondary Accent (Purple)
        'accent-secondary': '#A78BFA',
        // Border
        'border': '#1F2937',
      },
      fontFamily: {
        'display': ['Inter', 'system-ui', 'sans-serif'],
        'body': ['"Source Serif 4"', 'Georgia', 'serif'],
        'mono': ['"JetBrains Mono"', 'monospace'],
      },
      fontSize: {
        'display-1': ['39px', { lineHeight: '1.2', fontWeight: '700' }],
        'display-2': ['25px', { lineHeight: '1.3', fontWeight: '600' }],
        'display-3': ['20px', { lineHeight: '1.4', fontWeight: '600' }],
        'body': ['18px', { lineHeight: '1.75' }],
      },
      maxWidth: {
        'prose': '680px',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'gradient-shift': 'gradientShift 8s ease infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.8' },
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-accent': 'linear-gradient(135deg, #4A9EFF 0%, #A78BFA 100%)',
      },
    },
  },
  plugins: [],
};
