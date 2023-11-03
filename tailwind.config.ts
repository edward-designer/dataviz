import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        accentPink: {
          "50": "hsl(305, 100%, 98%)",
          "100": "hsl(303, 91%, 95%)",
          "200": "hsl(303, 88%, 91%)",
          "300": "hsl(306, 86%, 83%)",
          "400": "hsl(307, 84%, 73%)",
          "500": "hsl(307, 78%, 55%)",
          "600": "hsl(308, 65%, 49%)",
          "700": "hsl(310, 67%, 40%)",
          "800": "hsl(310, 65%, 33%)",
          "900": "hsl(311, 59%, 28%)",
          "950": "hsl(312, 83%, 16%)",
        },
        accentBlue: {
          "50": "hsl(180, 100%, 96%)",
          "100": "hsl(184, 100%, 90%)",
          "200": "hsl(185, 100%, 81%)",
          "300": "hsl(186, 100%, 68%)",
          "400": "hsl(189, 97%, 53%)",
          "500": "hsl(190, 100%, 44%)",
          "600": "hsl(193, 100%, 37%)",
          "700": "hsl(194, 93%, 30%)",
          "800": "hsl(196, 80%, 27%)",
          "900": "hsl(197, 72%, 24%)",
          "950": "hsl(198, 89%, 15%)",
        },
        theme: {
          "50": "hsl(223, 100%, 97%)",
          "100": "hsl(228, 100%, 95%)",
          "200": "hsl(227, 100%, 90%)",
          "300": "hsl(228, 100%, 83%)",
          "400": "hsl(231, 100%, 73%)",
          "500": "hsl(234, 100%, 62%)",
          "600": "hsl(238, 100%, 55%)",
          "700": "hsl(238, 96%, 50%)",
          "800": "hsl(237, 95%, 42%)",
          "900": "hsl(237, 93%, 35%)",
          "950": "hsl(235, 100%, 17%)",
        },
      },
    },
  },
  plugins: [],
};
export default config;
