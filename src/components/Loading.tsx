import { TbLoader2 } from "react-icons/tb";

const Loading = () => {
  return (
    <div className="absolute right-4 top-4">
      <TbLoader2 className="w-6 h-6 text-accentBlue-500 animate-spin" />
    </div>
  );
};

export default Loading;
