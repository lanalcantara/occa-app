import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "var(--color-background)",
                foreground: "var(--color-foreground)",
                primary: {
                    DEFAULT: "var(--color-primary)",
                    foreground: "var(--color-primary-foreground)"
                },
                secondary: {
                    DEFAULT: "var(--color-secondary)",
                    foreground: "var(--color-secondary-foreground)"
                },
                accent: {
                    DEFAULT: "var(--color-accent)",
                    foreground: "var(--color-accent-foreground)"
                },
                border: "var(--color-border)",
                input: "var(--color-input)",
                ring: "var(--color-ring)",
                card: {
                    DEFAULT: "var(--color-card)",
                    foreground: "var(--color-card-foreground)"
                },
                muted: {
                    DEFAULT: "var(--color-muted)",
                    foreground: "var(--color-muted-foreground)"
                },
                surface: {
                    DEFAULT: "var(--color-surface)",
                    foreground: "var(--color-surface-foreground)"
                }
            },
            fontFamily: {
                sans: ["var(--font-poppins)", "sans-serif"],
            }
        },
    },
    plugins: [],
};
export default config;
