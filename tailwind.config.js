/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './lib/**/*.{js,ts,jsx,tsx}',
    './utils/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            '--tw-prose-body': '#cbd5e1',
            '--tw-prose-headings': '#f8fafc',
            '--tw-prose-links': '#60a5fa',
            '--tw-prose-bold': '#f8fafc',
            '--tw-prose-counters': '#94a3b8',
            '--tw-prose-bullets': '#94a3b8',
            '--tw-prose-hr': '#1f2937',
            '--tw-prose-quotes': '#e2e8f0',
            '--tw-prose-quote-borders': '#334155',
            '--tw-prose-captions': '#94a3b8',
            '--tw-prose-code': '#e2e8f0',
            '--tw-prose-pre-code': '#e2e8f0',
            '--tw-prose-pre-bg': 'rgba(2, 6, 23, 0.6)',
            '--tw-prose-th-borders': '#334155',
            '--tw-prose-td-borders': '#1f2937',
          },
        },
        invert: {
          css: {
            '--tw-prose-body': '#cbd5e1',
            '--tw-prose-headings': '#f8fafc',
            '--tw-prose-links': '#60a5fa',
            '--tw-prose-bold': '#f8fafc',
            '--tw-prose-counters': '#94a3b8',
            '--tw-prose-bullets': '#94a3b8',
            '--tw-prose-hr': '#1f2937',
            '--tw-prose-quotes': '#e2e8f0',
            '--tw-prose-quote-borders': '#334155',
            '--tw-prose-captions': '#94a3b8',
            '--tw-prose-code': '#e2e8f0',
            '--tw-prose-pre-code': '#e2e8f0',
            '--tw-prose-pre-bg': 'rgba(2, 6, 23, 0.6)',
            '--tw-prose-th-borders': '#334155',
            '--tw-prose-td-borders': '#1f2937',
          },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};


