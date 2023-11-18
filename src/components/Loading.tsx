import { TbLoader2 } from "react-icons/tb";

const Loading = () => {
  return (
    <div className="w-full flex items-center justify-center">
      <TbLoader2 className="w-6 h-6 text-accentBlue-500 animate-spin" />
    </div>
  );
};

export default Loading;
