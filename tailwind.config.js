/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      animation: {
        skeleton: "skeletonGradient 3s ease-in-out infinite",
      },
      keyframes: {
        skeletonGradient: {
          "0%": { background: "linear-gradient(90deg, #F0F2F5 0%, #E8EAED 50%, #E0E3E8 90.87%, #E8EAED 100%)" },
          "50%": { background: "linear-gradient(90deg, #F0F2F5 0%, #E0E3E8 26.92%, #E8EAED 50%, #E8EAED 100%)" },
          "100%": { background: "linear-gradient(90deg, #F0F2F5 0%, #E8EAED 50%, #E0E3E8 75%, #E8EAED 100%)" },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
}
