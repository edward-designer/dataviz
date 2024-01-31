"use client";

import {
  ChangeEvent,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import Link from "next/link";
import Image from "next/image";
import { UserContext } from "@/context/user";
import { ImGift } from "react-icons/im";
import compareGif from "../../../public/images/compare.gif";
import fileStructure from "../../../public/images/files.png";
import Remark from "./Remark";
import * as d3 from "d3";
import {
  ETARIFFS,
  GTARIFFS,
  IConsumptionData,
  ITariffToCompare,
  TariffCategory,
  TariffType,
} from "@/data/source";

import SwitchTariffComparisionCard from "./SwitchTariffComparisionCard";
import { Button } from "../ui/button";
import { AnimatePresence } from "framer-motion";
import { BsLightningChargeFill } from "react-icons/bs";
import { AiFillFire } from "react-icons/ai";
import { evenRound } from "@/utils/helpers";
import { FaCirclePlus } from "react-icons/fa6";
import { LuPiggyBank } from "react-icons/lu";

import Lottie from "lottie-react";
import Saving from "../../../public/lottie/saving.json";

export type ErrorType = Record<string, string>;

export interface IParsedEData {
  "timestamp (UTC)": string;
  "energyConsumption (kWh)": number;
}

export interface IParsedGData {
  "timestamp (UTC)": string;
  "energyConsumption (m3)": number;
}

export interface ISwitchConsumptionData {
  results: IConsumptionData[];
}

interface IFiles {
  E: File | null;
  G: File | null;
}

const SwitchTariffs = () => {
  const { value, setValue } = useContext(UserContext);
  const [file, setFile] = useState<IFiles>({ E: null, G: null });
  const [uploadedEData, setUploadedEData] = useState<ISwitchConsumptionData>({
    results: [],
  });
  const [uploadedGData, setUploadedGData] = useState<ISwitchConsumptionData>({
    results: [],
  });
  const [type, setType] = useState<TariffType>("EG");
  const [showResults, setShowResults] = useState(false);

  const [tariffsEToCompare, setTariffsEToCompare] = useState(
    ETARIFFS.slice(0, 3)
  );
  const [tariffsGToCompare, setTariffsGToCompare] = useState(GTARIFFS);

  const setECost = useCallback(
    (category: TariffCategory, cost: number) =>
      setTariffsEToCompare((value) => [
        ...value.map((tariffSet) => {
          if (tariffSet.category === category) {
            return { ...tariffSet, cost };
          }
          return { ...tariffSet };
        }),
      ]),
    []
  );
  const setGCost = useCallback(
    (category: TariffCategory, cost: number) =>
      setTariffsGToCompare((value) => [
        ...value.map((tariffSet) => {
          if (tariffSet.category === category) {
            return { ...tariffSet, cost };
          }
          return { ...tariffSet };
        }),
      ]),
    []
  );
  const SVTECost =
    tariffsEToCompare.find((tariffSet) => tariffSet.category === "SVT")?.cost ??
    null;
  const SVTGCost =
    tariffsGToCompare.find((tariffSet) => tariffSet.category === "SVT")?.cost ??
    null;
  const reOrderedTariffsEToCompare = [...tariffsEToCompare].sort(
    (a, b) => (a.cost ?? Infinity) - (b.cost ?? Infinity)
  );
  const reOrderedTariffsGToCompare = [...tariffsGToCompare].sort(
    (a, b) => (a.cost ?? Infinity) - (b.cost ?? Infinity)
  );
  const CheapECost = [...tariffsEToCompare]
    .sort((a, b) => (a.cost ?? Infinity) - (b.cost ?? Infinity))
    ?.at(0)?.cost;
  const CheapGCost = [...tariffsGToCompare]
    .sort((a, b) => (a.cost ?? Infinity) - (b.cost ?? Infinity))
    ?.at(0)?.cost;
  const DurationE = Math.floor(
    365 /
      ((Date.parse(
        uploadedEData.results.at(0)?.interval_start ?? new Date().toISOString()
      ) -
        Date.parse(
          uploadedEData.results.at(-1)?.interval_start ??
            new Date().toISOString()
        )) /
        (1000 * 60 * 60 * 24))
  );
  const DurationG = Math.floor(
    365 /
      ((Date.parse(
        uploadedGData.results.at(0)?.interval_start ?? new Date().toISOString()
      ) -
        Date.parse(
          uploadedGData.results.at(-1)?.interval_start ??
            new Date().toISOString()
        )) /
        (1000 * 60 * 60 * 24))
  );

  useEffect(() => {
    if (!file.E) return;
    const fileReader = new FileReader();
    fileReader.onload = async (event: ProgressEvent<FileReader>) => {
      const csvOutput = event.target?.result;
      if (typeof csvOutput === "string") {
        const results = d3.csvParse(csvOutput, (data) => {
          const interval_from_time = new Date(data["timestamp (UTC)"]);
          interval_from_time.setMinutes(interval_from_time.getMinutes() - 30);
          return {
            consumption: Number(data["energyConsumption (kWh)"]),
            interval_start: interval_from_time.toISOString(),
            interval_end: new Date(data["timestamp (UTC)"]).toISOString(),
          };
        });
        results.reverse();
        setUploadedEData({ results });
      }
    };
    fileReader.readAsText(file.E);
  }, [file.E]);

  useEffect(() => {
    if (!file.G) return;
    const fileReader = new FileReader();
    fileReader.onload = async (event: ProgressEvent<FileReader>) => {
      const csvOutput = event.target?.result;
      if (typeof csvOutput === "string") {
        const results = d3.csvParse(csvOutput, (data) => {
          const interval_from_time = new Date(data["timestamp (UTC)"]);
          interval_from_time.setMinutes(interval_from_time.getMinutes() - 30);
          return {
            consumption: data["energyConsumption (kWh)"]
              ? Number(data["energyConsumption (kWh)"])
              : Number(data["energyConsumption (m3)"]),
            interval_start: interval_from_time.toISOString(),
            interval_end: new Date(data["timestamp (UTC)"]).toISOString(),
          };
        });
        results.reverse();
        setUploadedGData({ results });
      }
    };
    fileReader.readAsText(file.G);
  }, [file.G]);

  return (
    <div className="flex flex-col font-extralight text-lg">
      <h1 className="text-accentBlue-400 font-display text-4xl lg:text-6xl font-medium ">
        Save £50+ with Octopus
      </h1>
      <h2 className="text-accentBlue-400 font-display font-medium text-lg lg:text-2xl mb-8">
        - plus extra savings based on your ACTUAL consumption data
      </h2>

      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div className="w-full">
          <p>
            By simply switching to Octopus Energy using the link below, you get
            an instant saving of £50! Don&apos;t worry, there is NO penalty/exit
            fee if you switch out afterwards.
          </p>
          <div className="bg-theme-900 mt-8 p-2 px-4 leading-6 text-center rounded-t-3xl">
            Get an extra{" "}
            <ImGift className="inline-block -translate-y-1 w-6 h-6 px-1 fill-accentBlue-500" />
            <strong>£50 bill credit</strong> instantly by{" "}
            <a
              href="https://share.octopus.energy/sky-heron-134"
              target="_blank"
              className="inline-block underline text-accentPink-500 hover:no-underline"
            >
              signing up thru our exclusive Octopus link
            </a>{" "}
            !
          </div>
          <a
            href="https://share.octopus.energy/sky-heron-134"
            target="_blank"
            className="block bg-theme-950 hover:bg-theme-900"
          >
            <div className="flex flex-col p-2 pb-10 md:pt-6 md:flex-row items-center">
              <div className="w-[100px] md:min-w-[200px] flex items-center justify-center">
                <Lottie
                  animationData={Saving}
                  aria-hidden={true}
                  loop={true}
                  className="w-[150px] h-[150px]"
                />
              </div>
              <div>
                <h3 className="text-4xl mb-2 bg-gradient-to-r from-accentPink-500 via-amber-300 to-accentBlue-500 inline-block text-transparent bg-clip-text">
                  Get <strong>£50</strong> free credit by signing up!
                </h3>
                <p>
                  Just switch to Octopus through our exclusive link to get a £50
                  on your account! Swap today for 100% renewable energy and
                  award winning customer service!
                </p>
              </div>
            </div>
          </a>
          {!showResults ? (
            <div className="p-8 border border-accentPink-950 rounded-b-3xl relative">
              <FaCirclePlus className="text-accentPink-800 w-14 h-14 absolute top-0 -translate-x-1/2 -translate-y-1/2 left-1/2 bg-theme-950 rounded-full" />
              <h3 className="text-4xl mb-2 bg-gradient-to-r from-accentPink-500 via-amber-300 to-accentBlue-500 inline-block text-transparent bg-clip-text">
                Save an extra <strong>£200+</strong> annually if you:
              </h3>
              <ol className="list-decimal ml-5 flex flex-col mt-4">
                <li>
                  have a <span className="text-3xl">Smart Meter</span>
                  <Remark>
                    No worries if you don&apos;t. You can request one for FREE
                    when signing up.
                  </Remark>
                </li>
                <li>
                  <div className="inline-flex items-start lg:items-center gap-2 flex-col lg:flex-row ">
                    <div>
                      choose Octopus Smart tariffs (e.g.{" "}
                      <Link
                        href="/agile"
                        target="_blank"
                        className="text-3xl text-accentPink-500 hover:text-accentBlue-500"
                      >
                        Agile
                      </Link>{" "}
                      or{" "}
                      <Link
                        href="/tracker"
                        target="_blank"
                        className="text-3xl text-accentPink-500 hover:text-accentBlue-500"
                      >
                        Tracker
                      </Link>
                      )
                    </div>
                  </div>
                </li>
              </ol>
              <hr className="my-6" />
              <p>
                * If you currently have a smart meter, we can calculate your
                actual saving based on your consumption data! Please follow the
                steps (takes about 5 minutes):
              </p>
              <ol className="list-decimal ml-5 flex flex-col mt-4 gap-5">
                <li>
                  register and download your consumption data via a 3rd-party app{" "}
                  <a
                    className="text-3xl text-accentPink-500 hover:text-accentBlue-500"
                    href="https://www.n3rgy.com/"
                    target="_blank"
                  >
                    <span className="text-3xl">n3rgy</span>
                  </a>
                  <Remark>
                    <a
                      href="https://kb.loop.homes/how-to-download-your-data"
                      target="_blank"
                      className="underline hover:no-underline text-accentPink-500 hover:text-accentBlue-500"
                    >
                      Click here to read a detailed description of how to
                      download your smart meter data
                    </a>
                    . Since data can only be downloaded in 90-days periods, it
                    is recommended to download data of the latest period for
                    more accurate saving estimations.
                  </Remark>
                </li>
                <li>
                  enter/check your postcode:{" "}
                  <input
                    type="text"
                    name="postcode"
                    value={value.postcode}
                    onChange={(event: ChangeEvent<HTMLInputElement>) => {
                      setValue({ ...value, postcode: event.target.value });
                    }}
                    className="w-[7em] px-3 ml-1 text-accentBlue-700 font-bold rounded-full"
                  />
                </li>
                <li>
                  select the energy type:{" "}
                  <span className="text-accentBlue-700 font-bold">
                    <select
                      onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                        setType(event.target.value as Exclude<TariffType, "EG">)
                      }
                      className="py-1 px-3 rounded-full"
                      name="type"
                    >
                      <option value="EG">Electricity + Gas</option>
                      <option value="E">Electricity</option>
                      <option value="G">Gas</option>
                    </select>
                  </span>
                </li>
                {type !== "G" && (
                  <li>
                    upload your Electricity consumption data
                    <Remark>
                      select the .csv file in the{" "}
                      <span className="font-bold text-accentPink-500">
                        data &gt; electricity &gt; consumption &gt; 1
                      </span>{" "}
                      <Image
                        src={fileStructure}
                        width={300}
                        height={200}
                        alt="file structure of downloaded electricity data"
                      />
                    </Remark>
                    :{" "}
                    <input
                      type="file"
                      accept=".csv"
                      name="consumptionE"
                      onChange={(event: ChangeEvent<HTMLInputElement>) => {
                        if (!event.target.files?.[0]) return;
                        setFile((file) => ({
                          ...file,
                          E: event.target.files?.[0] ?? null,
                        }));
                      }}
                      className="px-2 rounded-full max-w-full overflow-hidden"
                    />
                  </li>
                )}
                {type !== "E" && (
                  <li>
                    upload your Gas consumption data
                    <Remark>
                      select the .csv file in the{" "}
                      <span className="font-bold text-accentPink-500">
                        data &gt; gas &gt; consumption &gt; 1
                      </span>{" "}
                      <Image
                        src={fileStructure}
                        width={300}
                        height={200}
                        alt="file structure of downloaded gas data"
                      />
                    </Remark>
                    :{" "}
                    <input
                      type="file"
                      accept=".csv"
                      name="consumptionG"
                      onChange={(event: ChangeEvent<HTMLInputElement>) => {
                        if (!event.target.files?.[0]) return;
                        setFile((file) => ({
                          ...file,
                          G: event.target.files?.[0] ?? null,
                        }));
                      }}
                      className="px-2 rounded-full max-w-full overflow-hidden"
                    />
                  </li>
                )}
              </ol>
              {!(
                uploadedEData.results.length === 0 &&
                uploadedGData.results.length === 0
              ) && (
                <Button
                  className="relative px-10 mt-8 rounded-full bg-accentPink-700 text-xl font-light text-white hover:bg-accentPink-500 active:bg-accentPink-950 active:left-1 active:top-1 active:text-accentPink-800"
                  onClick={() => {
                    if (
                      uploadedEData.results.length === 0 &&
                      uploadedGData.results.length === 0
                    )
                      return;

                    setShowResults(true);
                  }}
                >
                  Check Results
                </Button>
              )}
            </div>
          ) : (
            <>
              {uploadedEData.results.length > 0 && (
                <div className="mb-10">
                  <h2 className="font-display text-accentPink-500 text-4xl flex items-center mt-8 mb-2">
                    <BsLightningChargeFill className="w-8 h-8 fill-accentPink-900 inline-block mr-2" />
                    Electricity
                    <span className="text-xl pl-4 self-end">
                      {" "}
                      (
                      {new Date(
                        uploadedEData.results.at(-1)?.interval_start ?? ""
                      ).toLocaleDateString()}{" "}
                      -{" "}
                      {new Date(
                        uploadedEData.results.at(0)?.interval_start ?? ""
                      ).toLocaleDateString()}
                      )
                    </span>
                  </h2>
                  <div className="p-2 bg-theme-950 border-t border-b border-dotted border-accentBlue-950 mb-4 flex items-center">
                    <LuPiggyBank className="text-accentBlue-500 w-8 h-8 mr-4" />{" "}
                    Estimated annual saving of up to £
                    <strong className="text-2xl">
                      {CheapECost &&
                        SVTECost &&
                        evenRound((SVTECost - CheapECost) * DurationE, 0)}
                    </strong>
                  </div>
                  <div className="flex gap-4 flex-col lg:grid lg:grid-cols-3">
                    <AnimatePresence>
                      {reOrderedTariffsEToCompare.map(
                        ({ tariff, category }, ind) => {
                          return (
                            <SwitchTariffComparisionCard
                              key={category}
                              tariff={tariff}
                              category={category}
                              compareTo={SVTECost}
                              setCost={setECost}
                              rank={ind + 1}
                              consumptionData={
                                category === "Agile"
                                  ? uploadedEData
                                  : groupByDay(uploadedEData)
                              }
                              type="E"
                              fromDate={
                                uploadedEData.results.at(-1)?.interval_start ??
                                ""
                              }
                              toDate={
                                uploadedEData.results.at(0)?.interval_end ?? ""
                              }
                            />
                          );
                        }
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              )}
              {uploadedGData.results.length > 0 && (
                <div className="mb-10">
                  <h2 className="font-display text-accentPink-500 text-4xl flex items-center mt-8 mb-2">
                    <AiFillFire className="w-8 h-8 fill-accentPink-900 inline-block mr-2" />
                    Gas
                    <span className="text-xl pl-4 self-end">
                      {" "}
                      (
                      {new Date(
                        uploadedGData.results.at(-1)?.interval_start ?? ""
                      ).toLocaleDateString()}{" "}
                      -{" "}
                      {new Date(
                        uploadedGData.results.at(0)?.interval_start ?? ""
                      ).toLocaleDateString()}
                      )
                    </span>
                  </h2>
                  <div className="p-2 bg-theme-950 border-t border-b border-dotted border-accentBlue-950 mb-4 flex items-center">
                    <LuPiggyBank className="text-accentBlue-500 w-8 h-8 mr-4" />{" "}
                    Estimated annual saving of up to £
                    <strong className="text-2xl">
                      {CheapGCost &&
                        SVTGCost &&
                        evenRound((SVTGCost - CheapGCost) * DurationG, 0)}
                    </strong>
                  </div>
                  <div className="flex gap-4 flex-col lg:grid lg:grid-cols-3">
                    <AnimatePresence>
                      {reOrderedTariffsGToCompare.map(
                        ({ tariff, category }, ind) => {
                          return (
                            <SwitchTariffComparisionCard
                              key={category}
                              tariff={tariff}
                              category={category}
                              compareTo={SVTGCost}
                              setCost={setGCost}
                              rank={ind + 1}
                              consumptionData={groupByDay(uploadedGData)}
                              type="G"
                              fromDate={
                                uploadedGData.results.at(-1)?.interval_start ??
                                ""
                              }
                              toDate={
                                uploadedGData.results.at(0)?.interval_end ?? ""
                              }
                            />
                          );
                        }
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              )}

              <Button
                className="relative px-10 mt-8 rounded-full bg-accentPink-700 text-xl font-light text-white hover:bg-accentPink-500 active:bg-accentPink-950 active:left-1 active:top-1 active:text-accentPink-800"
                onClick={() => {
                  setShowResults(false);
                  setUploadedEData({
                    results: [],
                  });
                  setUploadedGData({
                    results: [],
                  });
                }}
              >
                Start Over
              </Button>
            </>
          )}
        </div>
        {!showResults && (
          <div className="flex justify-center mt-8 md:mt-0">
            <Image
              src={compareGif}
              className="w-[300px] h-auto border border-accentBlue-500 "
              alt="demo showing how the savings calculation work"
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCANrAf0DASIAAhEBAxEB/8QAGAABAQEBAQAAAAAAAAAAAAAAAAEEAgX/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFwEBAQEBAAAAAAAAAAAAAAAAAAECA//EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/APFAdmwAAAAAAAAAAAAAAAFAEAAAAFRUAAAAAAFAAVFQABAAFAAAQUAAAAAFAAAQUAAAAAAAAAGcB0aAAAAAAAAAAAAAAABFAAAAAAVFQAAAAAAUABUERQAAAURQAEFAAAAABQEAAFAAAAAAAAABnAdGgAAAAAAAAAAAAAAARRFAAAAAABRFQAAAAUAABEUAAABUVAABRFAAAABQEAAFEUAAAAAAAAGcB0aAAAAAAAAAAAAABAABUAUQBQAAEBUAUAAABUUABEFRQAAAAUBAVAFAAAAVFQAAAAUQBRFAAAABnAdGgAAAAAAAAAAAAAQAAAAAAVFAAQAAURQAAFQBQEQABQAAEFEUAABUUAABUEFAAAAAAAAVAFEAZwHRoAAABRAFQAAAFQEURQAAAAAAAAFQQUAAAFEUAAQVBBQAURQAEBUAUAAAFAAAQAAURQAAAAAAAAZwHRoAAAAAAAAAEAAAAUQBRAFAAAAAQFQBQAAAUAQAQURQAAFRUAABUAUABUEFAAAAAAVAFAAAAABmAdGgAAAAAQVAFEAUAAAAAAAAAFEEFAAAAVAFAAAEURUAAFEUABBQAAAFRQAEAAFEUAAAAAAFEAUQBnAdFAAAAAAAAAAAAAAAAUQBQAAEBUAUQBQAFQEURUBUAURQAAURUAAFEUAAFEEFAAABRAFEUAAAAQABnEHRpRAFEAUQBRAFEAUQBQAAAAAAAFQQUAAABUBFAAAQUAAAFEUABBRFAABRFAARBUAUAAAAAAABUAUQBnEHRpRAFEUAAAAAAAAAAAAAAFEVAAAAEFQBQAAAURUAAFEUAAFEVAABRFAAEFQQUAAAAAFEAUAAAAAGYB0aAAAAAAAAAAAAAAUQBRFAAQFQBRARQAAAURQFQQUQBQAFQQUAFEAUAQVAFAQAAUQBQAAAAAFQBRAGcQdGlEAUQBRAFEAUQBRAFEUAAABAVARRAFAAVAFEAUBBRAFABRAFEVAVARRFAVAFEVAABRAFAAABRAFEAUQQUQBnEHVpRAFEAUQBRFAAAAEABQBEFQBRAFAAABRAFAAVBBRFAVAFEUABEURQAAUQBQEBUAUAAAFEAUQBQEAAAAGYQdVUQBRAFEEFEAUAAAAAAAFEAURQAAFQBRFAAQUQBQAUQBQERRAFAAVAFEVAVAFEUAABUAURQAEAAAAAAGYB0UAAAAAAAAAAAAVAFEAUQBRFAAAVAFAAAQURQFQBRFEFQQUQBQAURQAEFEUAABUAURQAAAEAABUAUQBmEV0UAAAAAAAAAAVAFEAUQBRAFAAVAFEAURQFQQUABUBFEUBUEFEUBUAURQFQQURQAAUQBRFEAEBUAUQBRFAABlAdFAAAAAAABQAAAFEAUQBRFAABRAFEAUBEUQBRFAVAFEVAVAFAAVAFAQFQBQAFQEUQBQAFQQUQBRAFEUAAGUQdFUQBRAFEAUAAAAAAAFEAUQBQAFQBRFQFQBRAFABRAFAQURQAAUQBQEFEUAAQVAFEAUBAVAFEAUAAAAAGUQdFUQBRAFEAUQBRAFEUAAFEAUQBRFAVAFEEFABRAFVAFEEFVAFEAVUAUQQVUAUQEUAFEAURUAAFEAURQAAAAAAZAHQAAAAUQBRAFEAUQFUAAAFEAURQAEFEAUAFEAUAFEVAVAFEUBUBFEVAVAFEUBUAUQQUAFEAUQBQBAAAAAAGQQdFUQBRFAAAVAFEAUQBRAFAAVAVRBBVQBRAFEUFEAUAFEEFVAFEUQVAFEVAVAFEUBUAUQQUABUBFEAURQAAAAAAZBB0FEAUQBRAFEAUQFUAFEAUQBRFBRBBQBRUAUAFEAURUFEAUARRFAVBBRFAVAFEUBUEFEUQABRAFEUAAABAAAABjEHVFEAUQBRAFEAdCAqiAKIAqoCqIAqoIKIAqoAoigKggoAKIAqoAogCqggoACoAoACoIigAAAogCiAKAgAAAAAAxAOrIAAAAAAqAKICqIAqoCqIAqoAogiqqAKIoKIAqoIKIoKIAqoAoioCoAoigogIoCCiAKIoCoAogCgIAAAAgAAADEA6gAAAAAAAAAAACiAKIoKICqqCCiKCiKKKgCqggoigogCqggoigKgCgCKIIKACiAKIoCoAogiKIoAACoAogCiAMQg6KogCiAiiKAAAAAAoogCiAKqAKIIOhAVVQBVQQURRVEUBUAUBBRFEUQBQAUQQUAFEAUAFEERRFAAAABRAFEAUQBiEHRVEAUQBRFAAAAAABRAFEAUAQVAFVyoKIoqq5VBRFBRAFVBBVQBRFAVAFAQURQAAURQAERRAFEUAABUAUQBRAFEAYhBtpRFAAAAAAAAUFQBRAFEUQAAVAFAEURQUQRXQigogDoQQVUAUAFEVAVAFAAVAFARBUAURQAAAAFQBRFEAEAAGEBtsAAAAAUAAAAFQBRAFAAABRFEFQBRFBRFEFRRRUVAVFAVAFAQUAFEAUAFEVEFQBRAFAAABRAFEERRFAAAABiEGnRRAFEUAAABQAAAAAAAVFEAUAFEUQABRFBRFEURUVRFAVFQFRQFQBQAFQRFABRAFAAABRBBRFEAAAAAAAAYgFdAAAAAAABRRAFEUAAABQAAVARRFAVAFAEUARRFFUAFAQURQFRQAERQAFQBQAFQBRFQABAAFEAUQBRAFEAYwFdAAAAAAAAAAAABUFFEUAAABQVARQAURRBUAVUUBUVAVAFVAFAQURRBUAUABUEFAAABRAFAEAAAAAEAAGMBp0AAAAAAAAAAAAAAAAFQUURQAAURVQVAFARFABQAUAFAQUABUBFAAVFQAAFRQAAAAFQBRFRAAAAAAGMBp0AAAAAAAAAAAAAAAAAAAFFEUAARQAUARQAUBBRFAVFAVFAAQUAAARQAAAUBAAAAAAABREFAQUBjAadAAAAAAAAAAAAAAAAAAAAABRQBFAAVFEFRUFABQAFRQFRUAAFAAABQAAEQUAAAAAAAAAUQBQAYwGmwAAAAAAAAAAAAAAAAAAAAAFAEUABUUBQBQAUARQEBUUAFAAAVFAAQAAUAAAQAAAAAAAAABkAabAAAAAAAAAAAAAAAAAAAAAUAARQAUAFBQAUAFQAAUABUUABEFAAAAFAAAAAAAAQFQBQAAAYwG2gAAAAAAAAAAAAAAAAAAABUUAFEFRQFRQFRQFRUBUUAFAAAUEAAFAAAAUBAAAAABBQAAAAAAAYwG2gAAAAAAAAAAAAAAAAAAABUUBQAUAUAFBUAFAAAUAAUQAQFAAABUUAAAAAFQABAAAAAAAAGMBtoAAAAAAAAAAAAAAAAAAFAFRQAUBQAUAFBAUAFRQAAUBABQABBUUAAAABUVAAAAAAAAABQQUBiAbUAAAAAAAAAAAAAABQRQAAFUFABQAUAFABUQBQAAFAAFQAAAUAAAAAUEAEAAAFAAAAAAAABiAbUAAAAAAAAAAAAFAABQABQBQAFAFABQAUBAUAFRRAFBFBABQAAAAFAAAABAUAAAABAAAAAAGIBtQAAAAAAFBBQAAUAABVAAUUAFBAUBBQAUAFRUAFAAAUBABAUAAAFAAABUUAAABAAAAAAAAAABiFGxBQAAUAAAAAAFFAAUAAVFABQFRUBUUBUUQBQAEBQAFAAAFBAAAUBAAAUAAAAAAQAUEUAAAAAAAYgG1BQEFFEFBUUAAAAAAUEUBQFABRAFQAAUAFAEFBABQAAFAABAUAAABQQAAAABQRQQAAAAAAAAAAYwHRoAAAAAABQQUFAAAAAAFABQAUBBQQFRQFRQAERQAAUAABQAAQFRQAAAAAAUAQAFAEAAAFBBQEFAYhR0aAAAAAAAAAAAAAFBUUBUVAVFAVFEAVAABQAFRQAERQAAUAAABBQAAAAUEUAAAAAAUABAAAAAABjAdGgAAAAAABQAAFBUUAAAUBEUAFABQEQVFABQAAFRUAAQVFAABQAAEAAFAAAABQAAAAAEAAAAAAGMB1aAAAUVBQEUAAAAAAAFRQFRUQBQAUAFRAABQABQAEBUUAAQVFAAQAUEUAAAAAUAAAAAABAAAAAABkAdWwAAAAAAAAAAAAAFAAUBBQQFRQFRUQABQAFRQAEBQABRAAABAVFAAAAABQAAAAAAAAAAAAAAZAHRsAAAAAAAAAAAAVFABQAAUBEUABUVEFRQAAUAAFQAAFRQABAAFAQAAFAAAAAAAAAAAAAAUAAQYwHVsAAAAAAAAAAAAVFAVFAVFABUQABQEQUAFRQAAFRUAABUUAAQBQAEAAFAAAAAAAAAAAABQAAAAYwHRsAAAAAAAAAAAFUAQVFAVFAVFRAAFARFAAVFAABQEAAFAAAAVFEAEAAFAAAAAAAAAABQAAAAAAYwHRsAAAAAAAAAFFRQABBUUBUUBUVEAAUBEUABUUAAFAQAAUAAAFARAAAAFAAAAAAAAAAUAAAAAAAf/9k="
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default SwitchTariffs;

const groupByDay = (
  consumptionData: ISwitchConsumptionData
): ISwitchConsumptionData => {
  let accumulatedValue = 0;
  let currentDate = "";
  let count = 0;

  /* try to make up for missing data */
  const averageHalfHourlyConsumption =
    consumptionData.results.reduce((acc, cur) => acc + cur.consumption, 0) /
    consumptionData.results.length;

  const groupedConsumptionData = consumptionData.results.flatMap((data) => {
    const thisDay = new Date(data.interval_start).toDateString();

    if (thisDay !== currentDate) {
      // fill in missing days
      if (
        currentDate &&
        thisDay !==
          new Date(
            new Date(currentDate).setDate(new Date(currentDate).getDate() - 1)
          ).toDateString()
      ) {
        const interval_start = new Date(currentDate);
        const interval_end = new Date(
          new Date(currentDate).setDate(new Date(currentDate).getDate() + 1)
        );
        currentDate = new Date(
          new Date(currentDate).setDate(new Date(currentDate).getDate() - 1)
        ).toDateString();
        accumulatedValue = data.consumption;
        count = 1;
        return [
          {
            interval_start: interval_start.toISOString(),
            interval_end: interval_end.toISOString(),
            consumption: averageHalfHourlyConsumption * 48,
          },
        ];
      }

      if (currentDate !== "") {
        const interval_start = new Date(currentDate);
        const interval_end = new Date(
          new Date(currentDate).setDate(new Date(currentDate).getDate() + 1)
        );
        currentDate = thisDay;
        // fill in missing 1/2 sessions
        const thisAccumulatedValue =
          accumulatedValue + (averageHalfHourlyConsumption * 48) / count;
        accumulatedValue = data.consumption;
        count = 1;
        return [
          {
            interval_start: interval_start.toISOString(),
            interval_end: interval_end.toISOString(),
            consumption: thisAccumulatedValue,
          },
        ];
      }

      currentDate = thisDay;
      accumulatedValue = data.consumption;
      count = 1;
    } else {
      accumulatedValue += data.consumption;
      count++;
      return [];
    }
  });
  const interval_start = new Date(currentDate);
  const interval_end = new Date(
    new Date(currentDate).setDate(new Date(currentDate).getDate() + 1)
  );
  groupedConsumptionData.push({
    interval_start: interval_start.toISOString(),
    interval_end: interval_end.toISOString(),
    consumption: accumulatedValue,
  });

  return {
    results: groupedConsumptionData.filter(
      (data) => !!data
    ) as IConsumptionData[],
  };
};
