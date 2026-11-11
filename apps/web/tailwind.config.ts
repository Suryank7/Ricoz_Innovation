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
        brand: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae0fd',
          300: '#7cc5fb',
          400: '#36a6f6',
          500: '#0c87eb',
          600: '#006ac9',
          700: '#0154a3',
          800: '#054885',
          900: '#0a3d6f',
          950: '#07264a',
        },
        slate: {
          850: '#151e2e',
          950: '#0a0f1d',
        }
      },
    },
  },
  plugins: [],
};
export default config;
