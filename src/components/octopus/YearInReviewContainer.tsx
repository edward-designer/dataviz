"use client";

import { useContext } from "react";

import { UserContext } from "@/context/user";
import UserApi from "./UserApi";

import DataArtContainer from "./DataArtContainer";

export type ErrorType = Record<string, string>;

const YearInReviewContainer = () => {
  const { value, setValue } = useContext(UserContext);
  const hasApiInfo = !!(value.apiKey && value.accountNumber);

  return (
    <div className="flex flex-col font-extralight text-lg">
      <h1 className="text-accentBlue-400 font-display text-4xl lg:text-6xl font-medium ">
        Year in Review
      </h1>
      <h2 className="text-accentBlue-400 font-display font-medium text-lg lg:text-2xl mb-8">
        - Visualize how you &quot;shape up&quot; with energy consumption in the last year
      </h2>

      {hasApiInfo ? (
        <DataArtContainer />
      ) : (
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="">
            <UserApi />
          </div>
          <div className="flex justify-center mt-8 md:mt-0">Demo Graphic</div>
        </div>
      )}
    </div>
  );
};

export default YearInReviewContainer;
