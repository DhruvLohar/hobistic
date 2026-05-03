"use client";

import React, { useEffect, useState } from "react";
import { AnimatePresence, motion, MotionConfig } from "motion/react";
import { QuotesIcon } from "@/components/icon";

const HOBBIES = [
  "Guitar", "Piano", "Violin", "Drums", "Painting",
  "Sketching", "Dancing", "Singing", "Chess", "Photography",
  "Pottery", "Knitting", "Cooking", "Gardening", "Hiking",
  "Surfing", "Yoga", "Coding", "Writing", "Origami",
  "Archery", "Cycling", "Swimming", "Calligraphy", "Flute",
];

const INTERVAL_MS = 2000;
const SLIDE_DISTANCE_PX = 28;
const DURATION_S = 0.35;

const ENTER = { duration: DURATION_S, ease: [0.22, 1, 0.36, 1] as const };
const EXIT  = { duration: DURATION_S, ease: [0.55, 0, 0.78, 0] as const };

function HeroCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(
      () => setIndex((i) => (i + 1) % HOBBIES.length),
      INTERVAL_MS
    );
    return () => clearInterval(id);
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <div className="absolute bottom-16 left-12 z-10 hidden flex-col items-start text-left md:flex">
        <QuotesIcon width={48} height={48} className="mb-6 text-white/50" />
        <h2 className="text-7xl font-extrabold leading-18 text-white">
          Master{" "}
          {/* Fixed-width container prevents layout shift as words change */}
          <span className="relative inline-block min-w-[320px] overflow-hidden align-bottom pb-3 -mb-3">
            <AnimatePresence mode="wait">
              <motion.span
                key={HOBBIES[index]}
                className="inline-block text-primary"
                initial={{ opacity: 0, y: SLIDE_DISTANCE_PX }}
                animate={{ opacity: 1, y: 0, transition: ENTER }}
                exit={{ opacity: 0, y: -SLIDE_DISTANCE_PX, transition: EXIT }}
              >
                {HOBBIES[index]}
              </motion.span>
            </AnimatePresence>
          </span>{" "}
          <br /> like a pro.
        </h2>
      </div>
    </MotionConfig>
  );
}

export default React.memo(HeroCarousel);
