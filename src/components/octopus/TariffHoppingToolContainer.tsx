"use client";

import Lottie from "lottie-react";
import emojiSad from "../../../public/lottie/emojiSad.json";

import { UserContext } from "@/context/user";
import {
  daysDiff,
  getAllTariffsWithCurrentTariff,
  getDatePeriod,
} from "@/utils/helpers";
import {
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useReducer,
  useState,
} from "react";

import Loading from "@/app/loading";

import { TbChartInfographic } from "react-icons/tb";

import { EETARIFFS, ETARIFFS, IPeriod } from "@/data/source";
import useCalculateSimPrice from "@/hooks/useCalculateSimPrice";
import useEnergyShiftData from "@/hooks/useEnergyShiftData";
import { energyShiftReducer } from "@/reducers/energyShift";
import Link from "next/link";
import Remark from "./Remark";
import EnergyShiftSimSwitchChart from "./TariffHoppingChart";
import TrafficHoppingToolSelector from "./TrafficHoppingToolSelector";

export type ErrorType = Record<string, string>;

const TariffHoppingToolContainer = () => {
  /* states */
  const { value } = useContext(UserContext);

  const [period, setPeriod] = useState<IPeriod>(getDatePeriod);
  const [daysOfWeek, setDaysOfWeek] = useState([1, 2, 3, 4, 5]);

  const [importTariff, setImportTariff] = useState<string>("");
  const [exportTariff, setExportTariff] = useState<string>("");
  const [importTariff2, setImportTariff2] = useState<string>(
    ETARIFFS.filter((tariff) => tariff.category === "Agile")?.[0].tariff ?? ""
  );
  const [exportTariff2, setExportTariff2] = useState<string>("");

  /* derived states */
  const isExporting = !!(value.EESerialNo && value.EMPAN);

  useEffect(() => {
    if (isExporting) {
      setImportTariff2(
        ETARIFFS.filter((tariff) => tariff.category === "IFlux")?.[0].tariff ??
          "INTELLI-FLUX-IMPORT-23-07-14"
      );
      setExportTariff2(
        EETARIFFS.filter((tariff) => tariff.category === "IFlux")?.[0].tariff ??
          "INTELLI-FLUX-EXPORT-23-07-14"
      );
    }
  }, [isExporting]);

  const importTariffs = useMemo(
    () => getAllTariffsWithCurrentTariff(ETARIFFS, value.currentETariff),
    [value.currentETariff]
  );
  const exportTariffs = useMemo(
    () => getAllTariffsWithCurrentTariff(EETARIFFS, value.currentEETariff),
    [value.currentEETariff]
  );

  /* get data from API */
  const {
    dataByTime: dataByTimeImport,
    dataByTimeTariff: dataByTimeImportTariff,
    totalValue: totalConsumption,
    avgTariffPrice: avgImportPrice,
  } = useEnergyShiftData({
    fromDate: period.from.toISOString(),
    toDate: period.to.toISOString(),
    type: "E",
    deviceNumber: value.MPAN,
    serialNo: value.ESerialNo,
    daysOfWeek,
    tariff: importTariff,
    gsp: value.gsp,
  });

  const {
    dataByTime: dataByTimeExport,
    dataByTimeTariff: dataByTimeExportTariff,
    totalValue: totalExport,
    avgTariffPrice: avgExportPrice,
  } = useEnergyShiftData({
    fromDate: period.from.toISOString(),
    toDate: period.to.toISOString(),
    type: "E",
    deviceNumber: value.EMPAN,
    serialNo: value.EESerialNo,
    daysOfWeek,
    tariff: exportTariff,
    gsp: value.gsp,
  });

  /* effect to sync state and context from localstorage */
  useEffect(() => {
    if (value.currentETariff) {
      setImportTariff(value.currentETariff);
    }
  }, [value.currentETariff]);

  useEffect(() => {
    if (value.currentEETariff) {
      setExportTariff(value.currentEETariff);
    }
  }, [value.currentEETariff]);

  /* loading while waiting */
  if (!dataByTimeImport) return <Loading />;
  if (isExporting && !dataByTimeExport) return <Loading />;

  return (
    <div className="flex flex-col justify-between gap-4">
      <div>
        This tool helps you to optimize tariff hopping by taking advantage of
        zero tariff exit fee!{" "}
        <Remark>
          [BEST for Octopus users with both import and export tariffs] It is
          absolutely FREE and fast to switch between various Octopus smart
          tariffs (you only have to wait 1 month before swithing again - with
          the execption of Tracker which you have to wait 9 months before
          switching back).{" "}
        </Remark>
      </div>
      <h2 className="text-accentPink-600 font-display text-4xl flex items-center gap-3 mb-3">
        <TbChartInfographic className="w-8 h-8" />
        My Net Energy Cost
      </h2>
      <div className="flex flex-col gap-2">
        <TrafficHoppingToolSelector
          importTariff={importTariff}
          importTariffs={importTariffs}
          setImportTariff={setImportTariff}
          exportTariff={exportTariff}
          exportTariffs={exportTariffs}
          setExportTariff={setExportTariff}
          lineColor="green"
          label="Set 1"
          isExporting={isExporting}
        />
        <TrafficHoppingToolSelector
          importTariff={importTariff2}
          importTariffs={importTariffs}
          setImportTariff={setImportTariff2}
          exportTariff={exportTariff2}
          exportTariffs={exportTariffs}
          setExportTariff={setExportTariff2}
          lineColor="slate"
          label="Set 2"
          isExporting={isExporting}
        />
      </div>
      <EnergyShiftSimSwitchChart
        importTariff={importTariff}
        exportTariff={exportTariff}
        importTariff2={importTariff2}
        exportTariff2={exportTariff2}
        isExporting={isExporting}
      />
    </div>
  );
};

export default TariffHoppingToolContainer;
