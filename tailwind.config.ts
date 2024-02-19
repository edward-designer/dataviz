/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        accentPink: {
          50: "var(--accentPink-50)",
          100: "var(--accentPink-100)",
          200: "var(--accentPink-200)",
          300: "var(--accentPink-300)",
          400: "var(--accentPink-400)",
          500: "var(--accentPink-500)",
          600: "var(--accentPink-600)",
          700: "var(--accentPink-700)",
          800: "var(--accentPink-800)",
          900: "var(--accentPink-900)",
          950: "var(--accentPink-950)",
        },
        accentBlue: {
          50: "var(--accentBlue-50)",
          100: "var(--accentBlue-100)",
          200: "var(--accentBlue-200)",
          300: "var(--accentBlue-300)",
          400: "var(--accentBlue-400)",
          500: "var(--accentBlue-500)",
          600: "var(--accentBlue-600)",
          700: "var(--accentBlue-700)",
          800: "var(--accentBlue-800)",
          900: "var(--accentBlue-900)",
          950: "var(--accentBlue-950)",
        },
        theme: {
          50: "hsl(223, 100%, 97%)",
          100: "hsl(228, 100%, 95%)",
          200: "hsl(227, 100%, 90%)",
          300: "hsl(228, 100%, 83%)",
          400: "hsl(231, 100%, 73%)",
          500: "hsl(234, 100%, 62%)",
          600: "hsl(238, 100%, 50%)",
          700: "hsl(238, 96%, 40%)",
          800: "hsl(237, 95%, 30%)",
          900: "hsl(237, 93%, 20%)",
          950: "hsl(235, 100%, 10%)",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
        "come-in-out": {
          "0%": {
            transform: "scale(0)",
          },
          "50%": {
            transform: "scale(1)",
          },
          "100%": {
            transform: "scale(0)",
          },
        },
        "chart-grow": {
          from: { width: 0 },
          to: { width: "var(--chart-grow-width,0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "come-in-out": "come-in-out 700ms forwards",
        "chart-grow": "chart-grow 1s ease-out forwards",
      },
      fontFamily: {
        display: "var(--display-font)",
        digit: "var(--digits-font)",
        digital7: "var(--digital7-font)",
      },
      backgroundImage: {
        tariffWinner:
          "linear-gradient(0deg, rgba(0,3,35,0.7) 30% , rgba(0,3,35,0.85) 70%, rgba(0,4,51,0.9) 90% ),url('/images/octopus-rabtopus.jpg')",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
