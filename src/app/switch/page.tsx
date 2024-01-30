import SwitchTariffs from "@/components/octopus/SwitchTariffs";
import { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "[Free extra £50 credit] Save Most Switching to Octopus Energy Agile/Tracker Tariff | Octoprice",
  description:
    "[free extra £50 credit] Considering switching to Octopus Energy? If you have a smart meter, you can compare different Octopus Energy electricity and gas tariff based on your actual energy usage figures to know how much you can save!",
  keywords: [
    "Octopus Energy",
    "Compare Tariffs",
    "Electricity",
    "Gas",
    "Cheapest",
  ],
  authors: [
    { name: "Edward Chung", url: "https://edward-designer.github.io/" },
  ],
  metadataBase: new URL("https://octopriceuk.app/"),
  alternates: {
    canonical: `/switch`,
  },
  openGraph: {
    title:
      "Save Most Switching to Octopus Energy Agile/Tracker Tariff | Octoprice",
    description:
      "[free extra £50 credit] Considering switching to Octopus Energy? If you have a smart meter, you can compare different Octopus Energy electricity and gas tariff based on your actual energy usage figures to know how much you can save!",
    url: "https://octopriceuk.app/switch",
    siteName: "Octoprice App",
    images: [
      {
        url: "https://octopriceuk.app/octopus-compare.jpg",
        width: 800,
        height: 600,
      },
    ],
    locale: "en_UK",
    type: "website",
  },
};

const Compare = () => {
  return (
    <div className="lg:col-[content] my-4">
      <SwitchTariffs />
    </div>
  );
};

export default Compare;
