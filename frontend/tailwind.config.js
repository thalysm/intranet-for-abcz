/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        primary: "#39f",
        secondary: "#f2f1ec",
        brand: {
          blue: "#39f",
          cream: "#f2f1ec",
        },
      },
    },
  },
  plugins: [],
}
