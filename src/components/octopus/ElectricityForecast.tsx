"use client";

import { request, gql, GraphQLClient } from "graphql-request";
import { useQuery, useMutation } from "@tanstack/react-query";
import { UserContext } from "@/context/user";
import { Fragment, useContext } from "react";
import { gqlEndPoint } from "@/data/source";
import SimpleLoading from "./SimpleLoading";

import { HiMiniArrowLongRight } from "react-icons/hi2";
import { ImArrowRight2 } from "react-icons/im";
import { HiVizContext } from "@/context/hiViz";
import Remark from "./Remark";

interface GreennessForecast {
  greennessForecast: {
    validFrom: string;
    validTo: string;
    greennessScore: number;
    greennessIndex: string;
    highlightFlag: boolean;
  }[];
}

const greennessForecastQueryDocument = gql`
  query GreennessForecast {
    greennessForecast {
      validFrom
      validTo
      greennessScore
      greennessIndex
      highlightFlag
    }
  }
`;

const ElectricityForecast = ({
  standalone = false,
}: {
  standalone?: boolean;
}) => {
  const { hiViz } = useContext(HiVizContext);
  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);

  const { data, isLoading, isSuccess } = useQuery<GreennessForecast>({
    queryKey: ["greennessForecast", todayStart.toLocaleDateString("en-GB")],
    queryFn: async () => request(gqlEndPoint, greennessForecastQueryDocument),
  });

  const rtf = new Intl.RelativeTimeFormat("en", {
    localeMatcher: "best fit",
    numeric: "auto",
    style: "narrow",
  });

  if (isLoading)
    return (
      <div
        className={`bg-theme-950 ${
          standalone ? "rounded-xl" : "rounded-b-xl"
        } flex items-center justify-end min-h-[40px] p-2`}
      >
        <SimpleLoading />
      </div>
    );

  if (!data?.greennessForecast) return;
  const forecastFromTomorrow = data.greennessForecast;
  const validTo = data.greennessForecast.at(-1)?.validTo;
  const numOfDays = validTo
    ? Math.round(
        (new Date(validTo).valueOf() - todayStart.valueOf()) /
          (1000 * 60 * 60 * 24)
      )
    : 0;

  const getTrend = (currentIndex: number) => {
    const currentScore = forecastFromTomorrow.at(
      currentIndex + 1
    )?.greennessScore;
    const previousScore = forecastFromTomorrow.at(currentIndex)?.greennessScore;
    if (currentScore) {
      const delta = previousScore
        ? ((currentScore - previousScore) / previousScore) * 100
        : (currentScore - 50) * 2;
      const deltaAngle = Math.min(Math.max(delta, -45), 45);

      return (
        <div
          className={`flex flex-col ${
            delta < 0 ? "bg-accentPink-950" : "bg-theme-950"
          } h-10 w-14 items-center justify-center
          ${
            hiViz && delta > 0 ? "text-black !bg-accentBlue-600" : "text-white"
          }`}
        >
          <HiMiniArrowLongRight
            role="img"
            className={`w-6 h-6`}
            style={{ transform: `rotate(${deltaAngle}deg)` }}
            aria-label={`${
              deltaAngle < -30
                ? "more expensive"
                : deltaAngle < 0
                ? "slightly more expensive"
                : deltaAngle > 30
                ? "cheaper"
                : "slightly cheaper"
            } than pervious day`}
          />
          <span className="text-xs">
            {currentIndex === 0
              ? rtf.format(1, "day")
              : new Date(
                  forecastFromTomorrow.at(currentIndex)?.validTo ?? ""
                ).toLocaleDateString("en-gb", {
                  day: "2-digit",
                  month: "2-digit",
                })}
          </span>
        </div>
      );
    }
    return;
  };

  return (
    <div
      className={`font-display  
      ${hiViz ? "bg-accentBlue-700" : "bg-black/20"}
      ${
        standalone
          ? "rounded-xl bg-black/20 divide-slate-800 border border-accentPink-950"
          : "rounded-b-xl divide-slate-800 border-l border-r border-b border-accentPink-950"
      } flex min-h-[30px]  divide-x  items-center justify-center overflow-hidden`}
    >
      <span
        className={`flex text-sm text-right leading-none ${
          hiViz ? "text-black" : "text-slate-300"
        }`}
      >
        <span className="">Trend Forecast</span>
        <Remark variant="badge">
          Based on the predicted amount of wind electricity generation derived
          from weather forecast. Please note that the further away from today,
          the less reliable the prediction would be.
        </Remark>
      </span>
      {Array.from({ length: numOfDays }).map((_, i) => (
        <Fragment key={i}>{getTrend(i)}</Fragment>
      ))}
    </div>
  );
};

export default ElectricityForecast;
