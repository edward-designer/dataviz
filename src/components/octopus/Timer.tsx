import React, {
  useRef,
  useState,
  useEffect,
  Dispatch,
  SetStateAction,
} from "react";

interface ITimer {
  setCurrentPeriod: Dispatch<SetStateAction<string>>;
}
const Timer = ({ setCurrentPeriod }: ITimer) => {
  const [time, setTime] = useState(new Date().toUTCString());
  const timerId = useRef<number | undefined>();

  useEffect(() => {
    timerId.current = window.setInterval(() => {
      const now = new Date();
      setTime(now.toLocaleTimeString());
      if (
        now.getSeconds() <= 1 &&
        (now.getMinutes() === 30 || now.getMinutes() === 0)
      ) {
        setCurrentPeriod(now.toLocaleTimeString());
      }
    }, 1000);
    return () => window.clearInterval(timerId.current);
  }, [setCurrentPeriod]);

  return <div className="font-display text-4xl font-extralight">{time}</div>;
};

export default Timer;
