"use client";

import { UserContext } from "@/context/user";
import { useContext } from "react";

import DashboardOctopusHistory from "./DashboardOctopusHistory";
import DashboardAccountInfo from "./DashboardAccountInfo";
import DashboardCurrentTariff from "./DashboardCurrentTariffs";

const DashboardContents = () => {
  const { value } = useContext(UserContext);

  return (
    <div className="flex flex-col md:flex-row justify-between gap-4">
      <DashboardCurrentTariff />
      <div className="flex flex-col gap-4 ">
        <DashboardAccountInfo />
        <DashboardOctopusHistory />
      </div>
    </div>
  );
};

export default DashboardContents;
