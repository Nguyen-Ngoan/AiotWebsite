export default {
  plugins: {
    "@tailwindcss/postcss": {
      // Point Tailwind to the project config so custom utilities/classes resolve.
      config: "./tailwind.config.js",
    },
  },
};
