/**  @type {import('tailwindcss').Config}  */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "custom-roxo": "#161032",
        "custom-olhoTigre": "#B26700",
        "custom-amarelo": "#FAFF81",
        "custom-cinza": "#F0F1F9",
        "custom-blue": "#247BA0",
      },
    },
  },
  plugins: [],
};
