/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
    },
  },
  daisyui: {
    themes: [
      {
        dark: {
          "primary": "#3051fc",
          "secondary": "#606885",
          "accent": "#f8bf4c",
          "neutral": "#1a2148",
          "base-100": "#030b36",
          "info": "#f8fafd",
          "success": "#3bdc96",
          "warning": "#ff5b5b",
          "error": "#acb1c1",
        },
        light: {
          "primary": "#3051fc",
          "secondary": "#f8bf4c",
          "accent": "#606885",
          "neutral": "#1a2148",
          "base-100": "#f8fafd",
          "info": "#030b36",
          "success": "#3bdc96",
          "warning": "#ff5b5b",
          "error": "#acb1c1",
        },
      },
    ],
  },
  plugins:[
    require("@tailwindcss/typography"),
    require("daisyui")
  ],
}
