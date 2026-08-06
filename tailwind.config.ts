import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    screens: {
      // Bespoke very-small breakpoint. Below this the header hides its CTAs
      // (they still live in the mobile menu). Default Tailwind breakpoints
      // (sm/md/lg/xl/2xl) are preserved below.
      xs: "500px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },
    extend: {
      colors: {
        brand: {
          red: "#c1121f",
          darkred: "#8b0d17",
          maroon: "#7a0c15",
          navy: "#000d22",
          deepnavy: "#011840",
          gray: "#475467",
          border: "#d0d5dd",
          soft: "#f9f9f9",
        },

        // Semantic tokens — map to CSS vars declared in globals.css so both
        // light and dark themes stay in one place. Use these everywhere in the
        // dashboard shell instead of hardcoded hex values.
        surface: {
          page: "var(--surface-page)",
          card: "var(--surface-card)",
          elevated: "var(--surface-elevated)",
          hover: "var(--surface-hover)",
          inverse: "var(--surface-inverse)",
        },
        line: {
          DEFAULT: "var(--border-default)",
          subtle: "var(--border-subtle)",
        },
        ink: {
          DEFAULT: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          muted: "var(--text-muted)",
          subtle: "var(--text-subtle)",
        },
      },
      backgroundColor: {
        page: "var(--surface-page)",
        card: "var(--surface-card)",
        elevated: "var(--surface-elevated)",
        hover: "var(--surface-hover)",
      },
      borderColor: {
        DEFAULT: "var(--border-default)",
        subtle: "var(--border-subtle)",
      },
      textColor: {
        primary: "var(--text-primary)",
        secondary: "var(--text-secondary)",
        muted: "var(--text-muted)",
        subtle: "var(--text-subtle)",
      },
      fontFamily: {
        montserrat: ["Montserrat", "sans-serif"],
        roboto: ["Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
