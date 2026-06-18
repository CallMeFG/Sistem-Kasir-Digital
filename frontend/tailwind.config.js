/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
        },
        app: 'var(--bg-app)',
        sidebar: 'var(--bg-sidebar)',
        card: 'var(--bg-card)',
        input: 'var(--bg-input)',
        border: 'var(--border)',
        borderFocus: 'var(--border-focus)',
        textPrimary: 'var(--text-primary)',
        textSecondary: 'var(--text-secondary)',
        textMuted: 'var(--text-muted)',
        successBg: 'var(--success-bg)',
        successText: 'var(--success-text)',
        successBorder: 'var(--success-border)',
        errorBg: 'var(--error-bg)',
        errorText: 'var(--error-text)',
        errorBorder: 'var(--error-border)',
        warningBg: 'var(--warning-bg)',
        warningText: 'var(--warning-text)',
        warningBorder: 'var(--warning-border)',
        infoBg: 'var(--info-bg)',
        infoText: 'var(--info-text)',
        infoBorder: 'var(--info-border)',
      },
      boxShadow: {
        sm: '0 1px 3px 0 rgb(0 0 0 / 0.12), 0 1px 2px -1px rgb(0 0 0 / 0.12)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.15), 0 2px 4px -2px rgb(0 0 0 / 0.15)',
        lg: '0 10px 25px -3px rgb(0 0 0 / 0.20), 0 4px 6px -4px rgb(0 0 0 / 0.20)',
        'btn-primary': '0 2px 8px rgb(79 70 229 / 0.3)',
        'btn-primary-hover': '0 4px 12px rgb(79 70 229 / 0.4)',
        'input-focus': '0 0 0 3px rgb(99 102 241 / 0.12)',
      },
      animation: {
        fade: 'fadeIn 0.25s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}
