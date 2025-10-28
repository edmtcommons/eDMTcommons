import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#5c314c",
          light: "#7a4a68",
          dark: "#3d1f33",
        },
        background: {
          DEFAULT: "#e9e6d6",
          dark: "#2d4d52",
        },
        teal: {
          DEFAULT: "#5c314c",
          light: "#7a4a68",
        },
        cream: {
          DEFAULT: "#f8f5ed",
        },
      },
      fontFamily: {
        serif: ['Georgia', 'serif'],
        mono: ['Roboto Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};
export default config;


