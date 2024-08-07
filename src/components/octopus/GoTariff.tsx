"use client";

import Tariff from "./Tariff";

import { ETARIFFS } from "@/data/source";

const GoTariff = () => {
  const currentTariff = ETARIFFS.find((tariff) => tariff.category === "Go")!;
  return <Tariff tariff={currentTariff} />;
};

export default GoTariff;
