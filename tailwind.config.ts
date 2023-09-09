import type { Config } from 'tailwindcss';

export default {
  content: ['./app/**/*.{js,jsx,ts,tsx}'],
  theme: {
    colors: {
      white: '#FFFFFF',
      'grey-light': '#ECECEC',
      grey: '#838383',
      'grey-dark': '#606060',
      black: '#000000',
      // "blue-50-transparency": "#0071A7",
      blue: '#0071A7',
      orange: '#F58634',
      red: '#F54B34',
      green: '#3CB371',
    },
    extend: {},
  },
  plugins: [],
} satisfies Config;
