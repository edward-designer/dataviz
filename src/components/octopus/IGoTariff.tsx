"use client";

import Tariff from "./Tariff";

import { ETARIFFS } from "@/data/source";

const IGoTariff = () => {
  const currentTariff = ETARIFFS.find((tariff) => tariff.category === "IGo")!;
  return <Tariff tariff={currentTariff} />;
};

export default IGoTariff;
