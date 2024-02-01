"use client";

import Tariff from "./Tariff";

import { ETARIFFS } from "@/data/source";

const FluxTariff = () => {
  const currentTariff = ETARIFFS.find((tariff) => tariff.category === "Flux")!;
  return (
    <Tariff
      tariff={currentTariff}
      remarks={
        "Must sign up to both Flux Import and Export tariffs at the same time."
      }
    />
  );
};

export default FluxTariff;
