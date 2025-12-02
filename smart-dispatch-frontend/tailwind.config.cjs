module.exports = {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f7fbff',
          100: '#eef6ff',
          500: '#2563eb',
          600: '#1d4ed8'
        }
      }
    },
  },
  plugins: [],
}
