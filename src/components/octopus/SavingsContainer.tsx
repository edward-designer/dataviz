"use client";

import { useContext, useState } from "react";

import { UserContext } from "@/context/user";
import UserApiResult from "./UserApiResult";
import UserApi from "./UserApi";
import SavingsCalculation from "./SavingsCalculation";
import Image from "next/image";

import { LiaPiggyBankSolid } from "react-icons/lia";

import demoImg from "../../../public/images/savings.jpg";

export type ErrorType = Record<string, string>;

const SavingsContainer = () => {
  const { value, setValue } = useContext(UserContext);
  const loggedIn = !!(value.apiKey && value.accountNumber) || value.testRun;

  return (
    <div className="flex flex-col font-extralight text-lg">
      <h1 className="text-accentBlue-400 font-display text-4xl lg:text-6xl font-medium">
        My Savings
      </h1>
      <h2 className="text-accentBlue-400 font-display font-medium text-lg lg:text-2xl mb-8">
        - How much have you saved?
      </h2>
      <div className="-z-10 absolute top-0 right-0 overflow-hidden">
        <LiaPiggyBankSolid className="relative -top-12 -right-12 text-theme-700/20  w-[240px] h-[240px] md:hidden pointer-events-none" />
      </div>

      {loggedIn ? (
        <SavingsCalculation />
      ) : (
        <div className="flex flex-col md:flex-row justify-between gap-4 items-start">
          <div className="">
            <UserApi />
          </div>
          <div className="flex w-full md:w-fit flex-grow items-center justify-center mt-8 md:mt-0 shrink-0">
            <Image
              src={demoImg}
              className="w-[300px] h-auto border border-accentBlue-500 "
              alt="demo showing how the missing data tool work"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SavingsContainer;
