import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    container: { center: true, padding: "1.25rem", screens: { "2xl": "1240px" } },
    extend: {
      colors: {
        ivory: { DEFAULT: "#FBF6EF", 100: "#F5ECE0", 200: "#EADCC8" },
        ink: { DEFAULT: "#1E1714", 600: "#463B35", 500: "#6B5E56", 300: "#B5A89D" },
        maroon: { DEFAULT: "#5C1A2C", 600: "#481322", 400: "#7D2A40", 50: "#F6E9EC" },
        saffron: { DEFAULT: "#C98A2B", 50: "#FBF1DF" },
        jade: { DEFAULT: "#2F6B57", 50: "#E5F1EC" },
      },
      fontFamily: {
        display: ["Manrope", "system-ui", "sans-serif"],
        sans: ["Manrope", "system-ui", "sans-serif"],
      },
      borderRadius: { xl: "14px", "2xl": "20px", "3xl": "28px" },
      boxShadow: {
        card: "0 1px 2px rgba(26,22,20,.04), 0 8px 24px -12px rgba(26,22,20,.12)",
        lift: "0 24px 48px -20px rgba(92,26,44,.28)",
      },
      keyframes: {
        marquee: { from: { transform: "translateX(0)" }, to: { transform: "translateX(-50%)" } },
        rise: { from: { opacity: "0", transform: "translateY(12px)" }, to: { opacity: "1", transform: "none" } },
      },
      animation: { marquee: "marquee 40s linear infinite", rise: "rise .6s ease-out both" },
    },
  },
  plugins: [],
} satisfies Config;
