import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

export const PageTransition = ({ children }: { children: ReactNode }) => {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      className="min-w-0"
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
};
