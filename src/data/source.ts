import { TDuration } from "@/utils/helpers";

export const gqlEndPoint = "https://api.octopus.energy/v1/graphql/";

export type ENERGY_PLAN = "agile" | "tracker";

export interface ITariffPlan {
  code: string;
  name: string;
  currentPlan: boolean;
}

export interface ITrackerTariffPlan extends ITariffPlan {
  code: string;
  name: string;
  currentPlan: boolean;
  cap: {
    E: number;
    G: number;
  };
}

/* https://guylipman.medium.com/accessing-your-octopus-smart-meter-data-3f3905ca8fec */
export const GAS_MULTIPLIER_TO_KWH = 11.19;

export const CURRENT_VARIABLE_CODE = "VAR-22-11-01";

export interface ITariffToCompare {
  tariff: string;
  type: Exclude<TariffType, "EG">;
  category: TariffCategory;
  cost: number | null;
}

export const GTARIFFS: ITariffToCompare[] = [
  {
    tariff: "VAR-22-11-01",
    type: "G",
    category: "SVT",
    cost: null,
  },
  {
    tariff: "LOYAL-FIX-12M-24-03-22",
    type: "G",
    category: "Fixed",
    cost: null,
  },
  {
    tariff: "SILVER-23-12-06",
    type: "G",
    category: "Tracker",
    cost: null,
  },
];
export const EETARIFFS: ITariffToCompare[] = [
  {
    tariff: "AGILE-OUTGOING-19-05-13",
    type: "E",
    category: "Agile",
    cost: null,
  },
  {
    tariff: "FLUX-EXPORT-23-02-14",
    type: "E",
    category: "Flux",
    cost: null,
  },
  {
    tariff: "INTELLI-FLUX-EXPORT-23-07-14",
    type: "E",
    category: "IFlux",
    cost: null,
  },
  {
    tariff: "OUTGOING-FIX-12M-19-05-13",
    type: "E",
    category: "Fixed",
    cost: null,
  },
  {
    tariff: "OUTGOING-LITE-FIX-12M-23-09-12",
    type: "E",
    category: "Fixed",
    cost: null,
  },
];

export const ETARIFFS: ITariffToCompare[] = [
  {
    tariff: "VAR-22-11-01",
    type: "E",
    category: "SVT",
    cost: null,
  },
  {
    tariff: "SILVER-23-12-06",
    type: "E",
    category: "Tracker",
    cost: null,
  },
  {
    tariff: "AGILE-23-12-06",
    type: "E",
    category: "Agile",
    cost: null,
  },
  {
    tariff: "COSY-22-12-08",
    type: "E",
    category: "Cosy",
    cost: null,
  },
  {
    tariff: "LOYAL-FIX-12M-24-03-22",
    type: "E",
    category: "Fixed",
    cost: null,
  },
  {
    tariff: "FLUX-IMPORT-23-02-14",
    type: "E",
    category: "Flux",
    cost: null,
  },
  {
    tariff: "INTELLI-FLUX-IMPORT-23-07-14",
    type: "E",
    category: "IFlux",
    cost: null,
  },
  {
    tariff: "GO-VAR-BB-23-02-07",
    type: "E",
    category: "Go",
    cost: null,
  },
  {
    tariff: "INTELLI-VAR-22-10-14",
    type: "E",
    category: "IGo",
    cost: null,
  },
];
export const SVT_ETARIFF =
  ETARIFFS.find((tariff) => tariff.category === "SVT")?.tariff ?? "";
export const SVT_GTARIFF =
  GTARIFFS.find((tariff) => tariff.category === "SVT")?.tariff ?? "";

export const AGILE: ITrackerTariffPlan[] = [
  {
    code: "AGILE-24-04-03",
    name: "Agile Octopus Apr 2024 v1",
    currentPlan: false,
    cap: {
      E: 100,
      G: 0,
    },
  },
  {
    code: "AGILE-23-12-06",
    name: "Agile Octopus Dec 2023 v1",
    currentPlan: false,
    cap: {
      E: 100,
      G: 0,
    },
  },
  {
    code: "AGILE-FLEX-22-11-25",
    name: "Agile Octopus Nov 2022 v1",
    currentPlan: false,
    cap: {
      E: 100,
      G: 0,
    },
  },
  /*{
    code: "AGILE-OUTGOING-19-05-13",
    name: "Agile Outgoing Octopus",
    currentPlan: true,
    cap: {
      E: 100,
      G: 0,
    },
  },*/
];

export const TRACKER: ITrackerTariffPlan[] = [
  {
    code: "SILVER-24-07-01",
    name: "Tracker July 2024 v1",
    currentPlan: true,
    cap: {
      E: 100,
      G: 30,
    },
  },
  {
    code: "SILVER-24-04-03",
    name: "Tracker April 2024 v1",
    currentPlan: false,
    cap: {
      E: 100,
      G: 30,
    },
  },
  {
    code: "SILVER-23-12-06",
    name: "Tracker December 2023 v1",
    currentPlan: false,
    cap: {
      E: 100,
      G: 30,
    },
  },
  /*{
    code: "SILVER-FLEX-BB-23-02-08",
    name: "Tracker February 2023 v1",
    currentPlan: false,
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
  },*/
];

export type CapsTSVResult = {
  Region: string;
  Date: string;
  E: string;
  G: string;
  ES: string;
  GS: string;
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
export type Dual_tariff = Record<gsp, Dual_tariff_gsp_record>;

export type Single_tariff_gsp_record = {
  direct_debit_monthly: {
    standard_unit_rate_inc_vat: number;
    standing_charge_inc_vat: number;
  };
  varying: {
    standard_unit_rate_inc_vat: number;
    standing_charge_inc_vat: number;
    day_unit_rate_inc_vat: number;
    night_unit_rate_inc_vat: number;
  };
};
export type Dual_tariff_gsp_record = {
  varying: {
    day_unit_rate_inc_vat: number;
    night_unit_rate_inc_vat: number;
    standing_charge_inc_vat: number;
  };
};

export type Single_tariff_gsp_record_charge_type =
  | "standard_unit_rate_inc_vat"
  | "standing_charge_inc_vat"
  | "day_unit_rate_inc_vat"
  | "night_unit_rate_inc_vat";

export interface QuerySingleTariffPlanResult {
  tariffs_active_at: string;
  single_register_electricity_tariffs: Single_tariff;
  dual_register_electricity_tariffs?: Dual_tariff;
  single_register_gas_tariffs: Single_tariff;
}
export interface QuerySingleAgileResult {
  payment_method: null | string;
  valid_from: string;
  valid_to: string;
  value_exc_vat: number;
  value_inc_vat: number;
}
export interface QuerySingleAgileGSPResult {
  count: number;
  dataStamp: string;
  gsp: gsp;
  next: null | string;
  previous: null | string;
  results: QuerySingleAgileResult[];
}
export type QueryAgileResults = QuerySingleAgileGSPResult[];

export type ApiTariffType = keyof typeof ENERGY_TYPE;
export type TariffType = ApiTariffType | "EG";
export type TVariant = "default" | "badge" | "heading";

export const FETCH_ERROR = "Sorry. Cannot fetch data. Please try again.";

export const GSP = [
  "_A",
  "_B",
  "_C",
  "_D",
  "_E",
  "_F",
  "_G",
  "_H",
  "_J",
  "_K",
  "_L",
  "_M",
  "_N",
  "_P",
] as const;
export type gsp = (typeof GSP)[number];

export interface QueryProducts {
  count: number;
  next: null | string;
  previous: null | string;
  results: QueryProductsResult[];
  brand: string;
}

export interface QueryProductsResult {
  code: string;
  direction: "IMPORT" | "EXPORT";
  full_name: string;
  display_name: string;
  description: string;
  is_variable: boolean;
  is_green: boolean;
  is_tracker: boolean;
  is_prepay: boolean;
  is_business: boolean;
  is_restricted: boolean;
  term: null | string;
  available_from: string;
  available_to: null | string;
  links: LinkResult[];
}

export interface LinkResult {
  href: string;
  method: "GET";
  rel: "self";
}

export type DurationType = "month" | "week" | "day" | "2-days" | "year";

export interface IUserApiResult {
  number: string;
  properties: IUserApiResultProperty[];
}
export interface IUserApiResultProperty {
  address_line_1: string;
  address_line_2: string;
  address_line_3: string;
  county: string;
  electricity_meter_points: IMeterPointE[];
  gas_meter_points: IMeterPointG[];
  id: number;
  moved_in_at: string;
  moved_out_at: string;
  postcode: string;
  town: string;
}
export interface IMeterPointE {
  agreements: {
    tariff_code: string;
    valid_from: string;
    valid_to: string | null;
  }[];
  consumption_standard: number;
  is_export: boolean;
  meters: { registers: {}; serial_number: string }[];
  mpan: string;
  profile_class: number;
}
export interface IMeterPointG {
  agreements: {
    tariff_code: string;
    valid_from: string;
    valid_to: string | null;
  }[];
  consumption_standard: number;
  meters: { registers: {}; serial_number: string }[];
  mprn: string;
  is_export: boolean;
}

export type TariffCategory =
  | "Agile"
  | "Tracker"
  | "SVT"
  | "Fixed"
  | "Cosy"
  | "Go"
  | "Chart"
  | "Flux"
  | "IFlux"
  | "IGo"
  | "E7";

export interface IConsumptionData {
  consumption: number;
  interval_start: string;
  interval_end: string;
}

export interface IPeriod {
  duration: TDuration | "custom";
  from: Date;
  to: Date;
}

export const trackerUnitPriceIncrease2023: Record<
  gsp,
  Record<Exclude<TariffType, "EG">, number>
> = {
  _A: { E: 3.1811, G: 0.1846 },
  _B: { E: 2.0999, G: 0.2032 },
  _C: { E: 3.7182, G: 0.2657 },
  _D: { E: 2.3751, G: 0.3948 },
  _E: { E: 1.879, G: 0.18 },
  _F: { E: 1.8562, G: 0.2884 },
  _G: { E: 2.9607, G: 0.1956 },
  _H: { E: 2.4412, G: 0.1834 },
  _J: { E: 2.8799, G: 0.0966 },
  _K: { E: 2.0048, G: 0.4455 },
  _L: { E: 1.4344, G: 0.4316 },
  _M: { E: 1.996, G: 0.3624 },
  _N: { E: 2.2051, G: 0.2331 },
  _P: { E: 2.6551, G: 0.2331 },
};

export const trackerUnitPriceIncrease2024: Record<
  gsp,
  Record<Exclude<TariffType, "EG">, number>
> = {
  _A: { E: 3.1811, G: 0.1846 },
  _B: { E: 2.0999, G: 0.2032 },
  _C: { E: 3.7182, G: 0.2657 },
  _D: { E: 2.3751, G: 0.3948 },
  _E: { E: 1.879, G: 0.18 },
  _F: { E: 1.8562, G: 0.2884 },
  _G: { E: 2.9607, G: 0.1956 },
  _H: { E: 2.4412, G: 0.1834 },
  _J: { E: 2.8799, G: 0.0966 },
  _K: { E: 2.0048, G: 0.4455 },
  _L: { E: 1.4344, G: 0.4316 },
  _M: { E: 1.996, G: 0.3624 },
  _N: { E: 2.2051, G: 0.2331 },
  _P: { E: 2.6551, G: 0.2331 },
};

export interface IPeriod {
  duration: TDuration | "custom";
  from: Date;
  to: Date;
}
