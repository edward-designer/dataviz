import CompareTrackers from "@/components/octopus/CompareTrackers";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Old vs New Tracker Prices | Octoprice",
  description:
    "Get what you would need to pay for under the new Tracker tariff as Octopus is forcing existing customers to the new Tracker tariff.",
  keywords: [
    "Octopus Energy",
    "Compare Tariffs",
    "Electricity",
    "Gas",
    "Compare Tracker",
  ],
  authors: [
    { name: "Edward Chung", url: "https://edward-designer.github.io/" },
  ],
  metadataBase: new URL("https://octopriceuk.app/"),
  alternates: {
    canonical: `/compareTracker`,
  },
  openGraph: {
    title: "Old vs New Tracker Prices | Octoprice",
    description:
      "Get what you would need to pay for under the new Tracker tariff as Octopus is forcing existing customers to the new Tracker tariff.",
    url: "https://octopriceuk.app/compareTracker",
    siteName: "Octoprice App",
    images: [
      {
        url: "https://octopriceuk.app/octoprice-tracker.jpg",
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
      <CompareTrackers />
    </div>
  );
};

export default Compare;
