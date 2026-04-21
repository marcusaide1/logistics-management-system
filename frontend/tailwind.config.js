/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          header: "#bfdbfe",
          footer: "#bfdbfe",
          page: "#e2e8f0"
        }
      }
    }
  },
  plugins: []
};
