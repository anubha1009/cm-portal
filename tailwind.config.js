/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        'custom-gray': '#444444',
        'purple-500': '#7e77e5',
        'red': '#D21F3C',
        'purple-50': '#F7F5FF !important',
      }
    },
  },
  plugins: [],
}

