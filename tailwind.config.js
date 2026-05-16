/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['index.html'],
  theme: {
    extend: {
      colors: {
        banner:       'var(--banner)',
        surface:      'var(--surface)',
        muted:        'var(--text-muted)',
        'spectrum-1': 'var(--spectrum-1)',
        'spectrum-2': 'var(--spectrum-2)',
        'spectrum-3': 'var(--spectrum-3)',
        'spectrum-4': 'var(--spectrum-4)',
        'spectrum-5': 'var(--spectrum-5)',
        'spectrum-6': 'var(--spectrum-6)',
      }
    }
  }
}
