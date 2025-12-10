/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',

  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Cập nhật fontFamily để sử dụng biến CSS từ next/font
      fontFamily: {
        sans: [
          'var(--font-roboto)',
          'Helvetica Neue',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
        display: [
          'var(--font-roboto)',
          'Helvetica Neue',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
      },
      colors: {
        'apple-blue': '#0070c9',
        'apple-gray-light': '#f5f5f7',
        'apple-gray-dark': '#1a1a1a',
        'apple-text-light': '#1d1d1f',
        'apple-text-dark': '#f5f5f7',
        // Thêm các màu theo cấu trúc của shadcn/ui
        border: 'hsl(214.3 31.8% 91.4%)',
        input: 'hsl(214.3 31.8% 91.4%)', // Màu border mặc định
        ring: 'hsl(221.2 83.2% 53.3%)', // Màu focus (xanh)
        background: 'hsl(0 0% 100%)',
        foreground: 'hsl(222.2 84% 4.9%)',
        primary: {
          DEFAULT: 'hsl(222.2 47.4% 11.2%)',
          foreground: 'hsl(210 40% 98%)',
        },
        secondary: {
          DEFAULT: 'hsl(210 40% 96.1%)',
          foreground: 'hsl(222.2 47.4% 11.2%)',
        },
      },
    },
  },
  plugins: [],
};
