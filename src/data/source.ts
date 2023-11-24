export interface ITariffPlan {
  code: string;
  name: string;
  currentPlan: boolean;
  cap: {
    E: number;
    G: number;
  };
}

export const TRACKER: ITariffPlan[] = [
  {
    code: "SILVER-FLEX-BB-23-02-08",
    name: "Tracker February 2023 v1",
    currentPlan: true,
    cap: {
      E: 100,
      G: 30,
    },
  },
  {
    code: "SILVER-FLEX-22-11-25",
    name: "Tracker Nov 2022 V1",
    currentPlan: false,
    cap: {
      E: 100,
      G: 30,
    },
  },
  {
    code: "SILVER-VAR-22-10-21",
    name: "Tracker Oct 2022 V1",
    currentPlan: false,
    cap: {
      E: 100,
      G: 30,
    },
  },
  {
    code: "SILVER-22-08-31",
    name: "Tracker Aug 2022 V1",
    currentPlan: false,
    cap: {
      E: 78,
      G: 22,
    },
  },
  {
    code: "SILVER-22-07-22",
    name: "Tracker Jul 2022 V1",
    currentPlan: false,
    cap: {
      E: 55,
      G: 16,
    },
  },
  {
    code: "SILVER-22-04-25",
    name: "Tracker V3 (Apr 2022)",
    currentPlan: false,
    cap: {
      E: 40,
      G: 11,
    },
  },
  {
    code: "SILVER-2017-1",
    name: "Tracker V1",
    currentPlan: false,
    cap: {
      E: 30,
      G: 6,
    },
  },
];

export const priceCap = {
  E: 27,
  G: 7,
};

export const ENERGY_TYPE = {
  E: "electricity",
  G: "gas",
};

export const ENERGY_TYPE_ICON = {
  E: "⚡",
  G: "🔥",
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

export type Single_tariff = Record<gsp, Single_tariff_gsp_record>;

export interface Single_tariff_gsp_record {
  direct_debit_monthly: {
    standard_unit_rate_inc_vat: number;
  };
}

export interface QuerySingleTariffPlanResult {
  tariffs_active_at: string;
  single_register_electricity_tariffs: Single_tariff;
  single_register_gas_tariffs: Single_tariff;
}

export type ApiTariffType = keyof typeof ENERGY_TYPE;
export type TariffType = ApiTariffType | "EG";
export type TVariant = "default" | "badge";

export const FETCH_ERROR = "Sorry. Cannot fetch data. Please try again.";

export type gsp =
  | "_A"
  | "_B"
  | "_C"
  | "_D"
  | "_E"
  | "_F"
  | "_G"
  | "_H"
  | "_I"
  | "_J"
  | "_K"
  | "_L"
  | "_M"
  | "_N"
  | "_O"
  | "_P";
