import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#F29C22",
          50: "#FEF6E8",
          100: "#FDECD1",
          200: "#FBD9A3",
          300: "#F8C675",
          400: "#F6B347",
          500: "#F29C22",
          600: "#D4841A",
          700: "#A86913",
          800: "#7C4E0E",
          900: "#503208",
        },
        surface: {
          base: "#F5F4F0",
          card: "#FFFFFF",
          elevated: "#F0EDE8",
          hover: "#E8E4DE",
        },
        border: {
          DEFAULT: "#E0DBD3",
          strong: "#C8C2B8",
        },
        text: {
          primary: "#1A1714",
          secondary: "#5C564E",
          muted: "#9C9488",
        },
        risk: {
          low: "#059669",
          "low-bg": "rgba(5,150,105,0.08)",
          mid: "#D97706",
          "mid-bg": "rgba(217,119,6,0.08)",
          elev: "#EA580C",
          "elev-bg": "rgba(234,88,12,0.08)",
          high: "#DC2626",
          "high-bg": "rgba(220,38,38,0.08)",
        },
        module: {
          btc: "#F29C22",
          "btc-bg": "rgba(242,156,34,0.09)",
          fiat: "#4F46E5",
          "fiat-bg": "rgba(79,70,229,0.08)",
          stbl: "#0891B2",
          "stbl-bg": "rgba(8,145,178,0.08)",
          port: "#7C3AED",
          "port-bg": "rgba(124,58,237,0.08)",
        },
      },
    },
  },
  plugins: [],
};

export default config;
