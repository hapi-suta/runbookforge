/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          DEFAULT: '#0a0f1a',
          card: '#111827',
          'card-hover': '#1f2937',
          border: '#1e293b',
        },
        accent: {
          teal: '#14b8a6',
          emerald: '#10b981',
          sky: '#0ea5e9',
          violet: '#8b5cf6',
          amber: '#f59e0b',
          orange: '#f97316',
          red: '#ef4444',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'slide-up': 'slideUp 0.5s ease-out',
        'fade-in': 'fadeIn 0.5s ease-out',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(20, 184, 166, 0.3)' },
          '100%': { boxShadow: '0 0 40px rgba(20, 184, 166, 0.6)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      typography: {
        invert: {
          css: {
            '--tw-prose-body': '#e2e8f0',
            '--tw-prose-headings': '#14b8a6',
            '--tw-prose-links': '#14b8a6',
            '--tw-prose-bold': '#f8fafc',
            '--tw-prose-bullets': '#14b8a6',
            '--tw-prose-quotes': '#94a3b8',
            '--tw-prose-code': '#f472b6',
            '--tw-prose-hr': '#334155',
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
