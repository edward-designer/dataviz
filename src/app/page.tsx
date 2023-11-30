import Octopus3d from "@/components/octopus/Octopus3d";
import { ENERGY_PLAN, ENERGY_TYPE } from "@/data/source";

import EnergyPriceCard from "./EnergyPriceCard";

const Home = () => {
  return (
    <div className="lg:col-[content] my-4 flex justify-start items-center">
      <div className="max-w-full w-full md:w-[75%] min-w-[300px] z-10 bg-black/20 flex gap-2 p-4 flex-col lg:flex-row flex-wrap mb-20">
        <EnergyPriceCard type="E" plan="agile" />
        <EnergyPriceCard type="E" plan="tracker" />
        <EnergyPriceCard type="G" plan="tracker" />
      </div>
      <Octopus3d />
    </div>
  );
};

export default Home;
