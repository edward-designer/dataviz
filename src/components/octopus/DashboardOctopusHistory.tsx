"use client";

import { UserContext } from "@/context/user";
import { IUserApiResult } from "@/data/source";
import { dateDiff, getTariffName, toTitleCase } from "@/utils/helpers";
import { useQuery } from "@tanstack/react-query";
import { useContext, useState } from "react";

import { PiSunDimFill } from "react-icons/pi";
import { SiOctopusdeploy } from "react-icons/si";
import { HiMiniHome } from "react-icons/hi2";
import { MdOutlineExpandCircleDown } from "react-icons/md";
import Loading from "../../app/loading";
import { BsLightningChargeFill } from "react-icons/bs";
import { AiFillFire } from "react-icons/ai";

const DashboardOctopusHistory = () => {
  const { value } = useContext(UserContext);
  const [tab, setTab] = useState(0);

  const queryFn = async () => {
    try {
      const response = await fetch(
        `https://api.octopus.energy/v1/accounts/${value.accountNumber}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${btoa(value.apiKey)}`,
          },
        }
      );
      if (!response.ok) throw new Error("Sorry the request was unsuccessful");
      return response.json();
    } catch (err: unknown) {
      if (err instanceof Error)
        throw new Error(
          `Sorry, we have an error with your info: ${err.message}. Please check if your info are correct.`
        );
      throw new Error("Sorry, the request was unsuccessful");
    }
  };

  const { data, isSuccess, isLoading, error, isError } =
    useQuery<IUserApiResult>({
      queryKey: ["user", value.accountNumber, value.apiKey],
      queryFn,
    });

  const properties = data?.properties.sort(
    (a, b) => Date.parse(b.moved_in_at) - Date.parse(a.moved_in_at)
  );

  return isLoading ? (
    <Loading />
  ) : (
    <div className="flex flex-col gap-6 flex-1 border border-accentPink-950 rounded-xl p-4">
      <h2 className="text-accentPink-600 font-display text-4xl flex items-center gap-2">
        <SiOctopusdeploy className="w-8 h-8" />
        Your Octopus History
      </h2>
      <div className="font-normal">
        {dateDiff(new Date(properties?.at(-1)?.moved_in_at ?? ""), new Date())}
      </div>
      {properties &&
        properties.map((property, i) => (
          <div key={`${property.postcode}-${i}`}>
            <div className="flex flex-row justify-between items-stretch gap-4 ">
              <div className="rounded-full h-14 w-14 bg-accentBlue-900 flex items-center justify-center">
                <HiMiniHome className="h-6 w-6" />
              </div>
              <div className="flex-1 flex flex-col">
                <div className="text-xs">
                  {new Date(property.moved_in_at).toLocaleDateString()}
                  {" - "}
                  {property?.moved_out_at &&
                    `${new Date(property.moved_out_at).toLocaleDateString()}`}
                </div>
                <div className="text-2xl text-accentBlue-600">
                  {`${
                    property.town
                      ? toTitleCase(property.town)
                      : toTitleCase(property.county)
                  } (${property.postcode})`}
                </div>
              </div>
              {properties.length > 1 && (
                <div
                  className={`aspect-square w-10 flex items-center justify-center ${
                    tab === i ? "rotate-180" : ""
                  }`}
                >
                  <button
                    onClick={() => setTab((tab) => (tab === i ? 100 : i))}
                  >
                    <MdOutlineExpandCircleDown className="h-8 w-8" />
                  </button>
                </div>
              )}
            </div>
            {tab === i && (
              <>
                {property.electricity_meter_points.filter(
                  (meter) => meter.is_export
                )?.[0]?.agreements.length > 0 && (
                  <div className="border-l-2 border-l-accentBlue-700 ml-7 py-4 flex flex-col gap-4">
                    <div className="text-accentPink-700 text-2xl relative -left-4">
                      <PiSunDimFill className="w-8 h-8 fill-accentPink-700 inline-block mr-2" />
                      Electricity (export)
                    </div>
                    {property.electricity_meter_points
                      .filter((meter) => meter.is_export)?.[0]
                      .agreements.filter(
                        (agreement) =>
                          agreement.valid_from !== agreement.valid_to
                      )
                      .map((agreement, i) => (
                        <div
                          key={i}
                          className={`flex flex-row items-center gap-2 ${
                            property.electricity_meter_points
                              .filter((meter) => meter.is_export)?.[0]
                              .agreements.filter(
                                (agreement) =>
                                  agreement.valid_from !== agreement.valid_to
                              ).length -
                              1 ===
                            i
                              ? ""
                              : "opacity-60"
                          }`}
                        >
                          <span className="w-6 border-t border-t-accentBlue-700 border-dotted"></span>
                          <span className="text-xs w-20 shrink-0">
                            {new Date(
                              agreement.valid_from
                            ).toLocaleDateString()}
                            {" - "}
                            {agreement?.valid_to &&
                              `${new Date(
                                agreement?.valid_to
                              ).toLocaleDateString()}`}
                          </span>
                          <span className="text-2xl overflow-hidden whitespace-nowrap">
                            {`${getTariffName(agreement.tariff_code)}`}
                            <span className="text-xs pl-2">
                              ({agreement.tariff_code})
                            </span>
                          </span>
                        </div>
                      ))}
                  </div>
                )}
                {property.electricity_meter_points.filter(
                  (meter) => !meter.is_export
                )?.[0]?.agreements.length > 0 && (
                  <div className="border-l-2 border-l-accentBlue-700 ml-7 py-4 flex flex-col gap-4">
                    <div className="text-accentPink-700 text-2xl relative -left-4">
                      <BsLightningChargeFill className="w-8 h-8 fill-accentPink-700 inline-block mr-2" />
                      Electricity
                    </div>
                    {property.electricity_meter_points
                      .filter((meter) => !meter.is_export)?.[0]
                      .agreements.filter(
                        (agreement) =>
                          agreement.valid_from !== agreement.valid_to
                      )
                      .map((agreement, i) => (
                        <div
                          key={i}
                          className={`flex flex-row items-center gap-2 ${
                            property.electricity_meter_points
                              .filter((meter) => !meter.is_export)?.[0]
                              .agreements.filter(
                                (agreement) =>
                                  agreement.valid_from !== agreement.valid_to
                              ).length -
                              1 ===
                            i
                              ? ""
                              : "opacity-60"
                          }`}
                        >
                          <span className="w-6 border-t border-t-accentBlue-700 border-dotted"></span>
                          <span className="text-xs w-20 shrink-0">
                            {new Date(
                              agreement.valid_from
                            ).toLocaleDateString()}
                            {" - "}
                            {agreement?.valid_to &&
                              `${new Date(
                                agreement?.valid_to
                              ).toLocaleDateString()}`}
                          </span>
                          <span className="text-2xl overflow-hidden whitespace-nowrap">
                            {`${getTariffName(agreement.tariff_code)}`}
                            <span className="text-xs pl-2">
                              ({agreement.tariff_code})
                            </span>
                          </span>
                        </div>
                      ))}
                  </div>
                )}
                {property?.gas_meter_points?.[0]?.agreements.length > 0 && (
                  <div className="border-l-2 border-l-accentBlue-700 ml-7 py-4 flex flex-col gap-4">
                    <div className="text-accentPink-700 text-2xl relative -left-4">
                      <AiFillFire className="w-8 h-8 fill-accentPink-700 inline-block mr-2" />
                      Gas
                    </div>
                    {property.gas_meter_points[0].agreements
                      .filter(
                        (agreement) =>
                          agreement.valid_from !== agreement.valid_to
                      )
                      .map((agreement, i) => (
                        <div
                          key={i}
                          className={`flex flex-row items-center gap-2 ${
                            property.gas_meter_points[0].agreements.filter(
                              (agreement) =>
                                agreement.valid_from !== agreement.valid_to
                            ).length -
                              1 ===
                            i
                              ? ""
                              : "opacity-60"
                          }`}
                        >
                          <span className="w-6 border-t border-t-accentBlue-700 border-dotted"></span>
                          <span className="text-xs w-20 shrink-0">
                            {new Date(
                              agreement.valid_from
                            ).toLocaleDateString()}
                            {" - "}
                            {agreement?.valid_to &&
                              `${new Date(
                                agreement?.valid_to
                              ).toLocaleDateString()}`}
                          </span>
                          <span className="text-2xl overflow-hidden whitespace-nowrap">
                            {`${getTariffName(agreement.tariff_code)}`}
                            <span className="text-xs pl-2">
                              ({agreement.tariff_code})
                            </span>
                          </span>
                        </div>
                      ))}
                  </div>
                )}
              </>
            )}
          </div>
        ))}
    </div>
  );
};

export default DashboardOctopusHistory;
