"use client";

import { useContext, useState } from "react";

import { UserContext } from "@/context/user";
import TrackerComparision from "./TrackerComparision";
import UserApi from "./UserApi";
import Image from "next/image";

import compareImg from "../../../public/images/compare.jpg";

export type ErrorType = Record<string, string>;

const CompareTariffs = () => {
  const { value, setValue } = useContext(UserContext);
  const hasApiInfo = !!(value.apiKey && value.accountNumber);

  return (
    <div className="flex flex-col font-extralight text-lg">
      <h1 className="text-accentBlue-400 font-display text-4xl lg:text-6xl font-medium ">
        2023 vs 2024 Tracker Tariffs
      </h1>
      <h2 className="text-accentBlue-400 font-display font-medium text-lg lg:text-2xl mb-8">
        - Tracker prices are changing from Apr 2024
      </h2>
      <TrackerComparision />
    </div>
  );
};

export default CompareTariffs;
