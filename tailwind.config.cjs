/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['index.html', 'src/0*.js'],
  safelist: [
    'animate-pulse',
    'cursor-default',
    'gap-3',
    'hover:text-spectrum-1',
    'mb-4',
    'mb-5',
    'ml-auto',
    'mt-auto',
    'opacity-50',
    'pt-3',
    'px-2',
    'py-12',
    'text-[0.6875rem]',
    'text-xl',
    'tracking-[0.25em]',
    'tracking-wider',
  ],
  theme: {
    extend: {
      colors: {
        banner:       'var(--banner)',
        surface:      'var(--surface)',
        primary:      'var(--text-primary)',
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
