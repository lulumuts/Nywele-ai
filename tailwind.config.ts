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
        background: "var(--background)",
        foreground: "var(--foreground)",
        'cream': '#FDF4E8',
        'primary': '#AF5500',
        'primary-dark': '#643100',
        'accent': '#CE935F',
        'peach': '#FDF4E8', // Updated to match new design
      },
      backgroundColor: {
        'cream': '#FDF4E8',
        'peach': '#FDF4E8',
        'primary': '#AF5500',
        'primary-dark': '#643100',
      },
      fontFamily: {
        'caprasimo': ['Caprasimo', 'serif'],
        'bricolage': ['Bricolage Grotesque', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;

