/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        primary: "#a888ff",
        "primary-light": "#c4b5fd",
        "primary-dark": "#7c3aed",
        "primary-ultralight": "#ddd6fe",
        "primary-ultradark": "#5b21b6",
        "background-light": "#ffffff",
        "background-dark": "#0f1728",
      },
      keyframes: {
        indeterminateAnimation: {
          "0%": { transform: "translateX(0) scaleX(0)" },
          "40%": { transform: "translateX(0) scaleX(0.4)" },
          "100%": { transform: "translateX(100%) scaleX(0.5)" },
        },
      },
      animation: {
        indeterminate: "indeterminateAnimation 1s infinite linear",
      },
    },
  },
  plugins: [],
};
