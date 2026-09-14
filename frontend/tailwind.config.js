/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#0b2545",
          light: "#13375e",
          dark: "#071a33",
        },
        saffron: {
          DEFAULT: "#f16529",
          light: "#f97316",
        },
        "forest-green": {
          DEFAULT: "#138808",
          light: "#16a34a",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
