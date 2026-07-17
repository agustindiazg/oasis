/** @type {import('tailwindcss').Config} */
const config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: { extend: { colors: { ink: "#050505", paper: "#eae9e2", acid: "#d7f85b", violet: "#9f8bff", ember: "#ffb77e" } } },
  plugins: [],
};
export default config;
