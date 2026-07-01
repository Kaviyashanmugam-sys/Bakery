/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Warm bakery palette: crust brown, cream, and a berry accent
        crust: {
          50: "#FBF7F0",
          100: "#F3E9D8",
          400: "#C99A5B",
          600: "#A9713A",
          800: "#6B4423",
        },
        berry: {
          500: "#B23A48",
          600: "#96222F",
        },
      },
      fontFamily: {
        display: ["'Fraunces'", "serif"],
        body: ["'Inter'", "sans-serif"],
      },
    },
  },
  plugins: [],
};
