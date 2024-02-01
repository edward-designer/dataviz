"use client";

import Tariff from "./Tariff";

import { ETARIFFS } from "@/data/source";

const CosyTariff = () => {
  const currentTariff = ETARIFFS.find((tariff) => tariff.category === "Cosy")!;
  return <Tariff tariff={currentTariff} />;
};

export default CosyTariff;
