import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ReactNode } from "react";
import { IWrapperComponentProps } from "@/types";
import { cn } from "@/utils";

const variants = {
  in: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.25,
      delay: 0.5,
    },
  },
  out: {
    opacity: 0,
    scale: 0.97,
    transition: {
      duration: 0.25,
    },
  },
};

/**
 * This component is used to provide basic transitions between the pages of the application.
 */
export const PageTransition = (props: IWrapperComponentProps): ReactNode => {
  const { asPath } = useRouter();

  return (
    <AnimatePresence>
      <motion.div
        className={cn(props.className, "w-full")}
        key={asPath}
        variants={variants}
        animate="in"
        initial="out"
        exit="out"
      >
        {props.children}
      </motion.div>
    </AnimatePresence>
  );
};
