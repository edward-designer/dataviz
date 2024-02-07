"use client";

import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { max } from "d3";
import { UserContext } from "@/context/user";
import useConsumptionPattern from "@/hooks/useConsumptionPattern";
import { TDuration, evenRound, getDate, getDatePeriod } from "@/utils/helpers";
import SliderVertical from "@/components/ui/sliderVertical";

import PeriodSelector from "./PeriodSelector";
import Badge from "./Badge";
import FormBattery from "./FormBattery";

import { TbSunElectricity } from "react-icons/tb";
import { HiMiniAdjustmentsVertical } from "react-icons/hi2";
import { FaTachometerAlt } from "react-icons/fa";
import FormSolar from "./FormSolar";

export type ErrorType = Record<string, string>;

export interface IConsumptionData {
  count: number;
  consumption: number;
}
const EnergyShiftSimContainer = () => {
  const { value } = useContext(UserContext);

  const [period, setPeriod] = useState<{
    duration: TDuration | "custom";
    from: Date;
    to: Date;
  }>(getDatePeriod);
  const [adjustedConsumption, setAdjustedConsumption] = useState<
    IConsumptionData[]
  >([]);
  const [adjustedExport, setAdjustedExport] = useState<IConsumptionData[]>([]);

  const { dataByTime } = useConsumptionPattern({
    fromDate: period.from.toUTCString(),
    toDate: period.to.toUTCString(),
    type: "E",
    deviceNumber: value.MPAN,
    serialNo: value.ESerialNo,
    daysOfWeek: [1, 2, 3, 4, 5],
  });

  const { dataByTime: dataByTimeExport } = useConsumptionPattern({
    fromDate: period.from.toUTCString(),
    toDate: period.to.toUTCString(),
    type: "E",
    deviceNumber: value.EMPAN,
    serialNo: value.EESerialNo,
    daysOfWeek: [1, 2, 3, 4, 5],
  });

  useEffect(() => {
    if (dataByTime) {
      setAdjustedConsumption(dataByTime);
    }
  }, [dataByTime]);

  useEffect(() => {
    if (dataByTimeExport) {
      setAdjustedExport(dataByTimeExport);
    }
  }, [dataByTimeExport]);

  const maxConsumption = useMemo(() => {
    if (dataByTime) return max(dataByTime, (d) => d.consumption / d.count);
  }, [dataByTime]);

  const maxExport = useMemo(() => {
    if (dataByTimeExport)
      return max(dataByTimeExport, (d) => d.consumption / d.count);
  }, [dataByTimeExport]);

  const absoluteMax = Math.max(maxConsumption ?? 0, maxExport ?? 0);

  const valueCommitHandler = (index: number) => (value: number[]) => {
    setAdjustedConsumption((prevConsumption) => {
      const nextConsumption = [...prevConsumption];
      nextConsumption[index] = {
        ...nextConsumption[index],
        consumption: (value[0] * nextConsumption[index].count) / 1000,
      };
      return nextConsumption;
    });
  };
  const valueCommitHandlerArray = useMemo(
    () => Array.from({ length: 48 }).map((_, i) => valueCommitHandler(i)),
    []
  );

  const exportValueCommitHandler = (index: number) => (value: number[]) => {
    setAdjustedExport((prevExport) => {
      const nextExport = [...prevExport];
      nextExport[index] = {
        ...nextExport[index],
        consumption: (value[0] * nextExport[index].count) / 1000,
      };
      return nextExport;
    });
  };
  const exportValueCommitHandlerArray = useMemo(
    () => Array.from({ length: 48 }).map((_, i) => exportValueCommitHandler(i)),
    []
  );

  const [batteryFormOpen, setBatteryFormOpen] = useState(false);
  const [solarFormOpen, setSolarFormOpen] = useState(false);

  if (!dataByTime) return;

  if (adjustedConsumption.length === 0 || !maxConsumption) return;

  const totalAllocated = evenRound(
    adjustedConsumption.reduce(
      (acc, cur) => acc + cur.consumption / cur.count,
      0
    ) * 1000,
    0
  );
  const totalConsumption = evenRound(
    dataByTime.reduce((acc, cur) => acc + cur.consumption / cur.count, 0) *
      1000,
    0
  );

  const totalAllocatedExport = evenRound(
    adjustedExport.reduce((acc, cur) => acc + cur.consumption / cur.count, 0) *
      1000,
    0
  );

  const totalExport = dataByTimeExport
    ? evenRound(
        dataByTimeExport.reduce(
          (acc, cur) => acc + cur.consumption / cur.count,
          0
        ) * 1000,
        0
      )
    : 0;

  return (
    <div className="flex flex-col justify-between gap-4">
      <h2 className="text-accentPink-600 font-display text-4xl flex items-center gap-3">
        <TbSunElectricity className="w-8 h-8" />
        Average Electricity Use Profile
      </h2>
      <PeriodSelector period={period} setPeriod={setPeriod} />
      <div className="flex flex-row justify-between items-center gap-5 flex-wrap bg-theme-900 rounded-2xl p-4">
        <div className="text-4xl flex items-center justify-center gap-2">
          <FaTachometerAlt className="w-8 h-8" />
          <div
            className={`flex flex-wrap justify-between items-start md:block bg-theme-900/30 
          ${
            totalAllocated <= totalConsumption
              ? "text-[#85f9ad]"
              : "text-[#f985c5]"
          }`}
          >
            <Badge label={`Planned Use`} variant="item" />
            <div className="font-digit text-4xl flex flex-col items-end justify-start">
              {totalAllocated}
            </div>
          </div>
          <span className="text-6xl text-center self-start">/</span>
          <div className="flex flex-wrap justify-between items-start md:block text-[#85cbf9] bg-theme-900/30">
            <Badge label={`Avg. Use`} variant="item" />
            <div className="font-digit text-4xl flex flex-col items-end justify-start">
              {totalConsumption}
            </div>
          </div>
          <span className="text-xl self-end">Wh</span>
        </div>

        <div className="text-4xl flex items-center justify-center gap-2">
          <FaTachometerAlt className="w-8 h-8" />
          <div
            className={`flex flex-wrap justify-between items-start md:block bg-theme-900/30 
          ${
            totalAllocated <= totalConsumption
              ? "text-[#85f9ad]"
              : "text-[#f985c5]"
          }`}
          >
            <Badge label={`Planned Export`} variant="item" />
            <div className="font-digit text-4xl flex flex-col items-end justify-start">
              {totalAllocatedExport}
            </div>
          </div>
          <span className="text-6xl text-center self-start">/</span>
          <div className="flex flex-wrap justify-between items-start md:block text-[#85cbf9] bg-theme-900/30">
            <Badge label={`Avg. Export`} variant="item" />
            <div className="font-digit text-4xl flex flex-col items-end justify-start">
              {totalExport}
            </div>
          </div>
          <span className="text-xl self-end">Wh</span>
        </div>

        <div className="flex flex-row gap-2 items-center">
          <FormSolar open={solarFormOpen} setOpen={setSolarFormOpen} />
          <FormBattery open={batteryFormOpen} setOpen={setBatteryFormOpen} />
        </div>
      </div>
      <h3 className="flex items-center gap-3">
        <HiMiniAdjustmentsVertical className="w-6 h-6" /> Adjust your usage
        pattern to maximize your saving:
      </h3>
      <div className="flex flex-row gap-5 flex-wrap gap-y-10 border border-accentPink-900 rounded-2xl pl-7 pr-5 pt-8 pb-14">
        {adjustedConsumption.map((data, i) => (
          <div
            className="flex flex-col justify-center items-center gap-8"
            key={i}
          >
            <SliderVertical
              defaultValue={Math.round((1000 * data.consumption) / data.count)}
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
              ).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
              onValueCommit={valueCommitHandlerArray[i]}
              disabled={false}
            />
            {maxExport && adjustedExport.length === 48 && (
              <SliderVertical
                defaultValue={Math.round(
                  (1000 * adjustedExport[i].consumption) /
                    adjustedExport[i].count
                )}
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
                ).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                onValueCommit={exportValueCommitHandlerArray[i]}
                disabled={false}
                isExport={true}
                inverted={true}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default EnergyShiftSimContainer;
