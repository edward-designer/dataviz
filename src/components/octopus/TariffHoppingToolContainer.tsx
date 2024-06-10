"use client";

import Lottie from "lottie-react";
import emojiSad from "../../../public/lottie/emojiSad.json";

import { IUserValue, UserContext } from "@/context/user";
import {
  daysDiff,
  getAllTariffsWithCurrentTariff,
  getDatePeriod,
  getTariffName,
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
import TariffHoppingToolSelector from "./TariffHoppingToolSelector";
import ExitTrialButton from "./ExitTrialButton";

export type ErrorType = Record<string, string>;

const TariffHoppingToolContainer = () => {
  /* states */
  const { value, setValue } = useContext(UserContext);

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

  useEffect(() => {
    if (value.tariffHoppingSet2 !== "") {
      setImportTariff2(value.tariffHoppingSet2);
    }
  }, [value.tariffHoppingSet2]);

  useEffect(() => {
    if (value.tariffHoppingExportSet2 !== "") {
      setExportTariff2(value.tariffHoppingExportSet2);
    }
  }, [value.tariffHoppingExportSet2]);

  useEffect(() => {
    setValue({ ...value, tariffHoppingSet2: importTariff2 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [importTariff2]);

  useEffect(() => {
    setValue({ ...value, tariffHoppingExportSet2: exportTariff2 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exportTariff2]);

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
      {value.testRun && <ExitTrialButton />}
      <div>
        Calculation based on your actual meter readings over the past year.
        Inclusive of standing charge & VAT.
        <Remark>
          [BEST for Octopus users with both import and export tariffs to take
          full advantage of tariff switching!] It is free and fast to switch
          between various Octopus smart tariffs (you only have to wait 1 month
          before swithing again - with the execption of Tracker for which you
          have to wait 9 months before switching back). Approximations and
          assumptions are used in the calculations. The actual savings are
          likely to differ because of missing data and rounding. Should you
          encounter any issues while using this page, please contact Edward at{" "}
          <a href="mailto:edward.chung.dev@gmail.com" className="underline">
            edward.chung.dev@gmail.com
          </a>
          . Thanks a lot!
        </Remark>
      </div>
      <div className="flex flex-col gap-2">
        <div className="text-sm border-b border-t border-dotted border-theme-800 p-1 flex flex-col md:flex-row gap-x-6">
          {value.currentETariff && (
            <span className="text-accentBlue-400 ">
              Current Import Tariff:{" "}
              <strong>{getTariffName(value.currentETariff)}</strong>{" "}
              <span className="text-[10px]">({value.currentETariff})</span>
            </span>
          )}
          {value.currentEETariff && (
            <span className="text-orange-400">
              Current Export Tariff:{" "}
              <strong>{getTariffName(value.currentEETariff)}</strong>{" "}
              <span className="text-[10px]">({value.currentEETariff})</span>
            </span>
          )}
        </div>
        <TariffHoppingToolSelector
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
        <TariffHoppingToolSelector
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
