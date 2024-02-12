"use client";

import { UserContext } from "@/context/user";
import { EETARIFFS, ETARIFFS, GTARIFFS } from "@/data/source";
import { useContext, useState } from "react";
import NotCurrentlySupported from "./NotCurrentlySupported";

import { TDuration, getDatePeriod } from "@/utils/helpers";
import CompareTariffsByType from "./CompareTariffsByType";
import PeriodSelector from "./PeriodSelector";
import Link from "next/link";
import Notice from "./Notice";
import { TbBulb } from "react-icons/tb";

const UserApiResult = () => {
  const { value } = useContext(UserContext);
  const [tariffsEToCompare, setTariffsEToCompare] = useState(
    ETARIFFS.slice(0, 4)
  );
  const [tariffsEEToCompare, setTariffsEEToCompare] = useState(EETARIFFS);
  const [tariffsGToCompare, setTariffsGToCompare] = useState(GTARIFFS);

  const [period, setPeriod] = useState<{
    duration: TDuration | "custom";
    from: Date;
    to: Date;
  }>(getDatePeriod);

  return (
    <div className="flex gap-4 flex-col relative">
      {value.error ? (
        <NotCurrentlySupported>{value.error}</NotCurrentlySupported>
      ) : (
        <>
          <PeriodSelector period={period} setPeriod={setPeriod} />
          <CompareTariffsByType
            selectedTariffs={tariffsEEToCompare}
            allTariffs={EETARIFFS}
            type="E"
            period={period}
            isExport={true}
          />
          <Notice>
            <TbBulb className="w-8 h-8 text-[#f8ec20] shrink-0" />
            <div>
              Wanna save even more? Use the brand new{" "}
              <Link
                href="/tariffHopping"
                className="text-accentPink-500 underline hover:text-accentBlue-500 hover:no-underline"
              >
                Tariff Hopping
              </Link>{" "}
              tool to optimize tariff switching throughout the year!
            </div>
          </Notice>
          <CompareTariffsByType
            selectedTariffs={tariffsEToCompare}
            allTariffs={ETARIFFS}
            type="E"
            period={period}
          />
          <CompareTariffsByType
            selectedTariffs={tariffsGToCompare}
            allTariffs={GTARIFFS}
            type="G"
            period={period}
          />
        </>
      )}
    </div>
  );
};

export default UserApiResult;
