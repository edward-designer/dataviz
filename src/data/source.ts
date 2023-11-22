export interface ITariffPlan {
  code: string;
  name: string;
  currentPlan: boolean;
}

export const TRACKER: ITariffPlan[] = [
  {
    code: "SILVER-FLEX-BB-23-02-08",
    name: "Tracker February 2023 v1",
    currentPlan: true,
  },
  {
    code: "SILVER-FLEX-22-11-25",
    name: "Tracker Nov 2022 V1",
    currentPlan: false,
  },
  {
    code: "SILVER-VAR-22-10-21",
    name: "Tracker Oct 2022 V1",
    currentPlan: false,
  },
  { code: "SILVER-22-08-31", name: "Tracker Aug 2022 V1", currentPlan: false },
  { code: "SILVER-22-07-22", name: "Tracker Jul 2022 V1", currentPlan: false },
  {
    code: "SILVER-22-04-25",
    name: "Tracker V3 (Apr 2022)",
    currentPlan: false,
  },
  { code: "SILVER-2017-1", name: "Tracker V1", currentPlan: false },
];

export const priceCap = {
  E: 27,
  G: 7,
};

export const ENERGY_TYPE = {
  E: "electricity",
  G: "gas",
};

export interface TariffResult {
  value_exc_vat: number;
  value_inc_vat: number;
  valid_from: string;
  valid_to: string;
  payment_method: null | string;
}

export interface QueryTariffResult {
  tariffType: ApiTariffType;
  count: number;
  next: null | string;
  previous: null | string;
  results: TariffResult[];
}

export type ApiTariffType = keyof typeof ENERGY_TYPE;
export type TariffType = ApiTariffType | "EG";
export type TVariant = "default" | "badge";

export const FETCH_ERROR = "Sorry. Cannot fetch data. Please try again.";
