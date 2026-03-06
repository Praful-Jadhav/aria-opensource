/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      colors: {
        background: "#09090b",
        foreground: "#fafafa",
        card: "#18181b",
        "card-hover": "#27272a",
        border: "#27272a",
        primary: "#6366f1",
        "primary-hover": "#818cf8",
        secondary: "#a855f7",
        accent: "#06b6d4",
        success: "#22c55e",
        warning: "#f59e0b",
        danger: "#ef4444",
        muted: "#71717a",
        "muted-foreground": "#a1a1aa",
      },
    },
  },
  plugins: [],
};
