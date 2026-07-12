/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: '#0f172a',
        bg2: '#1e293b',
        ink: '#f1f5f9',
        muted: '#94a3b8',
        rule: '#334155',
        accent: '#38bdf8',
        accent2: '#818cf8',
        clay: {
          500: '#5a506c',
          600: '#4a405c',
          700: '#3a3247',
          800: '#2d2738',
        },
        brown: {
          600: '#5c4a3a',
          700: '#4a3a2a',
          800: '#3a2d20',
        },
      },
      fontFamily: {
        display: ['Upheaval Pro', 'PingFang SC', 'Microsoft YaHei', 'sans-serif'],
        body: ['VCR OSD Mono', 'JetBrains Mono', 'Consolas', 'monospace'],
        sans: ['NotoSans', 'PingFang SC', 'Microsoft YaHei', 'sans-serif'],
        mono: ['JetBrains', 'Consolas', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(56, 189, 248, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(56, 189, 248, 0.8)' },
        },
      },
    },
  },
  plugins: [],
}
