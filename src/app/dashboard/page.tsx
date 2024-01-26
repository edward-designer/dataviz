import CompareTariffs from "@/components/octopus/CompareTariffs";
import DashboardContainer from "@/components/octopus/DashboardContainer";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Octopus Energy User Dashbaord | Octoprice",
  description:
    "Get all your important Octopus Energy usage and account info in one page.",
  keywords: [
    "Octopus Energy",
    "Electricity",
    "Gas",
    "Information",
    "Dashbaord",
  ],
  authors: [
    { name: "Edward Chung", url: "https://edward-designer.github.io/" },
  ],
  metadataBase: new URL("https://octopriceuk.app/"),
  alternates: {
    canonical: `/dashboard`,
  },
  openGraph: {
    title: "Octopus Energy User Dashbaord | Octoprice",
    description:
      "Get all your important Octopus Energy usage and account info in one page.",
    url: "https://octopriceuk.app/dashboard",
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

const Dashboard = () => {
  return (
    <div className="lg:col-[content] my-4">
      <div className="flex flex-col font-extralight text-lg">
        <h1 className="text-accentBlue-400 font-display text-4xl lg:text-6xl font-medium ">
          Account Dashboard
        </h1>
        <h2 className="text-accentBlue-400 font-display font-medium text-lg lg:text-2xl mb-8">
          - useful account and tariff info at a glance
        </h2>
        <DashboardContainer />
      </div>
    </div>
  );
};

export default Dashboard;
