"use client";

import { useContext, useState } from "react";

import { UserContext } from "@/context/user";
import UserApiResult from "./UserApiResult";
import UserApi from "./UserApi";
import SavingsCalculation from "./SavingsCalculation";

export type ErrorType = Record<string, string>;

const SavingsContainer = () => {
  const { value, setValue } = useContext(UserContext);
  const hasApiInfo = !!(value.apiKey && value.accountNumber);

  return (
    <div className="flex flex-col font-extralight text-lg">
      <h1 className="text-accentBlue-400 font-display text-4xl lg:text-6xl font-medium ">
        My Savings
      </h1>
      <h2 className="text-accentBlue-400 font-display font-medium text-lg lg:text-2xl mb-8">
        - How much have you saved?
      </h2>
      {hasApiInfo ? <SavingsCalculation /> : <UserApi />}
    </div>
  );
};

export default SavingsContainer;
