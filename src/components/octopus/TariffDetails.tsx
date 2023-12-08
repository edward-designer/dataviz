import { TariffType } from "@/data/source";
import useTariffQuery from "@/hooks/useTariffQuery";
import { useQuery } from "@tanstack/react-query";

interface ITariffDetails {
  tariff_code: string;
  valid_from: string;
  type: TariffType;
}

const TariffDetails = ({ tariff_code, valid_from, type }: ITariffDetails) => {
  const { data, isSuccess, isLoading } = useTariffQuery<{
    display_name: string;
  }>({
    tariff: tariff_code,
    type,
  });

  return (
    <div className="bg-theme-900/40 p-2">
      <span className="inline-block w-[90px] text-white/70 text-sm">
        Tariff:
      </span>
      {isSuccess ? data[0]?.display_name ?? tariff_code : tariff_code}
      <br />
      <span className="inline-block w-[90px] text-white/70  text-sm">
        Date joined:
      </span>
      {new Date(valid_from).toLocaleDateString()}
    </div>
  );
};

export default TariffDetails;
