"use client";

import Tariff from "./Tariff";

import { ETARIFFS, EETARIFFS } from "@/data/source";

const FluxTariff = () => {
  const currentExportTariff = EETARIFFS.find(
    (tariff) => tariff.category === "Agile"
  )!;

  return <Tariff tariff={currentExportTariff} isExport={true} />;
};

export default FluxTariff;
