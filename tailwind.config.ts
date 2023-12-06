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
          50: "hsl(305, 100%, 98%)",
          100: "hsl(303, 91%, 95%)",
          200: "hsl(303, 88%, 91%)",
          300: "hsl(306, 86%, 83%)",
          400: "hsl(307, 84%, 73%)",
          500: "hsl(307, 78%, 55%)",
          600: "hsl(308, 65%, 49%)",
          700: "hsl(310, 67%, 40%)",
          800: "hsl(310, 65%, 33%)",
          900: "hsl(311, 59%, 28%)",
          950: "hsl(312, 83%, 16%)",
        },
        accentBlue: {
          50: "hsl(180, 100%, 96%)",
          100: "hsl(184, 100%, 90%)",
          200: "hsl(185, 100%, 81%)",
          300: "hsl(186, 100%, 68%)",
          400: "hsl(189, 97%, 53%)",
          500: "hsl(190, 100%, 44%)",
          600: "hsl(193, 100%, 37%)",
          700: "hsl(194, 93%, 30%)",
          800: "hsl(196, 80%, 27%)",
          900: "hsl(197, 72%, 24%)",
          950: "hsl(198, 89%, 15%)",
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
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "come-in-out": "come-in-out 700ms forwards",
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
