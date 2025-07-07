/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        text: {
          black: "#000000",
          white: "#FFFFFF",
        },
        blue: {
          light: "#EAF9FB",
          DEFAULT: "#D8F1F8",
          dark: "#BEE6F2",
        },
        lavender: {
          light: "#E9F0FB",
          DEFAULT: "#E0EAFA",
          dark: "#CAD8F1",
        },
        peach: {
          light: "#FDF6F3",
          DEFAULT: "#FBF1ED",
          dark: "#F3E2DA",
        },
        pink: {
          light: "#FAEFF9",
          DEFAULT: "#F9EBF7",
          dark: "#EFD6EA",
        },
        gray: {
          900: "#1a1a1a",
          700: "#4d4d4d",
          500: "#999999",
          300: "#cccccc",
          100: "#f2f2f2",
        },
        nav: {
          pink: "#FFD4F2",
        },
        tag: {
          low: {
            bg: "#E4FFE7",
            border: "#9AD9A2",
          },
          medium: {
            bg: "#FFFEAF",
            border: "#FFFD83",
          },
          high: {
            bg: "#FFBDBD",
            border: "#FF9999",
          },
        }
      }
    }
  },
  plugins: [],
}
