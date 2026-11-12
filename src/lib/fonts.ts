import localFont from 'next/font/local'

export const serif = localFont({
  src: [
    { path: '../assets/fonts/BodoniModa-normal.ttf', weight: '400 500', style: 'normal' },
    { path: '../assets/fonts/BodoniModa-italic.ttf', weight: '400 500', style: 'italic' },
  ],
  variable: '--font-serif',
  display: 'swap',
  fallback: ['Georgia', 'serif'],
  adjustFontFallback: 'Times New Roman',
})

export const sans = localFont({
  src: '../assets/fonts/Manrope.ttf',
  weight: '200 800',
  style: 'normal',
  variable: '--font-sans',
  display: 'swap',
  fallback: ['Arial', 'sans-serif'],
  adjustFontFallback: 'Arial',
})
