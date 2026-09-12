import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brick: "#C8102E",
        "brick-dark": "#9E0C24",
        maroon: "#5E0C1C",
        ink: "#181310",
        paper: "#FBF7F3",
        sand: "#F1E9E1",
        gold: "#B08D57",
        forest: "#1E6B45",
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
      boxShadow: {
        card: "0 1px 0 rgba(24,19,16,0.06)",
      },
    },
  },
  plugins: [],
} satisfies Config;