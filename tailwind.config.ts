import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    container: { center: true, padding: "1.25rem", screens: { "2xl": "1240px" } },
    extend: {
      colors: {
        ivory: { DEFAULT: "#FAF7F2", 100: "#F4EEE4", 200: "#EADFCE" },
        ink: { DEFAULT: "#1A1614", 600: "#4A413B", 500: "#6E625A", 300: "#B3A79C" },
        maroon: { DEFAULT: "#8A1C3B", 600: "#741532", 50: "#F8E9EE" },
        saffron: { DEFAULT: "#C98A2B", 50: "#FBF1DF" },
        jade: { DEFAULT: "#2F6B57", 50: "#E5F1EC" },
      },
      fontFamily: {
        display: ["Fraunces", "Georgia", "serif"],
        sans: ["'Plus Jakarta Sans'", "system-ui", "sans-serif"],
      },
      borderRadius: { xl: "14px", "2xl": "20px", "3xl": "28px" },
      boxShadow: {
        card: "0 1px 2px rgba(26,22,20,.04), 0 8px 24px -12px rgba(26,22,20,.12)",
        lift: "0 24px 48px -20px rgba(138,28,59,.25)",
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
