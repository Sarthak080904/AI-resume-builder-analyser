/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#172026",
        muted: "#62717b",
        line: "#d7dee2",
        paper: "#f6f8f7",
        accent: "#166f73",
        coral: "#c6533f"
      },
      boxShadow: {
        soft: "0 16px 45px rgba(23, 32, 38, 0.08)"
      }
    }
  },
  plugins: []
};
