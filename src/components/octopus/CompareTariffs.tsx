"use client";

import { useContext, useState } from "react";

import { UserContext } from "@/context/user";
import UserApiResult from "./UserApiResult";
import UserApi from "./UserApi";

export type ErrorType = Record<string, string>;

const CompareTariffs = () => {
  const { value, setValue } = useContext(UserContext);
  const hasApiInfo = !!(value.apiKey && value.accountNumber);

  return (
    <div className="flex flex-col font-extralight text-lg">
      <h1 className="text-accentBlue-400 font-display text-4xl lg:text-6xl font-medium ">
        Compare Tariffs
      </h1>
      <h2 className="text-accentBlue-400 font-display text-lg lg:text-2xl mb-8">
        - Octopus Agile or Tracker or Variable?
      </h2>
      {hasApiInfo ? <UserApiResult /> : <UserApi />}
    </div>
  );
};

export default CompareTariffs;