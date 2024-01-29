// eslint-disable-next-line @typescript-eslint/no-var-requires
const { transformRadixColors, transformRadixColorsWithAlpha } = require('./utils/radix-colors-to-tailwind');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './lib/**/*.{js,ts,jsx,tsx}',
    '!./node_modules',
  ],
  // For now, we will not support dark mode because the new next.js 13 server component
  // needs some work to support the next-themes library. We will revisit this later.
  darkMode: 'class',
  future: {
    hoverOnlyWhenSupported: true,
  },
  theme: {
    colors: false,
    extend: {
      // fontFamily: {
      //   sans: ['var(--main-font)'],
      //   mono: ['var(--mono-font)'],
      //   serif: ['var(--serif-font)'],
      //   italic: ['var(--font-italic)'],
      // },
      fontWeight: {
        body: '400',
        selectable: '500',
        accent: '600',
        heading: '600',
      },
      borderRadius: {
        std: '0.5rem',
        card: '0.8rem',
      },
      colors: {
        clear: 'transparent',
        white: 'rgb(var(--std-white) / <alpha-value>)',
        black: 'rgb(var(--std-black) / <alpha-value>)',
        brand: {
          ...transformRadixColorsWithAlpha('mauve'),
          DEFAULT: 'var(--mauve-12)',
          'accent': 'var(--mauve-11)',
        },
        mauve: transformRadixColorsWithAlpha('mauve'),
        red: transformRadixColors('red'),
        green: transformRadixColors('green'),
        blue: transformRadixColors('blue'),
        gold: transformRadixColors('gold'),
        orange: transformRadixColors('orange'),
        std: {
          border: 'var(--mauve-3)',
        },
      },
      boxShadow: {
        separator: '0 0 60px 0 rgba(0, 0, 0, 0.04)',
        card: '0 4px 46px 0 rgba(0, 0, 0, 0.04)',
        float: '0 20px 80px 0 rgba(0, 0, 0, 0.06)',
        popover: '0 10px 40px 10px rgba(0, 0, 0, 0.08)',
      },
      transitionTimingFunction: {
        'cubic': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      animation: {
        enter: 'enter 200ms ease-out',
        leave: 'leave 150ms ease-in forwards',
      },
      keyframes: {
        enter: {
          '0%': { transform: 'scale(0.9)', opacity: 0 },
          '100%': { transform: 'scale(1)', opacity: 1 },
        },
        leave: {
          '0%': { transform: 'scale(1)', opacity: 1 },
          '100%': { transform: 'scale(0.9)', opacity: 0 },
        },
      },
    },
  },
  corePlugins: {
    aspectRatio: false,
  },
};
