/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#5c301a",
          hover: "#3b1b0d",
          light: "#fbf2ee",
          border: "#f7e5dc",
        },
        surface: "#ffffff",
        background: "#fbf2ee",
        border: "#e6e5e5",
        success: {
          DEFAULT: "#33b36b",
          light: "#ebf7f0",
        },
        danger: {
          DEFAULT: "#f03d3d",
          light: "#feecec",
        },
        warning: {
          DEFAULT: "#fc9231",
          light: "#fff4ea",
        },
        muted: "#787573",
        dark: "#1d1c1b",
      },
      fontFamily: {
        sans: ["Montserrat", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "12px",
        "2xl": "16px",
      },
      boxShadow: {
        card: "0px 6px 24px 0px rgba(92, 48, 26, 0.08)",
        "card-hover": "0px 6px 24px 0px rgba(92, 48, 26, 0.15)",
      },
    },
  },
  plugins: [],
};
