import type { Config } from "tailwindcss";

export default {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
            "primary-1": "#333333", 
            "primary-2": "#A1DBFF",
            "secondary": "#3091CD", 
            "light-1": "#808080",
            white: "#ffffff",
            },
            fontFamily: {
                poppins: ["var(--font-poppins)", "sans-serif"],
            },
        },
    },
} satisfies Config;    
