import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Cool beige palette
        beige: {
          50: '#fafaf8',
          100: '#f5f4f0',
          200: '#ebe9e0',
          300: '#ddd9cc',
          400: '#c9c3b3',
          500: '#b5ad9a',
          600: '#9a917d',
          700: '#7d7561',
          800: '#5f5a4a',
          900: '#3e3b31',
        },
        sand: {
          50: '#faf9f7',
          100: '#f2f0eb',
          200: '#e8e4da',
          300: '#d6cfc0',
          400: '#bcb3a0',
          500: '#a39782',
          600: '#887d68',
          700: '#6d6450',
          800: '#534c3c',
          900: '#3a3529',
        },
        // Green colors for badges and heatmap
        green: {
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
        emerald: {
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
      },
    },
  },
  plugins: [],
};
export default config;
