"use client";

import ExportTariff from "./ExportTariff";

import { ETARIFFS, EETARIFFS } from "@/data/source";

const IFluxTariff = () => {
  const currentTariff = ETARIFFS.find((tariff) => tariff.category === "IFlux")!;
  const currentExportTariff = EETARIFFS.find(
    (tariff) => tariff.category === "IFlux"
  )!;

  return (
    <ExportTariff
      tariff={currentTariff}
      exportTariff={currentExportTariff}
      remarks={
        "Must sign up to both Intelligent Flux Import and Export tariffs at the same time. Intelligent Octopus Flux is a smart import and export tariff optimised to give you the best rates for consuming and selling your energy. Compared to Flux tariff, Intelligent customers could save £100 or more each year."
      }
    />
  );
};

export default IFluxTariff;
