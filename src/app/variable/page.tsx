import React from "react";

import { Metadata } from "next";
import VariableTariff from "@/components/octopus/VariableTariff";

export const metadata: Metadata = {
  title:
    "Octopus Variable Tariff Unit Rates for Today and Tomorrow | Octoprice",
  description:
    "Get the latest unit rates for gas and electicity on the Octopus Variable Tariff, with graphs showing the price trends and price differences all over UK.",
  keywords: ["Octopus Energy", "Variable", "Electricity Tariff", "Gas Tariff"],
  authors: [
    { name: "Edward Chung", url: "https://edward-designer.github.io/" },
  ],
  metadataBase: new URL("https://octopriceuk.app/"),
  alternates: {
    canonical: `/variable`,
  },
  openGraph: {
    title:
      "Octopus Variable Tariff Unit Rates for Today and Tomorrow | Octoprice",
    description:
      "Get the latest unit rates for gas and electicity on the Octopus Variable Tariff, with graphs showing the price trends and price differences all over UK.",
    url: "https://octopriceuk.app/variable",
    siteName: "Octoprice App",
    images: [
      {
        url: "https://octopriceuk.app/octoprice-variable.jpg",
        width: 800,
        height: 600,
      },
    ],
    locale: "en_UK",
    type: "website",
  },
};

const Variable = () => {
  return <VariableTariff />;
};

export default Variable;
