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
        'custom-purple-l': '#7497df',
        'custom-purple-r': '#9b77e6',
        'custom-purple-l-translucent': 'rgba(116, 151, 223, 0.5)',
      }
    },
  },
  plugins: [],
}

