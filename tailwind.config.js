export default {
    plugins: [],
    theme: {
        extend: {
            keyframes: {
                record: {
                    '50%': {
                        opacity: 0.5,
                        '--tw-shadow-color': 'rgb(239 68 68 / 0.5)',
                        '--tw-shadow':
                            '0 10px 15px -3px --tw-shadow-colored, 0 4px 6px -4px --tw-shadow-colored',
                        '--tw-shadow-colored':
                            '0 10px 15px -3px var(--tw-shadow-color), 0 4px 6px -4px var(--tw-shadow-color)',
                        'box-shadow':
                            'var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow)'
                    },
                    '0%, 100%': {
                        opacity: 1,
                        '--tw-shadow-color': 'rgb(239 68 68 / 0.5)',
                        'box-shadow': '0 0 0 var(--tw-shadow-color)'
                    }
                }
            },
            animation: {
                record: 'record 1s ease-in-out infinite'
            }
        }
    },
    content: ['./index.html', './src/**/*.{svelte,js,ts}'] // for unused CSS
};
