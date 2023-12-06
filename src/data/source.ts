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

export interface ITariffToCompare {
  tariff: string;
  type: Exclude<TariffType, "EG">;
  category: TariffCategory;
  cost: number | null;
}

export const GTARIFFS: ITariffToCompare[] = [
  {
    tariff: "VAR-22-11-01",
    type: "E",
    category: "SVT",
    cost: null,
  },
  {
    tariff: "LOYAL-FIX-12M-23-11-23",
    type: "E",
    category: "Fixed",
    cost: null,
  },
  {
    tariff: "SILVER-FLEX-22-11-25",
    type: "G",
    category: "Tracker",
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
    tariff: "SILVER-FLEX-22-11-25",
    type: "G",
    category: "Tracker",
    cost: null,
  },
  {
    tariff: "AGILE-FLEX-22-11-25",
    type: "E",
    category: "Agile",
    cost: null,
  },
  {
    tariff: "LOYAL-FIX-12M-23-11-23",
    type: "E",
    category: "Fixed",
    cost: null,
  },
  {
    tariff: "COSY-22-12-08",
    type: "E",
    category: "Cosy",
    cost: null,
  },
  {
    tariff: "GO-VAR-22-10-14",
    type: "E",
    category: "Go",
    cost: null,
  },
];

export const TRACKER: ITrackerTariffPlan[] = [
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

export const priceCaps = {
  "2023-10-01": {
    period: {
      from: "2023-10-01",
      to: "2023-12-31",
    },
    cap: {
      E: 27.35,
      G: 6.89,
    },
  },
  "2024-01-01": {
    period: {
      from: "2024-01-01",
      to: "2024-03-31",
    },
    cap: {
      E: 28.62,
      G: 7.42,
    },
  },
};

export const standingCaps = {
  "2023-10-01": {
    period: {
      from: "2023-10-01",
      to: "2023-12-31",
    },
    cap: {
      E: 53.37,
      G: 29.62,
    },
  },
  "2024-01-01": {
    period: {
      from: "2024-01-01",
      to: "2024-03-31",
    },
    cap: {
      E: 53.35,
      G: 29.6,
    },
  },
};

const getCurrentCap = <T extends typeof priceCaps>(
  caps: T
): { E: number; G: number } => {
  const today = new Date();
  const dateThresholds = Object.keys(caps);
  dateThresholds.sort((a, b) => new Date(b).valueOf() - new Date(a).valueOf());
  const currentPeriod = dateThresholds.filter(
    (date) => today.valueOf() - new Date(date).valueOf() >= 0
  )?.[0] as unknown as keyof typeof priceCaps;
  return caps[currentPeriod].cap ?? { E: null, G: null };
};

export const priceCap = getCurrentCap(priceCaps);
export const standingCap = getCurrentCap(standingCaps);

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

export interface Single_tariff_gsp_record {
  direct_debit_monthly: {
    standard_unit_rate_inc_vat: number;
    standing_charge_inc_vat: number;
  };
}

export interface QuerySingleTariffPlanResult {
  tariffs_active_at: string;
  single_register_electricity_tariffs: Single_tariff;
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
export type TVariant = "default" | "badge";

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

export type DurationType = "month" | "week" | "day" | "2-days";

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
    valid_to: string;
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
    valid_to: string;
  }[];
  consumption_standard: number;
  meters: { registers: {}; serial_number: string }[];
  mprn: string;
}

export type TariffCategory =
  | "Agile"
  | "Tracker"
  | "SVT"
  | "Fixed"
  | "Cosy"
  | "Go";
