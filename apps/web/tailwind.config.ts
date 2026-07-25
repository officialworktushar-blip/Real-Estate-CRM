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
        gold: {
          50: "#fdf9ef",
          100: "#faf0d0",
          200: "#f5de9e",
          300: "#efc968",
          400: "#e9b33e",
          500: "#d4952a",
          600: "#b87520",
          700: "#97561d",
          800: "#7c4420",
          900: "#66381e",
          950: "#3a1c0e",
        },
      },
    },
  },
  plugins: [],
};

export default config;
