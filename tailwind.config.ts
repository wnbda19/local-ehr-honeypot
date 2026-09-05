import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        clinical: {
          50: "#eef8ff",
          100: "#d9efff",
          500: "#2378d4",
          700: "#155aa8",
          900: "#113b66"
        }
      }
    }
  },
  plugins: []
};

export default config;
