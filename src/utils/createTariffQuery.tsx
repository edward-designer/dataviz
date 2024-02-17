import { ENERGY_TYPE, TariffCategory, TariffType } from "@/data/source";
import { fetchApi } from "@/utils/helpers";

interface IUseCreateTariffQuery {
  tariff: string;
  type: Exclude<TariffType, "EG">;
  gsp?: string;
  fromDate: string;
  toDate: string;
  category: TariffCategory;
  enabled: boolean;
}
const createTariffQuery = ({
  tariff,
  type,
  gsp,
  fromDate,
  toDate,
  category,
  enabled = true,
}: IUseCreateTariffQuery) => {
  const numberOfPages = Math.ceil(
    (((new Date(toDate).valueOf() - new Date(fromDate).valueOf()) /
      1000 /
      60 /
      60) *
      2) /
      1500
  );
  const formattedFromDate = fromDate.replace(".000", "");
  const formattedToDate = toDate.replace(".000", "");

  const agilePageArray = Array.from({ length: numberOfPages }, (_, i) => i + 1);
  const queryFnArray = {
    Chart: fetchApi([
      {
        tariffType: type,
        url: `https://api.octopus.energy/v1/products/${tariff}/${ENERGY_TYPE[type]}-tariffs/${type}-1R-${tariff}-${gsp}/standard-unit-rates/?page_size=1500&period_from=${formattedFromDate}&period_to=${formattedToDate}`,
      },
    ]),
    Agile: fetchApi(
      agilePageArray.map((num) => {
        return {
          tariffType: type,
          url: `https://api.octopus.energy/v1/products/${tariff}/${ENERGY_TYPE[type]}-tariffs/${type}-1R-${tariff}-${gsp}/standard-unit-rates/?page_size=1500&period_from=${formattedFromDate}&period_to=${formattedToDate}&page=${num}`,
        };
      })
    ),
    Go: fetchApi([
      {
        tariffType: type,
        url: `https://api.octopus.energy/v1/products/${tariff}/${ENERGY_TYPE[type]}-tariffs/${type}-1R-${tariff}-${gsp}/standard-unit-rates/?page_size=1500&period_from=${formattedFromDate}&period_to=${formattedToDate}`,
      },
    ]),
    IGo: fetchApi([
      {
        tariffType: type,
        url: `https://api.octopus.energy/v1/products/${tariff}/${ENERGY_TYPE[type]}-tariffs/${type}-1R-${tariff}-${gsp}/standard-unit-rates/?page_size=1500&period_from=${formattedFromDate}&period_to=${formattedToDate}`,
      },
    ]),
    Cosy: fetchApi(
      [1, 2].map((num) => {
        return {
          tariffType: type,
          url: `https://api.octopus.energy/v1/products/${tariff}/${ENERGY_TYPE[type]}-tariffs/${type}-1R-${tariff}-${gsp}/standard-unit-rates/?page_size=1500&period_from=${formattedFromDate}&period_to=${formattedToDate}&page=${num}`,
        };
      })
    ),
    Tracker: fetchApi([
      {
        tariffType: type,
        url: `https://api.octopus.energy/v1/products/${tariff}/${ENERGY_TYPE[type]}-tariffs/${type}-1R-${tariff}-${gsp}/standard-unit-rates/?page_size=1500&period_from=${formattedFromDate}&period_to=${formattedToDate}`,
      },
    ]),
    SVT: fetchApi([
      {
        tariffType: type,
        url: `https://api.octopus.energy/v1/products/${tariff}/${ENERGY_TYPE[type]}-tariffs/${type}-1R-${tariff}-${gsp}/standard-unit-rates/?page_size=1500&period_from=${formattedFromDate}&period_to=${formattedToDate}`,
      },
    ]),
    Fixed: fetchApi([
      {
        tariffType: type,
        url: `https://api.octopus.energy/v1/products/${tariff}/${ENERGY_TYPE[type]}-tariffs/${type}-1R-${tariff}-${gsp}/standard-unit-rates/?page_size=1500&period_from=${formattedFromDate}&period_to=${formattedToDate}`,
      },
    ]),
    Flux: fetchApi([
      {
        tariffType: type,
        url: `https://api.octopus.energy/v1/products/${tariff}/${ENERGY_TYPE[type]}-tariffs/${type}-1R-${tariff}-${gsp}/standard-unit-rates/?page_size=1500&period_from=${formattedFromDate}&period_to=${formattedToDate}`,
      },
    ]),
    IFlux: fetchApi([
      {
        tariffType: type,
        url: `https://api.octopus.energy/v1/products/${tariff}/${ENERGY_TYPE[type]}-tariffs/${type}-1R-${tariff}-${gsp}/standard-unit-rates/?page_size=1500&period_from=${formattedFromDate}&period_to=${formattedToDate}`,
      },
    ]),
  };
  return queryFnArray[category];
};

export default createTariffQuery;
