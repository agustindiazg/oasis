/** @type {import('tailwindcss').Config} */
const config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: { extend: { colors: { ink: "#0a0b0b", paper: "#eae9e2", acid: "#d7f85b", violet: "#9f8bff" } } },
  plugins: [],
};
export default config;
