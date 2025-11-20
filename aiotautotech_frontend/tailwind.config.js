/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",

  content: ["./src/pages/**/*.{js,ts,jsx,tsx,mdx}", "./src/components/**/*.{js,ts,jsx,tsx,mdx}", "./src/app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["SF Pro Display", "Helvetica Neue", "Helvetica", "Arial", "sans-serif"],
        display: ["SF Pro Display", "Helvetica Neue", "Helvetica", "Arial", "sans-serif"],
      },
      colors: {
        "apple-blue": "#0070c9",
        "apple-gray-light": "#f5f5f7",
        "apple-gray-dark": "#1a1a1a",
        "apple-text-light": "#1d1d1f",
        "apple-text-dark": "#f5f5f7",
      },
    },
  },
  plugins: [],
};
