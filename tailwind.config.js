// tailwind.config.js

module.exports = {
  content: ["./index.html", "./src/**/*.js"],
  darkMode: 'class',
  theme: {
    container: {
      center: true,
      padding: "16px",
    },
    extend: {
      colors: {
        'dark': '#1E1F22',
        'dark-50': '#2B2D31',
        'light': '#FBFBFB',
        'red': '#CE2626',
        'blue': '#79B8FF',
        'blues': '#4D96E8',
      }
    },
  },
  plugins: [],
}
