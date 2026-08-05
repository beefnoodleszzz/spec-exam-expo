/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Primitive palette mapped to semantic tailwind classes
        primary: {
          DEFAULT: '#1677FF',
          pressed: '#0958D9',
          soft: '#E8F3FF',
          foreground: '#FFFFFF',
        },
        background: '#F7F8FA',
        surface: {
          DEFAULT: '#FFFFFF',
          elevated: '#FFFFFF',
        },
        foreground: {
          DEFAULT: '#1D2129',
          secondary: '#4E5969',
          muted: '#86909C',
          inverse: '#FFFFFF',
        },
        border: {
          DEFAULT: '#E5E6EB',
          strong: '#C9CDD4',
        },
        divider: '#F2F3F5',
        success: {
          DEFAULT: '#00B42A',
          soft: '#E8FFEA',
        },
        warning: {
          DEFAULT: '#FF7D00',
          soft: '#FFF7E8',
        },
        danger: {
          DEFAULT: '#F53F3F',
          soft: '#FFECEC',
        },
        // Question states
        question: {
          correct: '#00B42A',
          wrong: '#F53F3F',
          selected: '#1677FF',
          unanswered: '#C9CDD4',
        },
        // VIP / Membership
        vip: {
          DEFAULT: '#D97706',
          soft: '#FFFBEB',
        },
      },
      borderRadius: {
        none: '0px',
        sm: '4px',
        DEFAULT: '8px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '20px',
        full: '9999px',
      },
      spacing: {
        '0': '0px',
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '7': '28px',
        '8': '32px',
        '9': '36px',
        '10': '40px',
        '12': '48px',
        '14': '56px',
        '16': '64px',
      },
    },
  },
  plugins: [],
}
