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
        primary: "#007AFF",
        "primary-foreground": "#ffffff",
        brand: {
          blue: "#007AFF",
          teal: "#04C99B",
          navy: "#0F172A",
        },
        accent: "#E6F0FF",
        background: "#F8FBFF",
      },
    },
  },
  plugins: [animatePlugin],
};

export default config;
