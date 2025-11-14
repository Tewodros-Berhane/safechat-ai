import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";
import animatePlugin from "tailwindcss-animate";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./node_modules/@shadcn/ui/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", ...defaultTheme.fontFamily.sans],
      },
      colors: {
        primary: "#3B82F6", 
        accent: "#1E293B",    
        background: "#0F172A" 
      },
    },
  },
  plugins: [animatePlugin],
};

export default config;
