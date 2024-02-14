import { WindowVisibilityContext } from "@/context/windowVisibility";
import React, {
  useRef,
  useState,
  useEffect,
  Dispatch,
  SetStateAction,
  useContext,
} from "react";

interface ITimer {
  setCurrentPeriod: Dispatch<SetStateAction<string>>;
}
const Timer = ({ setCurrentPeriod }: ITimer) => {
  const [time, setTime] = useState(new Date().toLocaleTimeString("en-GB"));
  const timerId = useRef<number | undefined>();
  const { focus } = useContext(WindowVisibilityContext);

  useEffect(() => {
    timerId.current = window.setInterval(() => {
      const now = new Date();
      setTime(now.toLocaleTimeString("en-GB"));
      if (
        now.getSeconds() <= 1 &&
        (now.getMinutes() === 30 || now.getMinutes() === 0)
      ) {
        setCurrentPeriod(now.toUTCString());
      }
    }, 1000);
    return () => window.clearInterval(timerId.current);
  }, [setCurrentPeriod]);
  useEffect(() => {
    if (!focus) return;
    const now = new Date();
    setCurrentPeriod(now.toUTCString());
  }, [focus, setCurrentPeriod]);

  return <div className="font-display text-4xl font-extralight">{time}</div>;
};

export default Timer;
