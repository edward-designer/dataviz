import UserApi from "@/components/octopus/UserApi";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compare Cheapest Tariffs | Octoprice",
  description:
    "Offers recommendations on the cheapest electricity and gas tariff based on your actual energy usage figures.",
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
  metadataBase: new URL("https://octopriceuk.vercel.app/"),
  openGraph: {
    title: "Compare Cheapest Tariffs | Octoprice",
    description:
      "Offers recommendations on the cheapest electricity and gas tariff based on your actual energy usage figures.",
    url: "https://octopriceuk.vercel.app/compare",
    siteName: "Octoprice App",
    images: [
      {
        url: "https://octopriceuk.vercel.app/octoprice-compare.jpg",
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
      <UserApi />
    </div>
  );
};

export default Compare;
