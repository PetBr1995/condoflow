"use client";

import { useEffect, useRef } from "react";
import { useInView, useMotionValue, useSpring } from "motion/react";
import { cn } from "@/lib/utils";

export function NumberTicker({
  value,
  direction = "up",
  delay = 0,
  className,
  prefix = "",
  suffix = "",
}: {
  value: number;
  direction?: "up" | "down";
  className?: string;
  delay?: number;
  prefix?: string;
  suffix?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(direction === "down" ? value : 0);
  const springValue = useSpring(motionValue, {
    damping: 50,
    stiffness: 90,
  });
  const isInView = useInView(ref, { once: true, margin: "0px" });

  useEffect(() => {
    if (isInView) {
      const timer = setTimeout(() => {
        motionValue.set(direction === "down" ? 0 : value);
      }, delay * 1000);
      return () => clearTimeout(timer);
    }
  }, [motionValue, isInView, delay, value, direction]);

  useEffect(
    () =>
      springValue.on("change", (latest) => {
        if (ref.current) {
          ref.current.textContent = `${prefix}${Intl.NumberFormat("pt-BR").format(
            Math.round(latest)
          )}${suffix}`;
        }
      }),
    [springValue, prefix, suffix]
  );

  return (
    <span className={cn("inline-block tabular-nums", className)} ref={ref}>
      {prefix}0{suffix}
    </span>
  );
}
