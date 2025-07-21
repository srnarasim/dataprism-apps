/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // DataPrism brand colors
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        // Spreadsheet specific colors
        cell: {
          selected: '#e0f2fe',
          editing: '#fef3c7',
          error: '#fee2e2',
          formula: '#f0f9ff',
        },
        grid: {
          border: '#e5e7eb',
          header: '#f9fafb',
          hover: '#f3f4f6',
        }
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Monaco', 'Cascadia Code', 'Segoe UI Mono', 'Roboto Mono', 'Oxygen Mono', 'Ubuntu Monospace', 'Source Code Pro', 'Fira Mono', 'Droid Sans Mono', 'Courier New', 'monospace'],
      },
      spacing: {
        'cell': '80px',
        'header': '32px',
        'toolbar': '48px',
        'formula-bar': '40px',
      },
      zIndex: {
        'cell-editor': '50',
        'context-menu': '100',
        'modal': '200',
        'tooltip': '300',
      }
    },
  },
  plugins: [],
}