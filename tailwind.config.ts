import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        cormorant: ['var(--font-cormorant)', 'serif'],
        dm: ['var(--font-dm-sans)', 'sans-serif'],
      },
      colors: {
        ink: '#0a0a0a',
        cream: '#f5f0e8',
        warm: '#e8ddd0',
        gold: '#c9a96e',
        'gold-light': '#e8c98a',
        muted: '#8a7d6e',
      },
    },
  },
  plugins: [],
}
export default config
