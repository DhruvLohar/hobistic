import React from 'react';
import { QuotesIcon } from "@/components/icon"

function HeroCarousel() {
  return (
    <>
      <div className="absolute inset-0 h-full w-full">
        <svg
          width="1214"
          height="704"
          viewBox="0 0 1214 704"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-[80vh] w-full"
        >
          <path
            d="M2.3673 0C-7.6327 99.8333 17.6673 303 198.867 317C380.067 331 511.034 507.833 553.867 594.5C690 778 865.4 664.5 1213 698.5"
            stroke="black"
          />
        </svg>
      </div>

      <div className="absolute bottom-16 left-12 z-10 hidden flex-col items-start text-left md:flex">
        <QuotesIcon width={48} height={48} className="mb-6 text-white/50" />
        <h2 className="text-7xl font-extrabold leading-18 text-white">
          Master <span className="text-primary">Guitar</span> <br /> like a pro.
        </h2>
      </div>
    </>
  ); 
}

export default React.memo(HeroCarousel);