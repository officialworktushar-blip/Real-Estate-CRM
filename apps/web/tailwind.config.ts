import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0f5ff",
          100: "#e0eaff",
          200: "#c2d5ff",
          300: "#93b3ff",
          400: "#6490ff",
          500: "#3b6cf7",
          600: "#254deb",
          700: "#1d3ad8",
          800: "#1e30af",
          900: "#1e2d8a",
          950: "#171e54",
        },
      },
    },
  },
  plugins: [],
};

export default config;
