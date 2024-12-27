/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js}"],
  theme: {
    fontFamily: {
      sans: ['Roboto', 'sans serif'],
    },
    extend: {
      animation: {
        wait: 'wait 8s ease-in-out'
      },
      keyframes: {
        wait: {
          '0%': {
            width: '0%',
          },
          '50%': {
            width: '100%',
          },
          '100%': {
            width: '0%',
          }
        }
      }
    }
  }
}