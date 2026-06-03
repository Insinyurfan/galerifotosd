/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        sapphire: {
          50: "#EFF6FF",
          100: "#DBEAFE",
          500: "#3B82F6",
          700: "#1E40AF",
          800: "#1E3A8A",
        },
      },
      boxShadow: {
        soft: "0 18px 50px rgba(15, 23, 42, 0.08)",
      },
    },
  },
  plugins: [],
};
