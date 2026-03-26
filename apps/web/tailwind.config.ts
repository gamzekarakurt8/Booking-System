import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#101524",
        dawn: "#f3efe8",
        sea: "#4d8ca4",
        ember: "#f06a4d",
        moss: "#5a7d64",
      },
      boxShadow: {
        card: "0 20px 50px -20px rgba(16,21,36,0.35)",
      },
      animation: {
        "fade-up": "fadeUp 0.45s ease-out both",
      },
      keyframes: {
        fadeUp: {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
