import React from "react";

import { Metadata } from "next";
import FixedTariff from "@/components/octopus/FixedTariff";

export const metadata: Metadata = {
  title: "Octopus Fixed Tariff Unit Rates for Today and Tomorrow | Octoprice",
  description:
    "Get the latest unit rates for gas and electicity on the Octopus Fixed Tariff, with graphs showing the price trends and price differences all over UK.",
  keywords: ["Octopus Energy", "Fixed", "Electricity Tariff", "Gas Tariff"],
  authors: [
    { name: "Edward Chung", url: "https://edward-designer.github.io/" },
  ],
  metadataBase: new URL("https://octopriceuk.app/"),
  alternates: {
    canonical: `/fixed`,
  },
  openGraph: {
    title: "Octopus Fixed Tariff Unit Rates for Today and Tomorrow | Octoprice",
    description:
      "Get the latest unit rates for gas and electicity on the Octopus Fixed Tariff, with graphs showing the price trends and price differences all over UK.",
    url: "https://octopriceuk.app/fixed",
    siteName: "Octoprice App",
    images: [
      {
        url: "https://octopriceuk.app/octoprice-preview.jpg",
        width: 800,
        height: 600,
      },
    ],
    locale: "en_UK",
    type: "website",
  },
};

const Fixed = () => {
  return <FixedTariff />;
};

export default Fixed;
