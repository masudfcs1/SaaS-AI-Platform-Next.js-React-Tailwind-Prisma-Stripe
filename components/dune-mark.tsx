"use client";

import { useId, type SVGProps } from "react";

const ribbon = "M10 8a2 2 0 0 1 2-2h11c10.5 0 18 7.6 18 18S33.5 42 23 42H12a2 2 0 0 1-2-2V8Zm9 7v18h4c5.2 0 9-3.8 9-9s-3.8-9-9-9h-4Z";

export function DuneMark(props: SVGProps<SVGSVGElement>) {
  const id = useId();

  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" focusable="false" {...props}>
      <defs>
        <linearGradient id={`${id}-face`} x1="10" y1="6" x2="37" y2="43" gradientUnits="userSpaceOnUse">
          <stop stopColor="#EDB080" /><stop offset=".42" stopColor="#D07A48" /><stop offset="1" stopColor="#A64B2B" />
        </linearGradient>
        <linearGradient id={`${id}-orbit`} x1="4" y1="37" x2="44" y2="13" gradientUnits="userSpaceOnUse">
          <stop stopColor="#A64B2B" /><stop offset=".45" stopColor="#F9D6AE" /><stop offset="1" stopColor="#E8A475" />
        </linearGradient>
      </defs>
      <g transform="rotate(-8 24 24)">
        <path d={ribbon} transform="translate(1 1.5)" fill="#793C27" fillRule="evenodd" />
        <path d={ribbon} fill={`url(#${id}-face)`} fillRule="evenodd" />
        <path d="M12 6.5h11c9.9 0 17.2 7 17.5 16.5" stroke="#FFE4C3" strokeOpacity=".55" strokeWidth=".8" strokeLinecap="round" />
        <path d="M19 33h4c5.2 0 9-3.8 9-9" stroke="#6F321F" strokeOpacity=".35" strokeWidth="1" />
      </g>
      <path d="M6.4 28.8c-3.2 3.8-3.7 6.5-1.5 7.3 4.5 1.8 16.7-3.8 27.2-12.5 7.1-5.8 11.5-11.3 11-13.7" stroke={`url(#${id}-orbit)`} strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}
