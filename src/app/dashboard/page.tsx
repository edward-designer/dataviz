import CompareTariffs from "@/components/octopus/CompareTariffs";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "User Dashbaord | Octoprice",
  description:
    "Get all your important Octopus Energy usage and account info in one page.",
  keywords: [
    "Octopus Energy",
    "Electricity",
    "Gas",
    "Inforamtion",
    "Dashbaord",
  ],
  authors: [
    { name: "Edward Chung", url: "https://edward-designer.github.io/" },
  ],
  metadataBase: new URL("https://octopriceuk.app/"),
  alternates: {
    canonical: `/compare`,
  },
  openGraph: {
    title: "Compare Cheapest Tariffs | Octoprice",
    description:
      "Offers recommendations on the cheapest electricity and gas tariff based on your actual energy usage figures.",
    url: "https://octopriceuk.app/compare",
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
      <CompareTariffs />
    </div>
  );
};

export default Compare;
