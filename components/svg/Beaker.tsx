"use client";

import { RefObject, useEffect, useState } from "react";

interface Props {
  cursor: { x: number; y: number };
  cardRef: RefObject<HTMLDivElement>;
}

const Beaker = ({ cursor, cardRef }: Props) => {
  const [gradientCenter, setGradientCenter] = useState({ cx: "50%", cy: "50%" });

  useEffect(() => {
    if (cardRef.current && cursor.x !== null && cursor.y !== null){
      const cardRect = cardRef.current.getBoundingClientRect();
      const cxPercentage = (cursor.x / cardRect.width) * 100;
      const cyPercentage = (cursor.y / cardRect.height) * 100;
      setGradientCenter({
        cx: `${cxPercentage}%`,
        cy: `${cyPercentage}%`,
      })
    }
  }, [cursor, cardRef])

  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2000 2000" className="absolute w-[200%] h-[200%] left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-30">
      <defs>
        <radialGradient id="runicGradient" gradientUnits="userSpaceOnUse" cx={gradientCenter.cx} cy={gradientCenter.cy} r="50%">
          <stop stopColor="#a72427" offset="0%"/> {/* Slate-400 for Scandinavian feel */}
          <stop stopColor="#f1f5f905" offset="100%"/> {/* Very light slate */}
        </radialGradient>
      </defs>
      <g fill="none" stroke="url(#runicGradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {/* Runic-inspired shapes */}
        <path d="M1000,200 L1000,1800" /> {/* Isa (I) rune */}
        <path d="M600,200 L1400,200 M600,1800 L1400,1800" /> {/* Ehwaz (E) rune */}
        <path d="M400,400 L1600,1600 M1600,400 L400,1600" /> {/* Gebo (G) rune */}
        <path d="M200,1000 L1800,1000 M1000,200 L1400,1000 L1000,1800 M1000,200 L600,1000 L1000,1800" /> {/* Algiz (Z) rune */}
        
        {/* Circular elements */}
        <circle cx="1000" cy="1000" r="700" />
        <circle cx="1000" cy="1000" r="400" />
        
        {/* Additional runic elements */}
        <path d="M300,300 L300,1700 M1700,300 L1700,1700" /> {/* Vertical lines */}
        <path d="M500,500 L1500,500 M500,1500 L1500,1500" /> {/* Horizontal lines */}
        
        {/* Nordic-inspired decorative elements */}
        <path d="M700,200 C850,400 1150,400 1300,200" />
        <path d="M700,1800 C850,1600 1150,1600 1300,1800" />
        <path d="M200,700 C400,850 400,1150 200,1300" />
        <path d="M1800,700 C1600,850 1600,1150 1800,1300" />
      </g>
    </svg>
  )
}

export default Beaker;

