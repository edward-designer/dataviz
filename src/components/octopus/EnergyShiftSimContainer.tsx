"use client";

import SliderVertical from "@/components/ui/sliderVertical";
import { UserContext } from "@/context/user";
import {
  calculateSimTotal,
  capitalize,
  checkGoodBadTime,
  daysDiff,
  evenRound,
  formatNumberToDisplay,
  formatPriceChangeWithSign,
  getAllTariffsWithCurrentTariff,
  getCategory,
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

import EnergyShiftSimEnergyCounter from "./EnergyShiftSimEnergyCounter";
import FormBattery from "./FormBattery";
import FormSolar from "./FormSolar";
import PeriodSelector from "./PeriodSelector";

import Loading from "@/app/loading";

import { HiMiniAdjustmentsVertical } from "react-icons/hi2";
import { TbChartInfographic, TbZoomMoney } from "react-icons/tb";

import { EETARIFFS, ETARIFFS, IPeriod } from "@/data/source";
import useCalculateSimPrice from "@/hooks/useCalculateSimPrice";
import useEnergyShiftData from "@/hooks/useEnergyShiftData";
import { energyShiftReducer } from "@/reducers/energyShift";
import { max } from "d3";
import { TbArrowBigDownLineFilled } from "react-icons/tb";
import { SelectItem } from "../ui/select";
import EnergyShiftSimAction from "./EnergyShiftSimAction";
import EnergyShiftSimCostContainer from "./EnergyShiftSimCostContainer";
import EnergyShiftSimTariffSelector from "./EnergyShiftSimTariffSelector";
import EnergyShiftSimTariffWithTotal from "./EnergyShiftSimTariffWithTotal";
import SimpleLoading from "./SimpleLoading";
import { BsLightningChargeFill } from "react-icons/bs";

export type ErrorType = Record<string, string>;

const EnergyShiftSimContainer = () => {
  /* states */
  const { value } = useContext(UserContext);

  const [period, setPeriod] = useState<IPeriod>(getDatePeriod);
  const [daysOfWeek, setDaysOfWeek] = useState([1, 2, 3, 4, 5]);

  const [adjustedImport, adjustedImportDispatch] = useReducer(
    energyShiftReducer,
    []
  );
  const [adjustedExport, adjustedExportDispatch] = useReducer(
    energyShiftReducer,
    []
  );

  const [importTariff, setImportTariff] = useState<string>("");
  const [exportTariff, setExportTariff] = useState<string>("");

  const [hasExport, setHasExport] = useState(false);
  const [hasBattery, setHasBattery] = useState(false);
  const [hasSolar, setHasSolar] = useState(false);

  const [batteryFormOpen, setBatteryFormOpen] = useState(false);
  const [solarFormOpen, setSolarFormOpen] = useState(false);

  /* derived states */
  const isExporting = !!(value.EESerialNo && value.EMPAN);

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

  const maxImport = max(adjustedImport);
  const maxExport = max(adjustedExport);
  const absoluteMax = Math.max(maxImport ?? 0, maxExport ?? 0);

  const numOfDays = daysDiff(period.from, period.to);
  const calculationDuration =
    capitalize(period.duration) === "Custom"
      ? `${numOfDays}-Day`
      : `${capitalize(period.duration)}ly`;

  const cost = useCalculateSimPrice({
    tariff: value.currentETariff,
    gsp: value.gsp,
    fromDate: period.from.toISOString(),
    toDate: period.to.toISOString(),
    daysOfWeek,
    numOfDays,
    consumption: dataByTimeImport ?? [],
  });
  const earning = useCalculateSimPrice({
    tariff: value.currentEETariff,
    gsp: value.gsp,
    fromDate: period.from.toISOString(),
    toDate: period.to.toISOString(),
    daysOfWeek,
    numOfDays,
    consumption: dataByTimeExport ?? [],
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

  useLayoutEffect(() => {
    if (dataByTimeImport) {
      adjustedImportDispatch({
        type: "Update All Values",
        payload: dataByTimeImport,
      });
    }
  }, [dataByTimeImport]);

  useLayoutEffect(() => {
    if (dataByTimeExport) {
      adjustedExportDispatch({
        type: "Update All Values",
        payload: dataByTimeExport,
      });
    }
  }, [dataByTimeExport]);

  useEffect(() => {
    setHasExport(isExporting);
  }, [isExporting]);

  /* handlers */
  const valueCommitHandler = (index: number) => (value: number[]) => {
    adjustedImportDispatch({
      type: "Update A Single Value",
      payload: { index, value: value[0] },
    });
  };
  const valueCommitHandlerArray = useMemo(
    () => Array.from({ length: 48 }).map((_, i) => valueCommitHandler(i)),
    []
  );

  const exportValueCommitHandler = (index: number) => (value: number[]) => {
    adjustedExportDispatch({
      type: "Update A Single Value",
      payload: { index, value: value[0] },
    });
  };
  const exportValueCommitHandlerArray = useMemo(
    () => Array.from({ length: 48 }).map((_, i) => exportValueCommitHandler(i)),
    []
  );

  /* loading while waiting */
  if (!dataByTimeImport) return <Loading />;
  if (
    hasExport &&
    (!dataByTimeExport ||
      maxExport === undefined ||
      adjustedImport.length === 0)
  )
    return <Loading />;
  if (adjustedImport.length === 0 || maxImport === undefined)
    return <Loading />;

  /* derived from state */
  const totalAllocated = evenRound(
    adjustedImport.reduce((acc, cur) => acc + cur, 0) * 1000,
    0
  );
  const totalAllocatedExport = evenRound(
    adjustedExport.reduce((acc, cur) => acc + cur, 0) * 1000,
    0
  );

  const adjustedCost = calculateSimTotal(
    adjustedImport,
    dataByTimeImportTariff,
    numOfDays
  );
  const adjustedEarning = calculateSimTotal(
    adjustedExport,
    dataByTimeExportTariff,
    numOfDays
  );

  const difference = isExporting ? (
    cost !== undefined &&
    earning !== undefined &&
    adjustedEarning !== undefined &&
    adjustedCost !== undefined ? (
      cost - earning - adjustedCost + adjustedEarning
    ) : (
      <SimpleLoading />
    )
  ) : cost !== undefined && adjustedCost !== undefined ? (
    cost - adjustedCost
  ) : (
    <SimpleLoading />
  );

  return (
    <div className="flex flex-col justify-between gap-4">
      <div className="flex items-start flex-wrap">
        <PeriodSelector
          period={period}
          setPeriod={setPeriod}
          hasDaysOfWeek={true}
          daysOfWeek={daysOfWeek}
          setDaysOfWeek={setDaysOfWeek}
        />
      </div>
      <div className="text-sm md:text-base leading-tight">
        Shift daily energy use pattern to maximize saving! VAT inclusive;
        standing charge excluded.
      </div>
      <h2 className="text-accentPink-600 font-display text-4xl flex items-center gap-3 mt-2 -mb-2">
        <BsLightningChargeFill aria-label="electricity" className="w-8 h-8" />
        Daily Average
      </h2>
      <div className="flex flex-row justify-between items-center gap-2 md:gap-5 flex-wrap bg-theme-900/50 rounded-2xl p-2 md:p-4">
        <EnergyShiftSimEnergyCounter
          use={totalAllocated}
          total={totalConsumption}
          isExport={false}
        />
        {hasExport && (
          <EnergyShiftSimEnergyCounter
            use={totalAllocatedExport}
            total={totalExport}
            isExport={true}
          />
        )}
        {false && !hasExport && (
          <div className="flex flex-row gap-2 items-center">
            <FormSolar open={solarFormOpen} setOpen={setSolarFormOpen} />
            <FormBattery open={batteryFormOpen} setOpen={setBatteryFormOpen} />
          </div>
        )}
      </div>
      <div className="flex flex-row justify-between items-center gap-3 md:gap-5 flex-wrap bg-black/60 rounded-2xl p-2 md:p-4">
        <EnergyShiftSimTariffSelector
          isExport={false}
          tariff={importTariff}
          tariffs={importTariffs}
          changeImportTariff={setImportTariff}
          changeExportTariff={setExportTariff}
        >
          {importTariffs.map(({ tariff }) => (
            <SelectItem key={tariff} value={tariff}>
              <EnergyShiftSimTariffWithTotal
                tariff={tariff}
                gsp={value.gsp}
                fromDate={period.from.toISOString()}
                toDate={period.to.toISOString()}
                daysOfWeek={daysOfWeek}
                numOfDays={numOfDays}
                consumption={adjustedImport}
              />
            </SelectItem>
          ))}
        </EnergyShiftSimTariffSelector>
        {hasExport && (
          <EnergyShiftSimTariffSelector
            isExport={true}
            tariff={exportTariff}
            tariffs={exportTariffs}
            changeImportTariff={setImportTariff}
            changeExportTariff={setExportTariff}
          >
            {exportTariffs.flatMap(({ tariff }) => [
              <SelectItem key={tariff} value={tariff}>
                <EnergyShiftSimTariffWithTotal
                  tariff={tariff}
                  gsp={value.gsp}
                  fromDate={period.from.toISOString()}
                  toDate={period.to.toISOString()}
                  daysOfWeek={daysOfWeek}
                  numOfDays={numOfDays}
                  consumption={adjustedExport}
                />
              </SelectItem>,
            ])}
          </EnergyShiftSimTariffSelector>
        )}
        <div className="flex items-center gap-1 text-sm">
          <h3 className="font-bold text-slate-500 mr-2">Price Reference:</h3>
          <span className="w-4 h-2 bg-lime-500 inline-block"></span>Best
          <span className="w-4 h-2 bg-red-500 inline-block ml-3"></span>Worst
        </div>
      </div>
      <div className="flex flex-col-reverse md:flex-row gap-3">
        <div className="basis-1 md:basis-3/4 grid grid-cols-[repeat(8,_minmax(0,_1fr))] sm:grid-cols-[repeat(12,_minmax(0,_1fr))] xl:grid-cols-[repeat(16,_minmax(0,_1fr))] 2xl:grid-cols-[repeat(24,_minmax(0,_1fr))] flex-wrap gap-y-10 border border-accentPink-950 rounded-2xl pl-7 pr-5 pt-8 pb-14">
          {adjustedImport.map((data, i) => (
            <div
              className="flex flex-col justify-center items-center gap-y-8"
              key={i}
            >
              <SliderVertical
                defaultValue={Math.round(1000 * data)}
                max={Math.round(absoluteMax * 1.5 * 1000)}
                min={0}
                step={1}
                orientation="vertical"
                slot={new Date(
                  new Date().setHours(
                    Math.floor(i / 2),
                    i % 2 === 1 ? 30 : 0,
                    0,
                    0
                  )
                ).toLocaleTimeString("en-GB", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                onValueCommit={valueCommitHandlerArray[i]}
                disabled={false}
                avgPrice={avgImportPrice}
                price={dataByTimeImportTariff?.[i]}
                category={getCategory(importTariff)}
                indicator={checkGoodBadTime(
                  false,
                  getCategory(importTariff),
                  dataByTimeImportTariff?.[i],
                  avgImportPrice
                )}
              />
              {hasExport && (
                <SliderVertical
                  defaultValue={Math.round(adjustedExport[i] * 1000)}
                  max={Math.round(absoluteMax * 1.5 * 1000)}
                  min={0}
                  step={1}
                  orientation="vertical"
                  slot={new Date(
                    new Date().setHours(
                      Math.floor(i / 2),
                      i % 2 === 1 ? 30 : 0,
                      0,
                      0
                    )
                  ).toLocaleTimeString("en-GB", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  onValueCommit={exportValueCommitHandlerArray[i]}
                  disabled={false}
                  isExport={true}
                  inverted={true}
                  avgPrice={avgExportPrice}
                  price={dataByTimeExportTariff?.[i]}
                  category={getCategory(exportTariff)}
                  indicator={checkGoodBadTime(
                    true,
                    getCategory(exportTariff),
                    dataByTimeExportTariff?.[i],
                    avgExportPrice
                  )}
                />
              )}
            </div>
          ))}
          <EnergyShiftSimAction
            hasExport={hasExport}
            importTariff={importTariff}
            avgImportPrice={avgImportPrice}
            dataByTimeImportTariff={dataByTimeImportTariff}
            dataByTimeImport={dataByTimeImport}
            dataByTimeExport={dataByTimeExport}
            adjustedImport={adjustedImport}
            adjustedExport={adjustedExport}
            adjustedImportDispatch={adjustedImportDispatch}
            adjustedExportDispatch={adjustedExportDispatch}
          />
        </div>
        <div className="flex flex-col flex-grow basis-1 md:basis-1/4 border border-accentPink-950 rounded-2xl items-between justity-between">
          <div>
            <div className="flex w-full flex-col justify-between items-center px-4 py-4 gap-1 border-b-2 border-dotted border-accentPink-950">
              <div className="flex w-full justify-between">
                <h3 className="flex items-center gap-1 ">
                  <TbZoomMoney className="w-6 h-6 " /> {calculationDuration}{" "}
                  Saving
                </h3>
                <div
                  className={`flex flex-1 flex-row items-center text-right min-h-[40px] ${
                    typeof difference === "number"
                      ? formatNumberToDisplay(difference) > 0
                        ? "text-[#85f9ad]"
                        : formatNumberToDisplay(difference) < 0
                        ? "text-[#f985c5]"
                        : "text-white"
                      : "text-white"
                  }`}
                >
                  <span
                    className={`flex-1 text-3xl font-bold flex justify-end whitespace-nowrap`}
                  >
                    {typeof difference === "number"
                      ? formatPriceChangeWithSign(difference)
                      : difference}
                  </span>
                </div>
              </div>
            </div>

            <EnergyShiftSimCostContainer
              label="Current Tariffs"
              importTariff={value.currentETariff}
              importCost={cost}
              exportTariff={value.currentEETariff}
              exportEarning={earning}
              hasExport={hasExport}
              variant="current"
            />
            <div className="flex justify-center h-3">
              <TbArrowBigDownLineFilled className="h-8 w-8 relative -top-1 text-accentPink-500" />
            </div>
            <EnergyShiftSimCostContainer
              label="Selected Tariffs"
              importTariff={importTariff}
              importCost={adjustedCost}
              exportTariff={exportTariff}
              exportEarning={adjustedEarning}
              hasExport={hasExport}
            />
          </div>
          <div className="flex-grow flex flex-col justify-end p-4 gap-1 text-slate-400">
            <div className="text-sm text-accentPink-500">Remarks:</div>
            <div className="text-xs">
              <strong>Flux/Intelligent Flux</strong>: a tariff for both import
              and export at the same time, must have a (compatible) solar system
              and home battery
            </div>
            <div className="text-xs">
              <strong>Go</strong>: must have EV and (compatible) home charger,
              can only select Fixed Lite Export
            </div>
            <div className="text-xs">
              <strong>Cosy</strong>: must have a heat pump
            </div>
            <div className="text-xs">
              Figures above are estimations only. Past results do not guarantee
              future performance.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnergyShiftSimContainer;
