/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          950: '#0D3B2E',
          900: '#1A5C44',
          800: '#237A5A',
          700: '#2E9E74',
          500: '#5CC49A',
          200: '#A8E6CC',
          50:  '#F0FAF5',
        },
        gold: {
          700: '#B86800',
          500: '#F0A020',
          300: '#F5C460',
          50:  '#FFFBF0',
        }
      }
    }
  },
  plugins: []
}
