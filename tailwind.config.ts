import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        navy: {
          DEFAULT: "#0A2540",
          light: "#102E4F",
          dark: "#06182B",
          muted: "#1E3A5F",
        },
        sky: {
          DEFAULT: "#0284C7",
          dim: "#0369A1",
          light: "#38BDF8",
          subtle: "#E0F2FE",
        },
        slate: {
          surface: "#0D1B2A",
          card: "#162032",
          border: "#23334D",
          gold: "#E5A93C",
          goldGlow: "#FBBF24",
          emerald: "#10B981",
          cyan: "#06B6D4",
          amber: "#F59E0B",
          rose: "#F43F5E",
        },
      },
    },
  },
  plugins: [tailwindcssAnimate],
};
export default config;
