/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,ts,jsx,tsx,mdx}",
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                'custom-blue': '#E3ECFB',
                'custom-pink': '#FBEDF7',
                'custom-peach': '#FBF1ED',
                'custom-cyan': '#E4F6FB'
            }
        },
    },
    plugins: [
        require('tw-animate-css'),
    ],
}