import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect } from "react";

interface IAnimatedDigits {
  from?: number;
  to: number;
  duration?: number;
}
const AnimatedDigits = ({ from = 0, to, duration = 1 }: IAnimatedDigits) => {
  const count = useMotionValue(from);
  const rounded = useTransform(count, (latest: number) => Math.round(latest));

  useEffect(() => {
    const controls = animate(count, to, { duration });

    return controls.stop;
  }, [count, duration, to]);

  return <motion.span>{rounded}</motion.span>;
};

export default AnimatedDigits;
