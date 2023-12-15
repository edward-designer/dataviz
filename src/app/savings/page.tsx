import SavingsContainer from "@/components/octopus/SavingsContainer";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Savings of My Octopus Tariff vs Varible (SVT) | Octoprice",
  description:
    "An overview of how much you have saved after switching to your latest Octopus Tariff",
  keywords: [
    "Octopus Energy",
    "Agile",
    "Tracker",
    "Electricity Tariff",
    "Gas Tariff",
    "Saving",
  ],
  authors: [
    { name: "Edward Chung", url: "https://edward-designer.github.io/" },
  ],
  metadataBase: new URL("https://octopriceuk.vercel.app/"),
  openGraph: {
    title:
      "Savings of Octoprice Tariffs Compared with Standard Varible | Octoprice",
    description:
      "An overview of how much you have saved after switching to your latest Octopus Tariff",
    url: "https://octopriceuk.vercel.app/savings",
    siteName: "Octoprice App",
    images: [
      {
        url: "https://octopriceuk.vercel.app/octoprice-savings.jpg",
        width: 800,
        height: 600,
      },
    ],
    locale: "en_UK",
    type: "website",
  },
};

const Savings = () => {
  return (
    <div className="lg:col-[content] my-4 flex flex-col gap-6 text-lg">
      <SavingsContainer />
    </div>
  );
};

export default Savings;
