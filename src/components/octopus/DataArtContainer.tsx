import { UserContext } from "@/context/user";
import {
  IConsumptionData,
  IUserApiResult,
  TariffCategory,
  TariffResult,
  TariffType,
} from "@/data/source";
import useAccountDetails from "@/hooks/useAccountDetails";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useContext, useEffect, useMemo, useRef } from "react";
import NotCurrentlySupported from "./NotCurrentlySupported";
import {
  arc,
  scaleBand,
  scaleLinear,
  select,
  csv,
  Selection,
  scaleTime,
  scaleUtc,
  scaleRadial,
  areaRadial,
  curveLinearClosed,
  min,
  max,
  extent,
  interpolate,
  quantize,
  interpolateSpectral,
  ScaleRadial,
  ScaleLinear,
  ScaleBand,
  interpolateRdYlBu,
  sum,
  lineRadial,
  curveCatmullRomOpen,
  curveNatural,
  easeLinear,
  axisBottom,
  axisTop,
  axisLeft,
  timeFormat,
  line,
  geoPath,
  geoIdentity,
  curveStepAfter,
  curveStepBefore,
  curveLinear,
  curveMonotoneY,
  curveBasis,
  curveCardinal,
  curveStep,
  curveMonotoneX,
  timeDays,
} from "d3";

import {
  FaCloud,
  FaCloudRain,
  FaCloudShowersHeavy,
  FaRegSnowflake,
  FaSun,
  FaCloudSun,
} from "react-icons/fa";
import { FaCloudBolt } from "react-icons/fa6";
import { GiFog } from "react-icons/gi";
import { MdWindPower } from "react-icons/md";
import {
  animateNumber,
  delay,
  evenRound,
  getCategory,
  selectOrAppend,
  toNextTen,
  tryFetch,
} from "@/utils/helpers";
import useConsumptionData from "@/hooks/useConsumptionData";
import useTariffQuery from "@/hooks/useTariffQuery";
import useYearlyTariffQuery from "@/hooks/useYearlyTariffQuery";
import { useUkGspMapData } from "@/hooks/useUkGspMap";
import Remark from "./Remark";
import TariffDetails from "./TariffDetails";
import { RxShare2 } from "react-icons/rx";
import { PiDownloadSimple } from "react-icons/pi";
import { BsLightningChargeFill } from "react-icons/bs";
import { AiFillFire } from "react-icons/ai";
import { saveAs } from "file-saver";

interface IWeatherData {
  time: string;
  weather_code: string;
  sunshine_duration: string;
  temperature_2m_max: string;
  temperature_2m_min: string;
  sunrise: string;
  sunset: string;
  precipitation_hours: string;
}

const DataArtContainer = () => {
  const { value, setValue } = useContext(UserContext);
  const {
    postcode,
    gsp,
    apiKey,
    accountNumber,
    gasConversionFactor,
    trackerCode,
    agileCode,
    MPAN,
    ESerialNo,
    ESerialNos,
    currentETariff,
    MPRN,
    GSerialNo,
    GSerialNos,
    currentGTariff,
    error,
    currentEContract,
    currentGContract,
  } = value;
  const chartRef = useRef<null | SVGSVGElement>(null);

  const chartYear = "2023";
  const fromDate = "2023-01-01";
  const toDate = "2023-12-31";
  const fromISODate = new Date(fromDate).toISOString();
  const toISODate = new Date(toDate).toISOString();

  const icons = {
    gas: "M 16.682 9.384 A 6.9498 6.9498 90 0 0 15.024 7.08 l -0.582 -0.534 a 0.1618 0.1618 90 0 0 -0.26 0.066 l -0.26 0.746 c -0.162 0.468 -0.46 0.946 -0.882 1.416 c -0.028 0.03 -0.06 0.038 -0.082 0.04 c -0.022 0.002 -0.056 -0.002 -0.086 -0.03 c -0.028 -0.024 -0.042 -0.06 -0.04 -0.096 c 0.074 -1.204 -0.286 -2.562 -1.074 -4.04 C 11.106 3.42 10.2 2.462 9.068 1.794 l -0.826 -0.486 c -0.108 -0.064 -0.246 0.02 -0.24 0.146 l 0.044 0.96 c 0.03 0.656 -0.046 1.236 -0.226 1.718 c -0.22 0.59 -0.536 1.138 -0.94 1.63 a 5.9128 5.9128 90 0 1 -0.95 0.922 a 7.052 7.052 90 0 0 -2.006 2.43 A 6.955 6.955 90 0 0 3.2 12.2 c 0 0.944 0.186 1.858 0.554 2.72 a 6.988 6.988 90 0 0 1.51 2.218 c 0.648 0.64 1.4 1.144 2.238 1.494 C 8.37 18.996 9.29 19.18 10.24 19.18 s 1.87 -0.184 2.738 -0.546 A 6.972 6.972 90 0 0 15.216 17.14 c 0.648 -0.64 1.156 -1.388 1.51 -2.218 a 6.884 6.884 90 0 0 0.554 -2.72 c 0 -0.976 -0.2 -1.924 -0.598 -2.818 z",
    electricity:
      "M11.251.068a.5.5 0 0 1 .227.58L9.677 6.5H13a.5.5 0 0 1 .364.843l-8 8.5a.5.5 0 0 1-.842-.49L6.323 9.5H3a.5.5 0 0 1-.364-.843l8-8.5a.5.5 0 0 1 .615-.09z",
  };

  const {
    data: tariffEData,
    isSuccess: tariffEIsSuccess,
    isLoading: tariffEIsLoading,
  } = useTariffQuery<{
    display_name: string;
  }>({
    tariff: currentETariff,
    type: "E",
  });
  const {
    data: tariffGData,
    isSuccess: tariffGIsSuccess,
    isLoading: tariffGIsLoading,
  } = useTariffQuery<{
    display_name: string;
  }>({
    tariff: currentGTariff,
    type: "G",
  });

  const categoryE = getCategory(currentETariff);
  const {
    data: rateEData,
    isSuccess: isRateEDataSuccess,
    isLoading: isRateEDataLoading,
  } = useYearlyTariffQuery<{
    results: {
      value_inc_vat: number;
      valid_from: string;
      valid_to: string;
      payment_method: null | string;
    }[];
  }>({
    tariff: currentETariff,
    type: "E",
    gsp: value.gsp,
    fromDate: fromISODate,
    toDate: toISODate,
    category: categoryE,
    enabled: !!MPAN && !!ESerialNo,
  });

  const categoryG = getCategory(currentGTariff);
  const {
    data: rateGData,
    isSuccess: isRateGDataSuccess,
    isLoading: isRateGDataLoading,
  } = useYearlyTariffQuery<{
    results: {
      value_inc_vat: number;
      valid_from: string;
      valid_to: string;
      payment_method: null | string;
    }[];
  }>({
    tariff: currentGTariff,
    type: "G",
    gsp: value.gsp,
    fromDate: fromISODate,
    toDate: toISODate,
    category: categoryG,
    enabled: !!MPRN && !!GSerialNo,
  });

  const {
    data: consumptionEData,
    isSuccess: consumptionEIsSuccess,
    isLoading: consumptionEIsLoading,
  } = useConsumptionData({
    fromISODate,
    toISODate,
    type: "E",
    category: "Chart",
    deviceNumber: MPAN,
    serialNo: ESerialNo,
    apiKey: value.apiKey,
  });

  const {
    data: consumptionGData,
    isSuccess: consumptionGIsSuccess,
    isLoading: consumptionGIsLoading,
  } = useConsumptionData({
    fromISODate,
    toISODate,
    type: "G",
    category: "Chart",
    deviceNumber: MPRN,
    serialNo: GSerialNo,
    apiKey: value.apiKey,
  });

  const mapData = useUkGspMapData();
  const { data: pinData, isSuccess: isPinSuccess } = useQuery({
    queryFn: async () => {
      const response = await tryFetch(
        fetch(`https://api.postcodes.io/postcodes/${value?.postcode}`)
      );
      const results = response.json();
      return results;
    },
    queryKey: ["pin", value?.postcode],
    enabled: !!value?.postcode,
  });
  // get coordinates and then weather info
  // https://api.postcodes.io/postcodes/RG194SD
  // https://archive-api.open-meteo.com/v1/archive?latitude=51.394907&longitude=-1.25207&start_date=2023-01-01&end_date=2023-12-18&daily=weather_code,apparent_temperature_max,apparent_temperature_min,sunshine_duration&wind_speed_unit=mph&timezone=auto

  /*
  0 - cloud covering half or less of the sky throughout the period            
1 - cloud covering more than half the sky during part of the period & half or 
    less for the rest                                               
2 - cloud covering more than half the sky throughout the period             
3 - sandstorm, duststorm or blowing snow                                    
4 - fog or ice fog or thick haze                                            
5 - drizzle                                                                 
6 - rain1                                                                   
7 - snow, or rain and snow mixed                                            
8 - shower(s)                                                               
9 - thunderstorm(s) with or without precipitation   
*/

  const colorScheme = {
    weatherSymbol: "#426770",
    weatherSymbolSunday: "#c96b65",
    xAxis: "#99999966",
    textMonth: "#000",
    textYear: "#262f4a",
    textTitle: "#000",
    textDaily: "#150887",
    textCumulative: "#4f0637",
    tempRing: "#33669966",
    consumptionRing: "#99999933",
    electricityIcon: "#1846a1",
    gasIcon: "#f83c7f",
    electricityLine: "#2bdaedDD",
    gasLine: "#f83c7fDD",
    line: "#999",
    Gradients: () => (
      <defs>
        <radialGradient id="fillMorning">
          <stop offset="75%" stopColor="#02011C" />
          <stop offset="90%" stopColor="#1A2C64" />
          <stop offset="95%" stopColor="#297EA5" />
          <stop offset="98%" stopColor="#6AD9E0" />
          <stop offset="100%" stopColor="#D8FEF7" />
        </radialGradient>
        <radialGradient id="fillNight">
          <stop offset="78%" stopColor="#FFE8EB" />
          <stop offset="85%" stopColor="#0BA5CB" />
          <stop offset="90%" stopColor="#09457A" />
          <stop offset="95%" stopColor="#0A1A50" />
          <stop offset="100%" stopColor="#050228" />
        </radialGradient>
        <radialGradient id="gas" cx="0.75" cy="0.65" r="0.92" fx="40%" fy="40%">
          <stop offset="30%" stopColor="#8450ad" />
          <stop offset="35%" stopColor="#a85bcf" />
          <stop offset="45%" stopColor="#863f8d" />
          <stop offset="50%" stopColor="#b654bf" />
          <stop offset="55%" stopColor="#e84da7" />
          <stop offset="60%" stopColor="#f54293" />
          <stop offset="65%" stopColor="#f83c7f" />
          <stop offset="70%" stopColor="#ff4958" />
        </radialGradient>
        <radialGradient
          id="electricity"
          cx="0.75"
          cy="0.65"
          r="0.92"
          fx="40%"
          fy="40%"
        >
          <stop offset="35%" stopColor="#00b1ff" />
          <stop offset="40%" stopColor="#0093ff" />
          <stop offset="45%" stopColor="#2f86ff" />
          <stop offset="50%" stopColor="#00e0ed" />
          <stop offset="70%" stopColor="#fcff41" />
          <stop offset="80%" stopColor="#00f4b4" />
          <stop offset="90%" stopColor="#deff4d" />
        </radialGradient>
        <radialGradient
          id="octopus"
          cx="0.4"
          cy="0.45"
          r="0.8"
          fx="30%"
          fy="30%"
        >
          <stop offset="35%" stopColor="#C7E9DB" />
          <stop offset="90%" stopColor="#ecfff0" />
        </radialGradient>
        <radialGradient
          id="octopus0"
          cx="0.4"
          cy="0.45"
          r="0.8"
          fx="30%"
          fy="30%"
        >
          <stop offset="35%" stopColor="#c7e0e9" />
          <stop offset="90%" stopColor="#ecfff0" />
        </radialGradient>
        <radialGradient
          id="octopus1"
          cx="0.4"
          cy="0.45"
          r="0.8"
          fx="30%"
          fy="30%"
        >
          <stop offset="35%" stopColor="#c7e0e9" />
          <stop offset="90%" stopColor="#BDE6E1" />
        </radialGradient>
        <radialGradient
          id="octopus2"
          cx="0.4"
          cy="0.45"
          r="0.8"
          fx="30%"
          fy="30%"
        >
          <stop offset="35%" stopColor="#CDDDFE" />
          <stop offset="90%" stopColor="#BDE6E1" />
        </radialGradient>
        <radialGradient
          id="octopus3"
          cx="0.4"
          cy="0.45"
          r="0.8"
          fx="30%"
          fy="30%"
        >
          <stop offset="35%" stopColor="#CDDDFE" />
          <stop offset="90%" stopColor="#D0C5FA" />
        </radialGradient>
        <radialGradient
          id="octopus4"
          cx="0.4"
          cy="0.45"
          r="0.8"
          fx="30%"
          fy="30%"
        >
          <stop offset="35%" stopColor="#FECDFA" />
          <stop offset="90%" stopColor="#D0C5FA" />
        </radialGradient>
        <radialGradient
          id="octopus5"
          cx="0.4"
          cy="0.45"
          r="0.8"
          fx="30%"
          fy="30%"
        >
          <stop offset="35%" stopColor="#FECDFA" />
          <stop offset="90%" stopColor="#FAC5C5" />
        </radialGradient>
      </defs>
    ),
  };
  const weatherIcon = useMemo(
    () => [
      "M 162.747 86.523 l -43.335 -43.0943 l -33.9458 33.9458 l 43.0943 43.0943 l 34.1865 -33.9458 z M 96.3 222.7875 H 24.075 v 48.15 h 72.225 v -48.15 z m 216.675 -239.5463 h -48.15 V 54.2625 h 48.15 V -16.7587 z m 179.3587 94.1333 l -33.9458 -33.9458 l -43.0943 43.0943 l 33.9458 33.9458 l 43.0943 -43.0943 z m -77.2808 329.8275 l 43.0943 43.335 l 33.9458 -33.9458 l -43.335 -43.0943 l -33.705 33.705 z M 481.5 222.7875 v 48.15 h 72.225 v -48.15 h -72.225 z m -192.6 -120.375 c -79.6883 0 -144.45 64.7617 -144.45 144.45 s 64.7617 144.45 144.45 144.45 s 144.45 -64.7617 144.45 -144.45 s -64.7617 -144.45 -144.45 -144.45 z m -24.075 408.0713 h 48.15 V 439.4625 h -48.15 v 71.0212 z m -179.3587 -94.1333 l 33.9458 33.9458 l 43.0943 -43.335 l -33.9458 -33.9458 l -43.0943 43.335 z",
      "M 185.84 11.8 h -0.36 c -10.44 0 -18.96 8.52 -18.96 18.96 v 36.36 c 0 10.44 8.52 18.96 18.96 18.96 h 0.36 c 10.44 0 18.96 -8.52 18.96 -18.96 V 30.76 c 0 -10.44 -8.52 -18.96 -18.96 -18.96 z M 78.8 194.44 v -0.36 c 0 -10.44 -8.52 -18.96 -18.96 -18.96 H 22.16 c -10.44 0 -18.96 8.52 -18.96 18.96 v 0.36 c 0 10.44 8.52 18.96 18.96 18.96 h 37.56 c 10.56 0 19.08 -8.52 19.08 -18.96 z M 79.64 113.8 c 3.6 3.6 8.4 5.64 13.44 5.64 c 5.04 0 9.84 -2.04 13.44 -5.64 c 7.32 -7.44 7.32 -19.44 0 -26.76 l -24.36 -24.6 c -3.6 -3.6 -8.4 -5.64 -13.44 -5.64 c -5.04 0 -9.84 2.04 -13.44 5.64 c -7.32 7.44 -7.32 19.44 0 26.76 L 79.64 113.8 z M 309.2 61.24 c -3.6 -3.6 -8.4 -5.64 -13.44 -5.64 c -5.04 0 -9.84 2.04 -13.44 5.64 l -24.36 24.48 c -7.32 7.44 -7.32 19.44 0 26.76 l 0.36 0.36 h 0.12 c 3.48 3.36 8.16 5.16 12.96 5.16 c 5.04 0 9.84 -2.04 13.44 -5.64 l 24.36 -24.48 c 7.32 -7.2 7.32 -19.2 0 -26.64 z M 95.48 262.96 c -5.04 0 -9.84 2.04 -13.44 5.64 l -24.36 24.6 c -7.32 7.44 -7.32 19.44 0 26.76 c 3.6 3.6 8.4 5.64 13.44 5.64 c 5.04 0 9.84 -2.04 13.44 -5.64 l 24.36 -24.6 c 7.32 -7.44 7.32 -19.44 0 -26.76 c -3.6 -3.6 -8.4 -5.64 -13.44 -5.64 z M 467.96 246.04 h -2.88 c -3.72 0 -7.32 0 -10.8 0.48 c -13.56 -60.36 -67.32 -105.84 -131.64 -105.84 c -17.52 0 -34.32 3.36 -49.68 9.48 c -6.12 2.4 -12 5.28 -17.64 8.52 c -38.4 22.2 -64.92 62.88 -67.44 109.92 c -0.12 2.52 -0.24 4.92 -0.24 7.44 c 0 4.08 0.24 8.16 0.6 12.12 c 0 0.48 0.12 0.96 0.12 1.32 c -45.48 4.08 -81.12 44.52 -81.12 91.2 c 0 49.32 39.96 92.04 89.16 92.04 h 271.68 c 61.44 0 111.24 -52.08 111.24 -113.76 c -0.12 -61.68 -49.92 -112.92 -111.36 -112.92 z",
      "M 251.58 70.88 c -80.85 0 -147.609 68.9535 -147.609 151.074 c 0 4.9665 0.3465 9.933 0.924 14.784 c -49.896 4.5045 -88.935 50.82 -88.935 102.102 c 0 54.285 43.7745 101.64 97.713 101.64 h 297.759 c 67.3365 0 121.968 -57.057 121.968 -124.74 s -54.6315 -125.664 -121.968 -125.664 c -2.6565 0 -5.544 -0.231 -8.316 -0.231 c -2.4255 0 -4.851 0 -7.0455 0.1155 C 382.4415 128.168 332.43 70.88 251.58 70.88 z",
      "M 88 60 h 132 v 40 H 88 z M 22 140 h 110 v 40 H 22 z M 66 380 h 110 v 40 H 66 z M 302.06 212.2 c 16.5 4.6 28.6 15.6 34.54 29.2 l 93.94 -142.2 a 50.16 45.6 0 0 0 -77.22 -56.8 l -75.46 64.2 c -8.8 7.4 -13.86 18 -13.86 29 v 78.6 c 7.92 -3 21.56 -6.6 38.06 -2 z M 233.42 245.4 c 3.52 -10.4 10.56 -19.2 19.58 -25.4 H 72.16 a 50.138 45.58 0 0 0 -13.86 89.4 l 99.22 25.8 c 11.66 3 24.2 1.6 34.76 -4.2 l 59.18 -32.2 a 54.714 49.74 0 0 1 -18.04 -53.4 z M 488.62 372.2 l -50.16 -82 a 45.1 41 0 0 0 -27.72 -19.4 l -69.96 -16 c 0.66 6.4 0 13.2 -2.2 19.8 A 54.516 49.56 0 0 1 286 310 c -13.42 0 -21.78 -4.4 -22 -4.4 V 420 c -24.2 0 -44 18 -44 40 h 132 c 0 -22 -19.8 -40 -44 -40 v -85.6 l 101.42 92.2 c 19.58 17.8 51.26 17.8 70.84 0 c 15.84 -14.4 19.36 -36.6 8.36 -54.4 z M 276.32 288.6 c 17.38 4.8 35.86 -4 41.14 -20 c 5.28 -15.8 -4.4 -32.6 -22 -37.4 c -17.38 -4.8 -35.86 4 -41.14 20 c -5.28 15.8 4.62 32.6 22 37.4 z",
      "M175.8 27.6c-54.4 0-160.07 32-160.07 32s24.03 7.26 54.98 14.86C52.11 76.55 22.26 91.2 22.26 91.2s34.61 17 52.52 17c17.98 0 52.72-17 52.72-17s-8.3-4.05-18.8-8.19c24.2 4.88 48.6 8.59 67.1 8.59 43.6 0 119.2-20.32 147.9-28.48 13.8 4.98 34.8 11.68 48 11.68 21.2 0 62-17 62-17s-40.8-17-62-17c-15.2 0-40.5 8.8-53.5 13.72C285.8 45.5 216.5 27.6 175.8 27.6z m145.1 57.1c-34.2 0-100.4 17-100.4 17s66.2 17 100.4 17c34.1 0 100.4-17 100.4-17s-66.3-17-100.4-17z m-167.7 57.1c-34.2 0-100.46 17-100.46 17s66.26 17 100.46 17c19.4 0 49.3-5.5 71.5-10.3-15.4 7.4-26.5 13.6-26.5 13.6s9.1 5.1 22.2 11.5c-35.1 3.9-80.9 15.7-80.9 15.7s66.2 17 100.4 17c15.1 0 36.6-3.4 55.9-7.1.9.1 1.9.1 2.8.1 23.9 0 63.4-18.2 85.1-29.1 4.2.3 8.1.5 11.7.5 34.1 0 100.4-17 100.4-17s-66.3-17-100.4-17c-11 0-25.4 1.8-39.7 4.2-19.6-8.4-41.6-16.1-57.1-16.1-14.7 0-35.4 6.9-54.1 14.8-19.1-4.6-64.8-14.8-91.3-14.8z m195.5 81.8c-46.2 0-136.1 32-136.1 32s31.7 11.3 67.2 20.5c-4-.2-7.8-.3-11.4-.3-60.1 0-176.95 25.3-176.95 25.3s116.85 25.4 176.95 25.4c21.1 0 49.2-3.1 76.8-7.2-27.5 9.1-53.1 21.1-53.1 21.1s66.2 31 100.4 31c34.1 0 100.4-31 100.4-31s-56.1-26.3-91.7-30.5c25.8-4.8 44.2-8.8 44.2-8.8s-36.1-7.8-78.5-14.8c48.2-5.9 118-30.7 118-30.7s-89.9-32-136.2-32z m-253.37 3.2c-21.1 0-61.88 25.7-61.88 25.7s40.78 25.6 61.88 25.6c21.17 0 62.07-25.6 62.07-25.6s-40.9-25.7-62.07-25.7z m81.77 119.6c-21.1 0-61.9 25.7-61.9 25.7s15 9.4 31.4 16.8c-4.8-.5-9.3-.7-13.3-.7-34.2 0-100.43 17-100.43 17s37.91 9.7 71.23 14.5c-17.97 4.4-39.56 15-39.56 15s34.61 17 52.56 17c18 0 52.7-17 52.7-17s-15.5-7.6-31.2-12.6c35.2-1.5 95.1-16.9 95.1-16.9s-19.9-5.1-43.6-9.7c21.6-6.2 49-23.4 49-23.4s-40.9-25.7-62-25.7z m238.3 75.4c-21.1 0-61.9 17-61.9 17s16.6 6.9 34 11.9c-35.6 2.2-92 16.7-92 16.7s66.2 17 100.4 17c34.1 0 100.4-17 100.4-17s-33.7-8.6-65.4-13.6c21.1-4.5 46.5-15 46.5-15s-40.9-17-62-17z",
      "M416 128c-.6 0-1.1.2-1.6.2 1.1-5.2 1.6-10.6 1.6-16.2 0-44.2-35.8-80-80-80-24.6 0-46.3 11.3-61 28.8C256.4 24.8 219.3 0 176 0 114.1 0 64 50.1 64 112c0 7.3.8 14.3 2.1 21.2C27.8 145.8 0 181.5 0 224c0 53 43 96 96 96h320c53 0 96-43 96-96s-43-96-96-96z M88 374.2c-12.8 44.4-40 56.4-40 87.7 0 27.7 21.5 50.1 48 50.1s48-22.4 48-50.1c0-31.4-27.2-43.1-40-87.7-2.2-8.1-13.5-8.5-16 0z m160 0c-12.8 44.4-40 56.4-40 87.7 0 27.7 21.5 50.1 48 50.1s48-22.4 48-50.1c0-31.4-27.2-43.1-40-87.7-2.2-8.1-13.5-8.5-16 0z m160 0c-12.8 44.4-40 56.4-40 87.7 0 27.7 21.5 50.1 48 50.1s48-22.4 48-50.1c0-31.4-27.2-43.1-40-87.7-2.2-8.1-13.5-8.5-16 0z",
      "M183.9 370.1c-7.6-4.4-17.4-1.8-21.8 6l-64 112c-4.4 7.7-1.7 17.5 6 21.8 2.5 1.4 5.2 2.1 7.9 2.1 5.5 0 10.9-2.9 13.9-8.1l64-112c4.4-7.6 1.7-17.4-6-21.8z m96 0c-7.6-4.4-17.4-1.8-21.8 6l-64 112c-4.4 7.7-1.7 17.5 6 21.8 2.5 1.4 5.2 2.1 7.9 2.1 5.5 0 10.9-2.9 13.9-8.1l64-112c4.4-7.6 1.7-17.4-6-21.8z m-192 0c-7.6-4.4-17.4-1.8-21.8 6l-64 112c-4.4 7.7-1.7 17.5 6 21.8 2.5 1.4 5.2 2.1 7.9 2.1 5.5 0 10.9-2.9 13.9-8.1l64-112c4.4-7.6 1.7-17.4-6-21.8z m384 0c-7.6-4.4-17.4-1.8-21.8 6l-64 112c-4.4 7.7-1.7 17.5 6 21.8 2.5 1.4 5.2 2.1 7.9 2.1 5.5 0 10.9-2.9 13.9-8.1l64-112c4.4-7.6 1.7-17.4-6-21.8z m-96 0c-7.6-4.4-17.4-1.8-21.8 6l-64 112c-4.4 7.7-1.7 17.5 6 21.8 2.5 1.4 5.2 2.1 7.9 2.1 5.5 0 10.9-2.9 13.9-8.1l64-112c4.4-7.6 1.7-17.4-6-21.8z M416 128c-.6 0-1.1.2-1.6.2 1.1-5.2 1.6-10.6 1.6-16.2 0-44.2-35.8-80-80-80-24.6 0-46.3 11.3-61 28.8C256.4 24.8 219.3 0 176 0 114.2 0 64 50.1 64 112c0 7.3.8 14.3 2.1 21.2C27.8 145.8 0 181.5 0 224c0 53 43 96 96 96h320c53 0 96-43 96-96s-43-96-96-96z",
      "M510.9 152.3l-5.9-14.5c-3.3-8-12.6-11.9-20.8-8.7L456 140.6v-29c0-8.6-7.2-15.6-16-15.6h-16c-8.8 0-16 7-16 15.6v46.9c0 .5.3 1 .3 1.5l-56.4 23c-5.9-10-13.3-18.9-22-26.6 13.6-16.6 22-37.4 22-60.5 0-53-43-96-96-96s-96 43-96 96c0 23.1 8.5 43.9 22 60.5-8.7 7.7-16 16.6-22 26.6l-56.4-23c.1-.5.3-1 .3-1.5v-46.9C104 103 96.8 96 88 96H72c-8.8 0-16 7-16 15.6v29l-28.1-11.5c-8.2-3.2-17.5.7-20.8 8.7l-5.9 14.5c-3.3 8 .7 17.1 8.9 20.3l135.2 55.2c-.4 4-1.2 8-1.2 12.2 0 10.1 1.7 19.6 4.2 28.9C120.9 296.4 104 334.2 104 376c0 54 28.4 100.9 70.8 127.8 9.3 5.9 20.3 8.2 31.3 8.2h99.2c13.3 0 26.3-4.1 37.2-11.7 46.5-32.3 74.4-89.4 62.9-152.6-5.5-30.2-20.5-57.6-41.6-79 2.5-9.2 4.2-18.7 4.2-28.7 0-4.2-.8-8.1-1.2-12.2L502 172.6c8.1-3.1 12.1-12.2 8.9-20.3z M224 96c-8.8 0-16-7.2-16-16s7.2-16 16-16 16 7.2 16 16-7.2 16-16 16z m32 272c-8.8 0-16-7.2-16-16s7.2-16 16-16 16 7.2 16 16-7.2 16-16 16z m0-64c-8.8 0-16-7.2-16-16s7.2-16 16-16 16 7.2 16 16-7.2 16-16 16z m0-64c-8.8 0-16-7.2-16-16s7.2-16 16-16 16 7.2 16 16-7.2 16-16 16z m0-88s-16-23.2-16-32 7.2-16 16-16 16 7.2 16 16-16 32-16 32z m32-56c-8.8 0-16-7.2-16-16s7.2-16 16-16 16 7.2 16 16-7.2 16-16 16z",
      "M139 400s-23 25.3-23 40.7c0 12.8 10.3 23.3 23 23.3s23-10.5 23-23.3c0-15.4-23-40.7-23-40.7z M217 368s-23 25.3-23 40.7c0 12.8 10.4 23.3 23 23.3 12.7 0 23-10.5 23-23.3 0-15.4-23-40.7-23-40.7z M295 400s-23 25.3-23 40.7c0 12.8 10.3 23.3 23 23.3 12.6 0 23-10.5 23-23.3 0-15.4-23-40.7-23-40.7z M373 368s-23 25.3-23 40.7c0 12.8 10.4 23.3 23 23.3 12.7 0 23-10.5 23-23.3 0-15.4-23-40.7-23-40.7z M393.2 161.2C380.5 96.6 323.9 48 256 48c-39.7 0-76 14-100.9 45.4 34.3 2.6 66.1 15.2 90.7 39.8 18.2 18.2 31 40.5 37.4 64.8h-33.5c-15.3-43.7-56-75-105.7-75-6 0-14.3.7-20.6 2C70 136 32 180.4 32 235.5 32 297.6 79.4 352 141.2 352h242.7c51.5 0 96.2-46 96.2-97.8-.1-49.4-38.4-89.6-86.9-93z",
      "M 508.56 258.696 H 349.944 L 492.576 78.48 c 2.952 -3.816 0.288 -9.36 -4.536 -9.36 H 211.92 c -2.016 0 -3.96 1.08 -4.968 2.88 L 20.4 394.2 c -2.232 3.816 0.504 8.64 4.968 8.64 h 125.568 l -64.368 257.472 c -1.368 5.616 5.4 9.576 9.576 5.544 L 512.52 268.56 c 3.744 -3.528 1.224 -9.864 -3.96 -9.864 z",
    ],
    []
  );

  const weatherIconDetails = useMemo(
    () => [
      "Sunny",
      "Partial Sunny",
      "Cloudy",
      "Windy",
      "Foggy",
      "Drizzle",
      "Rainy",
      "Snowy",
      "Showers",
      "Thunderstorm",
    ],
    []
  );

  const width = 900;
  const height = 1280;
  const innerRadius = (0.35 * width) / 2;
  const outerRadius = (0.85 * width) / 2;

  const xScale = useCallback(
    (d: Date) =>
      scaleUtc([new Date(fromDate), new Date(toDate)], [0, 2 * Math.PI])(d),
    []
  );
  /* draw map */
  useEffect(() => {
    if (!mapData || !chartRef.current) return;

    const mapIcon =
      "M 2.8285 -8.3475 c -1.562 -1.5365 -4.0945 -1.5365 -5.6565 0 c -1.562 1.537 -1.562 4.0285 0 5.565 L 0 0 l 2.8285 -2.7825 c 1.562 -1.5365 1.562 -4.028 0 -5.565 z m -2.8285 4.0975 c -0.334 0 -0.6475 -0.13 -0.884 -0.366 c -0.4875 -0.4875 -0.4875 -1.2805 0 -1.768 c 0.236 -0.236 0.55 -0.366 0.884 -0.366 s 0.648 0.13 0.884 0.366 c 0.4875 0.4875 0.4875 1.281 0 1.768 c -0.236 0.236 -0.55 0.366 -0.884 0.366 z";
    const svg = select(chartRef.current);
    const map = svg.select(".map").attr("transform", "translate(295,220)");

    let path = geoPath();
    const projection = geoIdentity()
      .reflectY(true)
      .fitSize([125, 250], mapData?.districts ?? null);
    path = geoPath(projection);

    map
      .selectAll("path")
      .data(mapData.districts.features)
      .join("path")
      .attr("d", (d) => path(d.geometry) ?? null)
      .attr("stroke-width", 0.5)
      .attr("stroke", "white")
      .attr("fill", (d) =>
        d.properties?.Name === `_${value.gsp}`
          ? "#336699DD"
          : colorScheme.tempRing
      );

    if (pinData?.result?.eastings && pinData?.result?.northings) {
      const easting = pinData.result.eastings;
      const northing = pinData.result.northings;
      map
        .selectAll(".pin")
        .data([{ easting, northing }])
        .enter()
        .append("g")
        .classed("pin", true)
        .append("path")
        .attr("d", mapIcon)
        .attr("fill", "#000433")
        .attr("stroke-width", 0.5)
        .attr("stroke", "white")
        .attr("transform", function (d) {
          return (
            "translate(" + projection([d.easting, d.northing]) + ") scale(3)"
          );
        });
    }
  }, [colorScheme.tempRing, mapData, value.gsp, isPinSuccess, pinData]);

  /* draw the legend */
  useEffect(() => {
    if (!chartRef.current) return;

    const legendContainer = select("g.legend").attr(
      "transform",
      "translate(60,-440)"
    );

    legendContainer.selectAll("*").remove();

    const weatherIconsLegend = legendContainer
      .append("g")
      .classed("weatherIconLegend", true);
    weatherIconsLegend
      .append("text")
      .text("Weather Symbols")
      .attr("text-anchor", "end")
      .attr("font-weight", "bold")
      .attr("transform", "translate(370,30)");

    weatherIconsLegend
      .append("rect")
      .attr("width", 10)
      .attr("height", 10)
      .attr("fill", colorScheme.weatherSymbol)
      .attr("transform", "translate(360,40)");
    weatherIconsLegend
      .append("rect")
      .attr("width", 10)
      .attr("height", 10)
      .attr("fill", colorScheme.weatherSymbolSunday)
      .attr("transform", "translate(360,56)");
    weatherIconsLegend
      .append("text")
      .attr("text-anchor", "end")
      .attr("dy", 16)
      .text("Weekdays/Weekends")
      .attr("transform", "translate(350,32)");
    weatherIconsLegend
      .append("text")
      .attr("text-anchor", "end")
      .attr("dy", 32)
      .text("Sundays")
      .attr("transform", "translate(350,32)");

    weatherIconDetails.forEach((weatherIconText, i) =>
      weatherIconsLegend
        .append("text")
        .attr("text-anchor", "end")
        .attr("dy", (i + 5) * 16)
        .text(weatherIconText)
        .attr("transform", "translate(350,0)")
    );
    weatherIcon.forEach((weatherIcon, i) =>
      weatherIconsLegend
        .append("path")
        .attr("d", weatherIcon)
        .attr("transform", `translate(360,${(i + 4.5) * 16}),scale(0.018)`)
    );

    const dayNightLegend = legendContainer
      .append("g")
      .classed("dayNightLegend", true);
    dayNightLegend
      .append("circle")
      .attr("cx", 20)
      .attr("cy", 90)
      .attr("r", 3)
      .attr("fill", colorScheme.line);
    dayNightLegend
      .append("path")
      .attr("d", "M-30,40 l60,-60 l50,0")
      .attr("fill", "none")
      .attr("stroke", colorScheme.line)
      .attr("transform", "translate(50 50)");
    dayNightLegend
      .append("text")
      .text("Dark")
      .attr("font-weight", "bold")
      .attr("transform", "translate(135 33)");
    dayNightLegend
      .append("circle")
      .attr("cx", 40)
      .attr("cy", 180)
      .attr("r", 3)
      .attr("fill", colorScheme.line);
    dayNightLegend
      .append("path")
      .attr("d", "M-60,80 l100,-100 l50,0")
      .attr("fill", "none")
      .attr("stroke", colorScheme.line)
      .attr("transform", "translate(100 100)");
    dayNightLegend
      .append("text")
      .text("Daylight")
      .attr("font-weight", "bold")
      .attr("transform", "translate(195 83)");
  }, [
    colorScheme.line,
    colorScheme.weatherSymbol,
    colorScheme.weatherSymbolSunday,
    weatherIcon,
    weatherIconDetails,
  ]);

  /* draw the template with weather info */
  useEffect(() => {
    if (!chartRef.current) return;

    const monthData = [
      { month: "January", days: 31 },
      { month: "February", days: 28 },
      { month: "March", days: 31 },
      { month: "April", days: 30 },
      { month: "May", days: 31 },
      { month: "June", days: 30 },
      { month: "July", days: 31 },
      { month: "August", days: 31 },
      { month: "September", days: 30 },
      { month: "October", days: 31 },
      { month: "November", days: 30 },
      { month: "December", days: 31 },
    ];

    const yDayScale = scaleLinear()
      .domain([0, 24])
      .range([innerRadius, outerRadius]);

    const addWeatherSymbols = (
      g: Selection<SVGGElement, unknown, null, undefined>,
      data: IWeatherData[]
    ) =>
      g.attr("transform", "rotate(-90)").call((g) =>
        g
          .selectAll("g")
          .data(data)
          .join("g")
          .attr(
            "transform",
            (d, i, arr) => `
          rotate(${(i * 360) / 365})
          translate(${outerRadius + 8},0)
        `
          )
          .call((g) =>
            g
              .append("path")
              .attr(
                "d",
                (d) =>
                  weatherIcon[
                    Number(d.weather_code) >= 10
                      ? Math.floor(Number(d.weather_code) / 10)
                      : (Number(d.weather_code) === 6 ||
                          Number(d.weather_code) === 5) &&
                        Number(d.precipitation_hours) <
                          Number(d.sunshine_duration) / 3600 / 2
                      ? 0
                      : Number(d.weather_code)
                  ]
              )
              .style("fill", (d, i) =>
                i % 7 === 0
                  ? colorScheme.weatherSymbolSunday
                  : colorScheme.weatherSymbol
              )
              .attr("opacity", (d, i) => 1 - (i % 7) * 0.1)
              .attr("transform", "rotate(90), scale(0.011)")
              .attr("stroke", "none")
          )
      );

    const drawNightRegion = (
      g: Selection<SVGGElement, unknown, null, undefined>,
      data: IWeatherData[]
    ) => {
      g.selectAll("*").remove();
      g.append("path")
        .attr("fill", "url(#fillMorning")
        .attr("fill-opacity", 0.8)
        .attr(
          "d",
          areaRadial<IWeatherData>()
            .curve(curveLinearClosed)
            .angle((d) => xScale(new Date(d.time)))
            .outerRadius((d) => {
              const sunrise = new Date(d.sunrise);
              return yDayScale(sunrise.getHours() + sunrise.getMinutes() / 60);
            })
            .innerRadius(innerRadius)(data)
        );
      g.append("path")
        .attr("fill", "url(#fillNight")
        .attr("fill-opacity", 0.8)
        .attr(
          "d",
          areaRadial<IWeatherData>()
            .curve(curveLinearClosed)
            .angle((d) => xScale(new Date(d.time)))
            .innerRadius((d) => {
              const sunset = new Date(d.sunset);
              return yDayScale(sunset.getHours() + sunset.getMinutes() / 60);
            })
            .outerRadius(outerRadius)(data)
        );
    };

    const drawTemperatureBar = (
      g: Selection<SVGGElement, unknown, null, undefined>,
      data: IWeatherData[],
      xScale: ScaleBand<string>,
      yScale: ScaleRadial<number, number, never>,
      colorScale: ScaleLinear<string, string, never>
    ) => {
      g.selectAll("*").remove();
      const tempArc = arc<IWeatherData>()
        .innerRadius((d) => yScale(Number(d.temperature_2m_min)) ?? 0)
        .outerRadius((d) => yScale(Number(d.temperature_2m_max)) ?? 0)
        .startAngle((d) => xScale(d.time) ?? 0)
        .endAngle((d) => (xScale(d.time) ?? 0) + xScale.bandwidth())
        .padAngle(0.03)
        .padRadius(innerRadius);
      g.selectAll("path")
        .data(data)
        .join("path")
        .attr("opacity", 1)
        .style("fill", (d) =>
          colorScale(
            (Number(d.temperature_2m_max) + Number(d.temperature_2m_min)) / 2
          )
        )
        .style("stroke", (d) =>
          colorScale(
            (Number(d.temperature_2m_max) + Number(d.temperature_2m_min)) / 2
          )
        )
        .attr("d", tempArc);

      g.attr("text-anchor", "middle")
        .selectAll()
        .data(yScale.ticks(6).reverse())
        .join("g")
        .call((g) =>
          g
            .append("circle")
            .attr("fill", "none")
            .attr("stroke", colorScheme.tempRing)
            .attr("stroke-opacity", 0.4)
            .attr("r", yScale)
        )
        .call((g) =>
          g
            .append("text")
            .attr("y", (d) => yScale(d))
            .attr("dy", "0.35em")
            .attr("stroke-linecap", "round")
            .attr("stroke", "#fff")
            .attr("stroke-width", 2)
            .attr("font-size", 8)
            .attr("stroke-linejoin", "round")
            .attr("fill", colorScheme.textMonth)
            .attr("paint-order", "stroke")
            .text((x, i) => `${x.toFixed(0)}°c`)
        );
    };

    const xAxis = (g: Selection<SVGGElement, unknown, null, undefined>) => {
      g.selectAll("*").remove();
      g.attr("transform", "rotate(-90)")
        .attr("text-anchor", "middle")
        .call((g) =>
          g
            .selectAll("g")
            .data(monthData)
            .join("g")
            .attr(
              "transform",
              (d, i, arr) => `
          rotate(${
            ([...monthData]
              .slice(0, i)
              .reduce((acc, cur) => acc + cur.days, 0) /
              365) *
            360
          })
          translate(${innerRadius},0)
        `
            )
            .call((g) =>
              g
                .append("line")
                .attr("x1", (d, i) => (i % 3 === 0 ? -40 : -5))
                .attr("x2", (d, i) =>
                  i % 3 === 0
                    ? outerRadius - innerRadius + 100
                    : outerRadius - innerRadius
                )
                .style("stroke", colorScheme.xAxis)
            )
            .call((g) =>
              g
                .append("text")
                .attr("text-anchor", "middle")
                .attr("transform", (d, i, arr) =>
                  ((i * 360) / arr.length) % 360 >= 270 ||
                  ((i * 360) / arr.length) % 360 < 90
                    ? `rotate(${90 + 360 / 12 / 2})translate(${
                        (Math.PI * innerRadius) / 12
                      },16)`
                    : `rotate(${-90 + 360 / 12 / 2})translate(${
                        -(Math.PI * innerRadius) / 12
                      },-9)`
                )
                .style("font-family", "sans-serif")
                .style("font-size", 10)
                .attr("fill", colorScheme.textMonth)
                .text((d) => d.month)
            )
        );
    };

    const svg = select(chartRef.current);
    const container = svg
      .select<SVGGElement>(".container")
      .style("font-size", 10)
      .style("font-family", "sans-serif");
    const nightRegionContainer = container.select<SVGGElement>(".nightRegion");
    const weatherSymbolContainer =
      container.select<SVGGElement>(".weatherSymbol");
    const temperatureContainer = container.select<SVGGElement>(".temperature");
    const xAxisContainer = container.select<SVGGElement>(".xAxis");

    nightRegionContainer.selectAll("*").remove();
    weatherSymbolContainer.selectAll("*").remove();
    temperatureContainer.selectAll("*").remove();
    xAxisContainer.selectAll("*").remove();

    csv("/weather.csv")
      .then((data) => {
        if (data) {
          drawNightRegion(
            nightRegionContainer,
            data as unknown as IWeatherData[]
          );
          addWeatherSymbols(
            weatherSymbolContainer,
            data as unknown as IWeatherData[]
          );

          const tempMeanMin = min(
            data,
            (d) =>
              (Number(d.temperature_2m_max) + Number(d.temperature_2m_min)) / 2
          );
          const tempMeanMax = max(
            data,
            (d) =>
              (Number(d.temperature_2m_max) + Number(d.temperature_2m_min)) / 2
          );
          const tempMin = min(data, (d) => Number(d.temperature_2m_min));
          const tempMax = max(data, (d) => Number(d.temperature_2m_max));

          const interpolated = interpolate(tempMeanMin!, tempMeanMax!);
          const colorDomain = quantize(interpolated, 7);
          const colorScale = scaleLinear(
            colorDomain,
            quantize(interpolateRdYlBu, 7).reverse()
          );
          const xTempScale = scaleBand(
            data.map((d) => d.time),
            [0, (2 * Math.PI * data.length) / 365]
          );
          const yTempScale = scaleLinear()
            .domain([tempMin!, toNextTen(tempMax ?? 0)])
            .range([innerRadius, outerRadius - 10])
            .nice();
          drawTemperatureBar(
            temperatureContainer,
            data as unknown as IWeatherData[],
            xTempScale,
            yTempScale,
            colorScale
          );

          const legendGradient = svg
            .append("defs")
            .append("linearGradient")
            .attr("id", "colorLegend");
          legendGradient
            .attr("x1", "0%")
            .attr("y1", "0%")
            .attr("x2", "100%")
            .attr("y2", "0%");
          legendGradient
            .append("stop")
            .attr("offset", "0%")
            .attr("stop-color", interpolateRdYlBu(1));
          legendGradient
            .append("stop")
            .attr("offset", "25%")
            .attr("stop-color", interpolateRdYlBu(0.75));
          legendGradient
            .append("stop")
            .attr("offset", "50%")
            .attr("stop-color", interpolateRdYlBu(0.5));
          legendGradient
            .append("stop")
            .attr("offset", "75%")
            .attr("stop-color", interpolateRdYlBu(0.25));
          legendGradient
            .append("stop")
            .attr("offset", "100%")
            .attr("stop-color", interpolateRdYlBu(0));

          const legendContainer = svg.select(".legend");
          legendContainer.select("g.colorLegend").remove();
          const colorLegend = legendContainer
            .append("g")
            .classed("colorLegend", true)
            .attr("color", "black")
            .attr("transform", "translate(-3,-10)");
          colorLegend
            .append("rect")
            .attr("width", 215)
            .attr("height", 10)
            .attr("fill", "url(#colorLegend")
            .attr("transform", "translate(157,-10)");
          colorLegend
            .append("text")
            .text("Temperature Range")
            .attr("text-anchor", "end")
            .attr("fill", "black")
            .attr("font-weight", "bold")
            .attr("transform", "translate(372,-15)");
          colorLegend.call(
            axisBottom(yTempScale)
              .tickSize(-10)
              .tickFormat((d) => `${d}°c`)
          );
          colorLegend
            .selectAll(".tick text")
            .attr("font-size", 8)
            .attr("font-weight", "thin");
          colorLegend
            .selectAll("line")
            .attr("stroke-width", 1)
            .attr("stroke", "white");
          colorLegend.selectAll("path").remove();
        }
      })
      .catch((err) => {
        throw new Error(err);
      });
    xAxisContainer.call(xAxis);
    const octopus = selectOrAppend(
      "path",
      "octopus",
      xAxisContainer
    ) as Selection<SVGPathElement, unknown, null, undefined>;
    octopus
      .attr("transform", "rotate(90), scale(0.7), translate(-125 -143)")
      .attr(
        "d",
        "m56.32,236.42c-1.84.14-3.16.88-4.55,1.38-3.55,1.28-7.18,2.27-10.94,2.67-2.41.26-4.8.76-7.24.76-2.23,0-4.39-.7-6.61-.72-1.81-.02-3.46-.58-5.08-1.25-2.93-1.2-5.49-2.67-6.2-6.23-.33-1.64.36-2.87.8-4.2.83-2.5,2.87-4.13,4.76-5.82,1.84-1.64,3.75-3.22,5.54-4.92,2.3-2.18,4.05-4.88,4.83-7.86.61-2.32,1.55-4.85.41-7.37-.14-.31-.08-.74-.05-1.11.13-2.14-.57-4.11-1.35-6.03-.61-1.49-1.38-2.9-1.74-4.5-.18-.79-.84-1.47-1.29-2.2-2.37-3.8-4.59-7.71-7.17-11.37-2.98-4.22-5.34-8.81-7.95-13.23-1.73-2.93-3.06-6.17-4.53-9.28-1.61-3.42-2.86-6.98-3.93-10.59-1.09-3.7-2.3-7.36-3.04-11.19C-.22,126.99.07,120.59,0,114.2c-.02-1.96,0-3.92,0-5.87-.01-2.95.7-5.83.92-8.75.23-3.08,1.08-6,1.66-8.99.67-3.48,1.68-6.89,2.65-10.31.86-3.05,1.74-6.07,2.91-9,1.01-2.53,2.04-5.05,3.15-7.53,1.83-4.08,3.95-8.01,6.22-11.86,1.43-2.42,3.08-4.7,4.86-6.88.61-.74.87-1.69,1.48-2.4,3.63-4.25,7.22-8.56,11.4-12.27,3.37-3,6.81-5.93,10.53-8.54,4.78-3.36,9.85-6.21,15.06-8.79,4.49-2.23,9.23-3.95,13.96-5.65,5.17-1.86,10.56-2.94,15.91-4.14,3.34-.75,6.71-1.49,10.11-1.85,2.57-.27,5.13-.65,7.71-.86,11.84-.99,23.69-.13,35.53-.43.49-.01,1,.1,1.46.26.69.24,1.34.43,2.09.23.38-.11.9-.14,1.23.04,1.63.9,3.41.39,5.11.65.59.09,1.06.46,1.64.53,2.74.34,5.44.88,8.15,1.3,4.62.72,9.05,2.12,13.59,3.1,2.66.57,5.24,1.72,7.85,2.65,2.38.85,4.63,1.99,7.05,2.76,2.81.9,5.34,2.45,7.93,3.85,4.02,2.18,7.9,4.54,11.66,7.18,3.06,2.14,6.02,4.38,8.87,6.76,3.79,3.15,7.33,6.57,10.36,10.48,1.14,1.47,2.54,2.71,3.57,4.29,2.32,3.58,5.04,6.88,7.22,10.57,2.51,4.27,4.5,8.77,6.54,13.26,1.49,3.28,2.88,6.6,3.69,10.13.73,3.16,1.74,6.25,2.47,9.42.56,2.42.89,4.91,1.63,7.3.18.59.09,1.23.14,1.84.26,3.11,1.15,6.13,1.13,9.27-.05,6.08.04,12.17-.05,18.25-.03,1.7-.48,3.4-.74,5.09-.23,1.5-.4,3.01-.72,4.49-.57,2.64-1.28,5.24-2.13,7.81-.98,2.96-1.85,5.96-3.07,8.84-1.11,2.62-2.31,5.21-3.55,7.78-1.08,2.24-2.09,4.54-3.46,6.6-2.26,3.41-3.89,7.15-6.14,10.57-2.71,4.1-4.99,8.48-7.43,12.76-2.29,4.02-3.99,8.29-5.6,12.63-1.04,2.81-1.22,5.34-.49,8.19.97,3.75,2.84,6.86,5.62,9.49,1.77,1.67,3.42,3.51,5.36,4.95,2.01,1.48,3.45,3.32,4.7,5.39,1.57,2.58.71,6.34-1.69,8.17-3.52,2.7-7.53,3.76-11.87,3.81-1.1.01-2.06.56-3.17.53-2.71-.07-5.36-.61-8.05-.78-3.29-.2-6.39-1.31-9.49-2.25-2.11-.64-4.34-1.17-6.2-2.53-.28-.21-.6-.28-1.08-.11,1.8,2.54,3.5,5.08,5.7,7.28,2.17,2.18,4.67,3.78,7.4,5.1,3.39,1.64,6.71,3.39,9.78,5.58,1.71,1.22,2.54,3.04,3.05,4.96.49,1.85-1.13,2.84-2.14,3.96-1.4,1.55-3.19,2.69-5.1,3.54-3.88,1.73-7.87,3.14-12.05,3.95-4.38.85-8.81.94-13.25.76-3.87-.16-7.63-.89-11.35-2.08-2.73-.88-5.45-1.8-8.08-2.92-1.5-.64-2.88-1.57-4.28-2.43-.97-.6-1.93-1.3-3.02-1.78-2.78-1.21-4.91-3.31-7.26-5.17-1.28-1.01-2.5-2.15-3.85-3.09-.48-.33-.93-.54-1.11.5-.42,2.42-1.24,4.76-2,7.1-.7,2.16-1.25,4.37-2.1,6.47-2.52,6.22-6.29,11.48-12.37,14.69-2.02,1.07-4.18,1.91-6.61,1.75-1.99-.13-4.01-.16-5.99,0-3,.24-5.67-.62-8.11-2.18-2.4-1.53-4.7-3.22-6.39-5.59-2.39-3.35-4.57-6.82-5.87-10.75-.43-1.3-.69-2.65-1.01-3.98-.56-2.37-1.16-4.72-1.54-7.24-1.07.78-2.14,1.42-3.05,2.24-3.21,2.9-6.88,5.06-10.69,7.04-.73.38-1.37.93-2.1,1.32-5.61,2.97-11.6,4.87-17.85,5.78-4.21.61-8.5.46-12.77.17-3.58-.24-7.03-1.11-10.35-2.22-3.05-1.02-6.25-1.95-8.83-4.09-1.44-1.19-2.72-2.55-3.96-3.92-.79-.87-.23-3.52.73-4.72,2.09-2.63,5.13-3.9,7.83-5.67,2.1-1.37,4.44-2.19,6.61-3.4,3.12-1.73,5.31-4.38,7.64-6.92.83-.91,1.51-1.96,2.45-3.2Z"
      )
      .attr("fill", "url(#octopus)");

    const savingMsg = selectOrAppend(
      "g",
      "saving",
      xAxisContainer
    ) as Selection<SVGGElement, unknown, null, undefined>;
    savingMsg.selectAll("*").remove();
    savingMsg
      .append("text")
      .attr("font-size", "75px")
      .attr("font-weight", "bold")
      .attr("dy", -30)
      .attr("fill", "#FFFFFFBB")
      .attr("transform", "rotate(90)")
      .attr("letter-spacing", -3)
      .text(chartYear);

    const heading = select(".heading");
    heading.selectAll("*").remove();
    heading
      .append("text")
      .attr("font-size", "65px")
      .attr("letter-spacing", -2)
      .attr("transform", "translate(-430 -460)")
      .attr("fill", colorScheme.textTitle)
      .text("My");
    heading
      .append("text")
      .attr("font-size", "65px")
      .attr("letter-spacing", -2)
      .attr("transform", "translate(-430 -410)")
      .attr("fill", colorScheme.textTitle)
      .text("Energy");
    heading
      .append("text")
      .attr("font-size", "65px")
      .attr("letter-spacing", -2)
      .attr("transform", "translate(-430 -360)")
      .attr("fill", colorScheme.textTitle)
      .text("Footprint");
    heading
      .append("text")
      .attr("text-anchor", "end")
      .attr("font-size", "14px")
      .attr("transform", "translate(430 -500)")
      .attr("fill", colorScheme.textTitle)
      .text("https://octopriceuk.vercel.app");
    heading
      .append("text")
      .attr("text-anchor", "end")
      .attr("font-size", "10px")
      .attr("font-weight", "bold")
      .attr("transform", "translate(0 -450), rotate(-90)")
      .attr("fill", colorScheme.textCumulative)
      .text("Cumulative");
    heading
      .append("text")
      .attr("text-anchor", "end")
      .attr("font-size", "10px")
      .attr("font-weight", "bold")
      .attr("transform", "translate(420 0)")
      .attr("fill", colorScheme.textDaily)
      .text("Daily");
  }, [
    colorScheme.tempRing,
    colorScheme.textDaily,
    colorScheme.textMonth,
    colorScheme.textTitle,
    colorScheme.textYear,
    colorScheme.weatherSymbol,
    colorScheme.weatherSymbolSunday,
    colorScheme.xAxis,
    colorScheme.textCumulative,
    innerRadius,
    outerRadius,
    weatherIcon,
    xScale,
  ]);

  /* tariff details */
  useEffect(() => {
    if (
      !chartRef.current ||
      (!tariffEIsSuccess && !tariffGIsSuccess) ||
      (!tariffEData?.[0].display_name && !tariffGData?.[0].display_name)
    )
      return;

    const svg = select(chartRef.current);
    const infoContainer = svg.select(".info");
    infoContainer.selectAll("*").remove();
    if (tariffGData?.[0].display_name) {
      infoContainer
        .append("text")
        .attr("font-size", "40px")
        .attr("letter-spacing", -2)
        .attr("transform", "translate(70 690)")
        .attr("fill", colorScheme.textTitle)
        .text(tariffGData?.[0].display_name ?? "");
      infoContainer
        .append("text")
        .attr("font-size", "10px")
        .attr("letter-spacing", 0)
        .attr("transform", "translate(70 705)")
        .attr("fill", colorScheme.textTitle)
        .text(
          `(current tariff from ${new Date(
            currentGContract?.valid_from ?? ""
          ).toLocaleDateString()})`
        );
      infoContainer
        .append("path")
        .attr("d", icons.gas)
        .style("fill", colorScheme.gasIcon)
        .attr("transform", "translate(20 650), scale(2.2)");
    }
    if (tariffEData?.[0].display_name) {
      infoContainer
        .append("text")
        .attr("font-size", "40px")
        .attr("letter-spacing", -2)
        .attr("transform", "translate(-380 690)")
        .attr("fill", colorScheme.textTitle)
        .text(tariffEData?.[0].display_name ?? "");
      infoContainer
        .append("text")
        .attr("font-size", "10px")
        .attr("letter-spacing", 0)
        .attr("transform", "translate(-380 705)")
        .attr("fill", colorScheme.textTitle)
        .text(
          `(current tariff from ${new Date(
            currentEContract?.valid_from ?? ""
          ).toLocaleDateString()})`
        );
      infoContainer
        .append("path")
        .attr("d", icons.electricity)
        .style("fill", colorScheme.electricityIcon)
        .attr("transform", "translate(-430 650), scale(3)");
    }
  }, [
    colorScheme.electricityIcon,
    colorScheme.gasIcon,
    colorScheme.textTitle,
    currentEContract?.valid_from,
    currentGContract?.valid_from,
    icons.electricity,
    icons.gas,
    tariffEData,
    tariffEIsSuccess,
    tariffGData,
    tariffGIsSuccess,
  ]);

  /* draw the consumption info */
  useEffect(() => {
    if (
      !chartRef.current ||
      (!consumptionEIsSuccess && !consumptionGIsSuccess) ||
      (!consumptionEData?.results && !consumptionGData?.results)
    )
      return;

    const svg = select(chartRef.current);
    const animationDuration = 3000;

    const savingContainer = svg.select(".saving");
    savingContainer.selectAll("g").remove();

    const gasConsumptionsArr: number[] = [];
    const electricityConsumptionsArr: number[] = [];

    const drawConsumption = (
      g: Selection<SVGGElement, unknown, null, undefined>,
      data: IConsumptionData[],
      scaleY: ScaleLinear<number, number, never>,
      type: Exclude<TariffType, "EG">,
      noOfCharts: number
    ) => {
      let total = 0;
      const dailyChartAmplificationFactor =
        (data?.length ?? 365) > 180 ? 50 : 25;
      if (!(noOfCharts === 2 && type === "E")) {
        g.selectAll(".dailyScale").remove();
        g.append("g")
          .classed("dailyScale", true)
          .attr("transform", "rotate(90)")
          .attr("text-anchor", "middle")
          .selectAll()
          .data(scaleY.ticks(6).reverse())
          .join("g")
          .call((g) =>
            g
              .append("text")
              .attr("y", (d) => -scaleY(d))
              .attr("dy", "0.35em")
              .attr("font-size", 8)
              .attr("stroke-linecap", "round")
              .attr("stroke", "#fff")
              .attr("stroke-width", 2)
              .attr("stroke-linejoin", "round")
              .attr("fill", colorScheme.textDaily)
              .attr("paint-order", "stroke")
              .text(
                (x, i) => `${(x / dailyChartAmplificationFactor).toFixed(0)}kWh`
              )
          );
      }

      const consumptionChart = g
        .append("path")
        .classed("draw", true)
        .attr("stroke", `url(#${type === "E" ? "electricity" : "gas"})`)
        .attr("stroke-width", 4)
        .attr("fill", "none")
        .attr("stroke-linecap", "round")
        .attr("opacity", 0.8)
        .attr("filter", "url(#shadow)")
        .attr(
          "d",
          lineRadial<IConsumptionData>()
            .curve(curveLinear)
            .angle((d) => xScale(new Date(d.interval_start)))
            .radius((d) => {
              total +=
                type === "E"
                  ? d.consumption
                  : d.consumption * value.gasConversionFactor;
              total = evenRound(total, 2);
              type === "E"
                ? electricityConsumptionsArr.push(total)
                : gasConsumptionsArr.push(total);
              return scaleY(total);
            })(data)
        );
      const length = consumptionChart.node()?.getTotalLength() ?? 0;

      const consumptionDailyChart = select(".dailyChart")
        .append("g")
        .append("path")
        .classed("daily", true)
        .attr(
          "stroke",
          `${type === "E" ? colorScheme.electricityLine : colorScheme.gasLine}`
        )
        .attr("stroke-width", 1)
        .attr("fill", "none")
        .attr("stroke-linecap", "round")
        .attr(
          "d",
          lineRadial<IConsumptionData>()
            .angle((d) => xScale(new Date(d.interval_start)))
            .radius((d) => {
              let dailyConsumption =
                type === "E"
                  ? d.consumption
                  : d.consumption * value.gasConversionFactor;
              dailyConsumption = evenRound(dailyConsumption, 2);
              return scaleY(dailyConsumption * dailyChartAmplificationFactor);
            })(data)
        );
      const dailyLength = consumptionDailyChart.node()?.getTotalLength() ?? 0;
      const legendContainer = svg.select(".legend");

      let currentColorId = 0;
      const animateOctopusColor = async () => {
        const length = Math.max(
          electricityConsumptionsArr.length,
          gasConsumptionsArr.length
        );
        const startTime = new Date().getTime();
        for (let i = 0; i < length; i++) {
          const remainingTime =
            animationDuration - (new Date().getTime() - startTime);
          const interval =
            remainingTime / (electricityConsumptionsArr.length - i);
          const totalConsumption =
            (electricityConsumptionsArr[i] ??
              electricityConsumptionsArr.at(-1) ??
              0) + (gasConsumptionsArr[i] ?? gasConsumptionsArr.at(-1) ?? 0);
          let thisColorId = 0;
          if (totalConsumption > 20000) {
            thisColorId = 5;
          } else if (totalConsumption > 15000) {
            thisColorId = 4;
          } else if (totalConsumption > 10000) {
            thisColorId = 3;
          } else if (totalConsumption > 6000) {
            thisColorId = 2;
          } else if (totalConsumption > 3000) {
            thisColorId = 1;
          } else if (totalConsumption > 1000) {
            thisColorId = 0;
          }
          if (thisColorId !== currentColorId) {
            currentColorId = thisColorId;
            svg
              .select(".octopus")
              .attr("fill", `url(#octopus${currentColorId})`);
          }
          await delay(interval);
        }
      };
      animateOctopusColor();

      if (type === "E") {
        legendContainer.select(".electricityLegend").remove();
        const electricityLegend = legendContainer
          .append("g")
          .classed("electricityLegend", true);
        electricityLegend
          .append("text")
          .text("Energy Consumption")
          .attr("text-anchor", "start")
          .attr("fill", "black")
          .attr("font-weight", "bold")
          .attr("transform", "translate(-485,810)");
        electricityLegend
          .append("text")
          .text("Electricity Daily")
          .attr("text-anchor", "start")
          .attr("fill", "black")
          .attr("transform", "translate(-385,830)");
        electricityLegend
          .append("line")
          .attr("stroke-linecap", "round")
          .attr("x1", 0)
          .attr("x2", 95)
          .attr("transform", "translate(-485,827)")
          .attr("stroke", colorScheme.electricityLine)
          .attr("stroke-width", 1);
        electricityLegend
          .append("text")
          .text("Electricity Cumulative")
          .attr("text-anchor", "start")
          .attr("fill", "black")
          .attr("transform", "translate(-385,846)");
        electricityLegend
          .append("line")
          .attr("stroke-linecap", "round")
          .attr("x1", 0)
          .attr("x2", 95)
          .attr("transform", "translate(-485,843)")
          .attr("stroke", colorScheme.electricityLine)
          .attr("stroke-width", 5)
          .attr("opacity", 0.8);

        const electricitySaveContainer = savingContainer
          .append("g")
          .attr(
            "transform",
            `rotate(90) translate(-14 ${noOfCharts === 1 ? 0 : 0})`
          )
          .attr("class", "electricitySave");
        electricitySaveContainer
          .append("path")
          .attr("d", icons.electricity)
          .style("fill", colorScheme.electricityIcon)
          .attr("transform", "translate(-90 -16), scale(2.6)");
        electricitySaveContainer
          .append("text")
          .attr("class", "electricitySum")
          .attr("transform", "translate(90 0)")
          .attr("font-size", "50px")
          .attr("text-anchor", "end")
          .attr("opacity", 0.8)
          .attr("dy", "20px")
          .text("00000");
        electricitySaveContainer
          .append("text")
          .attr("font-weight", "bold")
          .style("fill", colorScheme.electricityIcon)
          .attr("transform", "translate(102 18)")
          .text("kWh");
        const electricitySum =
          electricitySaveContainer.select<SVGTextElement>(".electricitySum");
        animateNumber(
          electricityConsumptionsArr,
          animationDuration,
          electricitySum
        );
      }
      if (type === "G") {
        legendContainer.select(".gasLegend").remove();
        const gasLegend = legendContainer
          .append("g")
          .classed("gasLegend", true);
        gasLegend
          .append("text")
          .text("Energy Consumption")
          .attr("text-anchor", "start")
          .attr("fill", "black")
          .attr("font-weight", "bold")
          .attr("transform", "translate(-485,810)");
        gasLegend
          .append("text")
          .text("Gas Daily")
          .attr("text-anchor", "start")
          .attr("fill", "black")
          .attr("transform", `translate(-385,${noOfCharts === 1 ? 830 : 870})`);
        gasLegend
          .append("line")
          .attr("stroke-linecap", "round")
          .attr("x1", 0)
          .attr("x2", 95)
          .attr("transform", `translate(-485,${noOfCharts === 1 ? 827 : 867})`)
          .attr("stroke", colorScheme.gasLine)
          .attr("stroke-width", 1);
        gasLegend
          .append("text")
          .text("Gas Cumulative")
          .attr("text-anchor", "start")
          .attr("fill", "black")
          .attr("transform", `translate(-385,${noOfCharts === 1 ? 845 : 886})`);
        gasLegend
          .append("line")
          .attr("stroke-linecap", "round")
          .attr("x1", 0)
          .attr("x2", 95)
          .attr("transform", `translate(-485,${noOfCharts === 1 ? 843 : 882})`)
          .attr("stroke", colorScheme.gasLine)
          .attr("stroke-width", 5)
          .attr("opacity", 0.8);

        const gasSaveContainer = savingContainer
          .append("g")
          .attr(
            "transform",
            `rotate(90) translate(-14 ${noOfCharts === 1 ? 0 : 45})`
          )
          .attr("class", "gasSave");
        gasSaveContainer
          .append("path")
          .attr("d", icons.gas)
          .style("fill", colorScheme.gasIcon)
          .attr("transform", "translate(-90 -16), scale(2)");
        gasSaveContainer
          .append("text")
          .attr("class", "gasSum")
          .attr("transform", "translate(90 0)")
          .attr("font-size", "50px")
          .attr("text-anchor", "end")
          .attr("opacity", 0.8)
          .attr("dy", "20px")
          .text("00000");
        gasSaveContainer
          .append("text")
          .attr("transform", "translate(102 18)")
          .attr("font-weight", "bold")
          .style("fill", colorScheme.gasIcon)
          .text("kWh");
        const gasSum = gasSaveContainer.select<SVGTextElement>(".gasSum");
        animateNumber(gasConsumptionsArr, animationDuration, gasSum);
      }
      consumptionChart
        .attr("stroke-dasharray", length + " " + length)
        .attr("stroke-dashoffset", length)
        .transition()
        .ease(easeLinear)
        .attr("stroke-dashoffset", 0)
        .duration(animationDuration);
      consumptionDailyChart
        .attr("stroke-dasharray", dailyLength + " " + dailyLength)
        .attr("stroke-dashoffset", dailyLength)
        .transition()
        .ease(easeLinear)
        .attr("stroke-dashoffset", 0)
        .duration(animationDuration);
    };

    const gasChartContainer = svg.select<SVGGElement>(".gasChart");
    gasChartContainer.selectAll("*").remove();
    const electricityChartContainer =
      svg.select<SVGGElement>(".electricityChart");
    electricityChartContainer.selectAll("*").remove();
    select(".dailyChart").selectAll("*").remove();

    if (
      consumptionGIsSuccess &&
      consumptionGData?.results &&
      consumptionEIsSuccess &&
      consumptionEData?.results
    ) {
      const gasResults = [
        ...consumptionGData.results,
      ].reverse() as IConsumptionData[];
      const gasSum = sum(
        gasResults,
        (d) => Number(d.consumption) * value.gasConversionFactor
      );
      const electricityResults = [
        ...consumptionEData.results,
      ].reverse() as IConsumptionData[];
      const electricitySum = sum(electricityResults, (d) =>
        Number(d.consumption)
      );
      const maxSum = max([gasSum, electricitySum]) ?? 0;
      const yConsumptionScale = scaleLinear()
        .domain([0, maxSum])
        .range([innerRadius, outerRadius - 10])
        .nice();
      gasChartContainer
        .attr("text-anchor", "middle")
        .selectAll()
        .data(yConsumptionScale.ticks(6).reverse())
        .join("g")
        .call((g) =>
          g
            .append("circle")
            .attr("fill", "none")
            .attr("stroke", colorScheme.consumptionRing)
            .attr("stroke-opacity", 0.4)
            .attr("r", yConsumptionScale)
        )
        .call((g) =>
          g
            .append("text")
            .attr("y", (d) => -yConsumptionScale(d))
            .attr("dy", "0.35em")
            .attr("stroke-linecap", "round")
            .attr("stroke", "#fff")
            .attr("stroke-width", 2)
            .attr("font-size", 8)
            .attr("stroke-linejoin", "round")
            .attr("fill", colorScheme.textCumulative)
            .attr("paint-order", "stroke")
            .text((x, i) => `${x.toFixed(0)}kWh`)
        );

      drawConsumption(gasChartContainer, gasResults, yConsumptionScale, "G", 2);
      drawConsumption(
        electricityChartContainer,
        electricityResults,
        yConsumptionScale,
        "E",
        2
      );
    } else {
      if (consumptionGIsSuccess && consumptionGData?.results) {
        const gasResults = [
          ...consumptionGData.results,
        ].reverse() as IConsumptionData[];
        const gasSum = sum(gasResults, (d) => Number(d.consumption));
        const yConsumptionScale = scaleLinear()
          .domain([0, gasSum])
          .range([innerRadius, outerRadius - 20])
          .nice();

        gasChartContainer
          .attr("text-anchor", "middle")
          .selectAll()
          .data(yConsumptionScale.ticks(6).reverse())
          .join("g")
          .call((g) =>
            g
              .append("circle")
              .attr("fill", "none")
              .attr("stroke", colorScheme.consumptionRing)
              .attr("stroke-opacity", 0.4)
              .attr("r", yConsumptionScale)
          )
          .call((g) =>
            g
              .append("text")
              .attr("y", (d) => -yConsumptionScale(d))
              .attr("dy", "0.35em")
              .attr("stroke-linecap", "round")
              .attr("stroke", "#fff")
              .attr("stroke-width", 2)
              .attr("stroke-linejoin", "round")
              .attr("fill", colorScheme.textMonth)
              .attr("paint-order", "stroke")
              .text((x, i) => `${x.toFixed(0)}kWh`)
          );

        drawConsumption(
          gasChartContainer,
          gasResults,
          yConsumptionScale,
          "G",
          1
        );
      }

      if (consumptionEIsSuccess && consumptionEData?.results) {
        const electricityResults = [
          ...consumptionEData.results,
        ].reverse() as IConsumptionData[];
        const electricitySum = sum(electricityResults, (d) =>
          Number(d.consumption)
        );
        const yConsumptionScale = scaleLinear()
          .domain([0, electricitySum])
          .range([innerRadius, outerRadius - 20])
          .nice();

        electricityChartContainer
          .attr("text-anchor", "middle")
          .selectAll()
          .data(yConsumptionScale.ticks(6).reverse())
          .join("g")
          .call((g) =>
            g
              .append("circle")
              .attr("fill", "none")
              .attr("stroke", colorScheme.consumptionRing)
              .attr("stroke-opacity", 0.4)
              .attr("r", yConsumptionScale)
          )
          .call((g) =>
            g
              .append("text")
              .attr("y", (d) => -yConsumptionScale(d))
              .attr("dy", "0.35em")
              .attr("stroke-linecap", "round")
              .attr("stroke", "#fff")
              .attr("stroke-width", 2)
              .attr("font-size", 8)
              .attr("stroke-linejoin", "round")
              .attr("fill", colorScheme.textMonth)
              .attr("paint-order", "stroke")
              .text((x, i) => `${x.toFixed(0)}kWh`)
          );

        drawConsumption(
          electricityChartContainer,
          electricityResults,
          yConsumptionScale,
          "E",
          1
        );
      }
    }
  }, [
    consumptionGIsSuccess,
    consumptionEIsSuccess,
    consumptionEData?.results,
    consumptionGData?.results,
    colorScheme.textTitle,
    xScale,
    innerRadius,
    outerRadius,
    colorScheme.consumptionRing,
    colorScheme.textMonth,
    colorScheme.electricityIcon,
    colorScheme.gasIcon,
    value.gasConversionFactor,
    icons.electricity,
    icons.gas,
    colorScheme.electricityLine,
    colorScheme.gasLine,
    colorScheme.textDaily,
    colorScheme.textCumulative,
  ]);

  useEffect(() => {
    if (!chartRef.current || !isRateEDataSuccess || !rateEData?.[0]?.results)
      return;

    /*const flattenedRateData = */
    let data = rateEData?.reduce(
      (
        acc: {
          value_inc_vat: number;
          valid_from: string;
          valid_to: string;
          payment_method: null | string;
        }[],
        monthlyRateData
      ) => {
        return [...acc, ...monthlyRateData.results];
      },
      []
    ) as TariffResult[];

    data = data.filter((d) => d.payment_method !== "NON_DIRECT_DEBIT");

    if (
      data.at(0)?.valid_to === null ||
      new Date(data.at(0)?.valid_to ?? "").valueOf() >
        new Date(toDate).valueOf()
    ) {
      data.unshift({
        ...data.at(0),
        valid_from: new Date(toDate).toISOString(),
      } as TariffResult);
    }

    const miniChartWidth = 420;
    const miniChartHeight = 160;
    const margins = {
      top: 20,
      bottom: 20,
      left: 20,
      right: 20,
    };
    const minValue = min(data, (d) => d.value_inc_vat) ?? 0;
    const maxValue = max(data, (d) => d.value_inc_vat) ?? 0;
    const xScale = scaleTime()
      .domain([new Date(fromDate), new Date(toDate)])
      .range([0, miniChartWidth - margins.left - margins.right]);
    const yScale = scaleLinear()
      .domain([maxValue + 5, Math.min(0, minValue)])
      .range([0, miniChartHeight - margins.top - margins.bottom])
      .nice();

    const svg = select(chartRef.current);
    const electricityChartContainer = svg.select(".electricityTariffChart");
    electricityChartContainer.selectAll("*").remove();

    electricityChartContainer.attr("transform", "translate(-410 500)");

    const yAxis = electricityChartContainer
      .append("g")
      .attr(
        "transform",
        `translate(${miniChartWidth - margins.left - margins.right} 0)`
      )
      .call(
        axisLeft(yScale)
          .tickSize(miniChartWidth - margins.left - margins.right)
          .ticks(5)
          .tickFormat((d) => `${d}p`)
      );
    yAxis
      .selectAll(".tick text")
      .attr("font-size", 8)
      .attr("font-weight", "thin")
      .attr("fill", colorScheme.line);
    yAxis
      .selectAll("line")
      .attr("stroke-width", 1)
      .attr("stroke", colorScheme.consumptionRing);
    yAxis.selectAll("path").remove();

    const xAxisGenerator = axisBottom(xScale).ticks(12, "%b");
    const xAxis = electricityChartContainer
      .append("g")
      .attr(
        "transform",
        `translate(0 ${miniChartHeight - margins.top - margins.bottom})`
      )
      .call(xAxisGenerator);
    xAxis
      .selectAll(".tick text")
      .attr("font-size", 8)
      .attr("font-weight", "thin")
      .attr("fill", colorScheme.line)
      .attr("text-anchor", "middle")
      .attr("transform", "translate(14 0)");
    xAxis
      .selectAll("line")
      .attr("stroke-width", 1)
      .attr("stroke", colorScheme.consumptionRing);
    xAxis
      .selectAll("path")
      .attr("stroke-width", 1)
      .attr("stroke", colorScheme.consumptionRing);

    if (["SVT", "Fixed", "Tracker"].includes(categoryE)) {
      electricityChartContainer
        .append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", colorScheme.electricityLine)
        .attr("stroke-width", 1)
        .attr("stroke-linecap", "round")
        .attr("stroke-linejoin", "round")
        .attr(
          "d",
          line<TariffResult>()
            .curve(
              categoryE === "SVT" || categoryE === "Fixed"
                ? curveStepBefore
                : curveLinear
            )
            .x((d) => xScale(new Date(d.valid_from)))
            .y((d) => yScale(d.value_inc_vat))
        );
    } else {
      electricityChartContainer
        .selectAll("circle")
        .data(data)
        .join("circle")
        .attr("fill", colorScheme.electricityLine)
        .attr("stroke", "none")
        .attr("r", 0.5)
        .attr("cx", (d) => xScale(new Date(d.valid_from)))
        .attr("cy", (d) => yScale(d.value_inc_vat));
    }
  }, [
    rateEData,
    isRateEDataSuccess,
    colorScheme.line,
    colorScheme.consumptionRing,
    colorScheme.electricityLine,
    categoryE,
  ]);

  useEffect(() => {
    if (!chartRef.current || !isRateGDataSuccess || !rateGData?.[0]?.results)
      return;

    let data = rateGData?.reduce(
      (
        acc: {
          value_inc_vat: number;
          valid_from: string;
          valid_to: string;
          payment_method: null | string;
        }[],
        monthlyRateData
      ) => {
        return [...acc, ...monthlyRateData.results];
      },
      []
    ) as TariffResult[];

    data = data.filter((d) => d.payment_method !== "NON_DIRECT_DEBIT");

    if (
      data.at(0)?.valid_to === null ||
      new Date(data.at(0)?.valid_to ?? "").valueOf() >
        new Date(toDate).valueOf()
    ) {
      data.unshift({
        ...data.at(0),
        valid_from: new Date(toDate).toISOString(),
      } as TariffResult);
    }

    const miniChartWidth = 420;
    const miniChartHeight = 160;
    const margins = {
      top: 20,
      bottom: 20,
      left: 20,
      right: 20,
    };
    const minValue = min(data, (d) => d.value_inc_vat) ?? 0;
    const maxValue = max(data, (d) => d.value_inc_vat) ?? 0;

    const xScale = scaleTime()
      .domain([new Date(fromDate), new Date(toDate)])
      .range([0, miniChartWidth - margins.left - margins.right]);
    const yScale = scaleLinear()
      .domain([maxValue + 5, Math.min(0, minValue)])
      .range([0, miniChartHeight - margins.top - margins.bottom])
      .nice();

    const svg = select(chartRef.current);
    const gasChartContainer = svg.select(".gasTariffChart");
    gasChartContainer.selectAll("*").remove();

    gasChartContainer.attr("transform", "translate(40 500)");

    const yAxis = gasChartContainer
      .append("g")
      .attr(
        "transform",
        `translate(${miniChartWidth - margins.left - margins.right} 0)`
      )
      .call(
        axisLeft(yScale)
          .tickSize(miniChartWidth - margins.left - margins.right)
          .ticks(5)
          .tickFormat((d) => `${d}p`)
      );
    yAxis
      .selectAll(".tick text")
      .attr("font-size", 8)
      .attr("font-weight", "thin")
      .attr("fill", colorScheme.line);
    yAxis
      .selectAll("line")
      .attr("stroke-width", 1)
      .attr("stroke", colorScheme.consumptionRing);
    yAxis.selectAll("path").remove();

    const xAxisGenerator = axisBottom(xScale).ticks(12, "%b");
    const xAxis = gasChartContainer
      .append("g")
      .attr(
        "transform",
        `translate(0 ${miniChartHeight - margins.top - margins.bottom})`
      )
      .call(xAxisGenerator);
    xAxis
      .selectAll(".tick text")
      .attr("font-size", 8)
      .attr("font-weight", "thin")
      .attr("fill", colorScheme.line)
      .attr("text-anchor", "middle")
      .attr("transform", "translate(14 0)");
    xAxis
      .selectAll("line")
      .attr("stroke-width", 1)
      .attr("stroke", colorScheme.consumptionRing);
    xAxis
      .selectAll("path")
      .attr("stroke-width", 1)
      .attr("stroke", colorScheme.consumptionRing);

    gasChartContainer
      .append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", colorScheme.gasLine)
      .attr("stroke-width", 1)
      .attr("stroke-linecap", "round")
      .attr("stroke-linejoin", "round")
      .attr(
        "d",
        line<TariffResult>()
          .curve(
            categoryG === "SVT" || categoryG === "Fixed"
              ? curveStepBefore
              : curveLinear
          )
          .x((d) => xScale(new Date(d.valid_from)))
          .y((d) => yScale(d.value_inc_vat))
      );
  }, [
    rateGData,
    isRateGDataSuccess,
    colorScheme.line,
    colorScheme.consumptionRing,
    colorScheme.electricityLine,
    colorScheme.gasLine,
    categoryG,
  ]);

  const canShare = "share" in navigator;

  const handleShare = async () => {
    if (!chartRef.current) return;

    const resolution = 2;
    const xml = new XMLSerializer().serializeToString(chartRef.current);
    const svgBlob = new Blob([xml], {
      type: "image/svg+xml;charset=utf-8",
    });
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();
    img.addEventListener("load", () => {
      const bbox = chartRef.current!.getBBox();
      const scale = window.devicePixelRatio;
      const canvas = document.createElement("canvas");
      canvas.width = width * resolution;
      canvas.height = height * resolution;
      const context = canvas.getContext("2d")!;
      context.drawImage(img, 0, 0, width * resolution, height * resolution);

      canvas.toBlob(
        async (blob) => {
          let data = {};
          if (blob) {
            data = {
              files: [
                new File([blob], "octoprice.jpg", {
                  type: blob.type,
                }),
              ],
              title: `My Octopast Year`,
              text: `Visualize my energy footprint in 2023`,
            };
            try {
              await navigator.share(data);
            } catch (err) {
              if (err instanceof Error) {
                if (!err.message.includes("cancellation of share"))
                  console.log(err.message);
              }
            }
          }
        },
        "image/jpeg",
        0.8
      );
      URL.revokeObjectURL(url);
    });
    img.src = url;
  };

  const handleDownload = async () => {
    if (!chartRef.current) return;

    const resolution = 2;
    const xml = new XMLSerializer().serializeToString(chartRef.current);
    const svgBlob = new Blob([xml], {
      type: "image/svg+xml;charset=utf-8",
    });
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();
    img.addEventListener("load", () => {
      const bbox = chartRef.current!.getBBox();
      const scale = window.devicePixelRatio;
      const canvas = document.createElement("canvas");
      canvas.width = width * resolution;
      canvas.height = height * resolution;
      const context = canvas.getContext("2d")!;
      context.drawImage(img, 0, 0, width * resolution, height * resolution);

      URL.revokeObjectURL(url);

      // trigger a synthetic download operation with a temporary link
      const a = document.createElement("a");
      a.download = "myEnergyProfile.jpg";
      document.body.appendChild(a);
      a.href = canvas.toDataURL("image/jpeg", 0.8);
      a.click();
      a.remove();
    });
    img.src = url;
  };

  return (
    <>
      <div className="flex gap-2 items-center mb-4 flex-col-reverse md:flex-col lg:flex-row">
        <div className="flex-grow">
          Your energy consumption visualization over {chartYear} in relation to
          weather.
          <Remark>
            Kindly note that this page is still in beta version and may not be
            able to cater to all Octopus customer accounts. Should you encounter
            any issues while using this page, please contact Edward at{" "}
            <a href="mailto:edward.chung.dev@gmail.com" className="underline">
              edward.chung.dev@gmail.com
            </a>
            . Thanks a lot!
          </Remark>
        </div>
      </div>
      <div className="flex flex-row gap-2 mb-4 flex-wrap [&>*]:flex-1">
        {value.currentEContract && value.currentETariff && (
          <div>
            <h2 className="font-display text-accentPink-500 text-4xl flex items-center">
              <BsLightningChargeFill className="w-8 h-8 fill-accentPink-900 inline-block mr-2" />
              Electricity
            </h2>
            <TariffDetails
              valid_from={value.currentEContract.valid_from}
              tariff_code={value.currentETariff}
              type="E"
            />
          </div>
        )}
        {value.currentGContract && value.currentGTariff && (
          <div>
            <h2 className="font-display text-accentPink-500 text-4xl flex items-center">
              <AiFillFire className="w-8 h-8 fill-accentPink-900 inline-block mr-2" />
              Gas
            </h2>
            <TariffDetails
              valid_from={value.currentGContract.valid_from}
              tariff_code={value.currentGTariff}
              type="G"
            />
          </div>
        )}
      </div>
      <div className="flex w-full aspect-[210/297] flex-col">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          ref={chartRef}
          width={width}
          height={height}
          viewBox="-450 -535 900 1280"
          className="w-full h-auto"
        >
          <filter id="shadow">
            <feDropShadow
              dx="0.5"
              dy="0.5"
              stdDeviation="2"
              floodColor="#15748c"
              floodOpacity="0.8"
            />
          </filter>
          <colorScheme.Gradients />
          <rect
            width="100%"
            height="100%"
            transform="translate(-450,-535)"
            fill="white"
          />
          <g className="container">
            <g className="nightRegion" />
            <g className="temperature" />
            <g className="xAxis" />
            <g className="weatherSymbol" />
            <g className="dailyChart" />
            <g className="gasChart" />
            <g className="electricityChart" />
            <g className="gasTariffChart" />
            <g className="electricityTariffChart" />
            <g className="map" />
            <g className="heading" />
            <g className="info" />
            <g className="legend" />
          </g>
        </svg>
        <button
          className="mt-4 self-center flex justify-center items-center gap-2 border border-accentBlue-500 p-2 px-6 text-accentBlue-500 rounded-xl hover:bg-accentBlue-800 hover:text-white"
          onClick={canShare ? handleShare : handleDownload}
        >
          {canShare ? (
            <>
              <RxShare2 /> Share
            </>
          ) : (
            <>
              <PiDownloadSimple /> Download
            </>
          )}
        </button>
      </div>
    </>
  );
};

export default DataArtContainer;
<stop offset="95%" stopColor="#842f56" />;
