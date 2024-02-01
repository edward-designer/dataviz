"use client";

import ExportTariff from "./ExportTariff";

import { ETARIFFS, EETARIFFS } from "@/data/source";

const FluxTariff = () => {
  const currentTariff = ETARIFFS.find((tariff) => tariff.category === "Flux")!;
  const currentExportTariff = EETARIFFS.find(
    (tariff) => tariff.category === "Flux"
  )!;

  return (
      <ExportTariff
        tariff={currentTariff}
        exportTariff={currentExportTariff}
        remarks={
          "Must sign up to both Flux Import and Export tariffs at the same time."
        }
      />

  );
};

export default FluxTariff;
