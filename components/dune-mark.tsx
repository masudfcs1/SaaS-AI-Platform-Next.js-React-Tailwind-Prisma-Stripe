import type { SVGProps } from "react";

export function DuneMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 40 40" fill="none" aria-hidden="true" {...props}>
      <path d="M20 3v34M3 20h34M8 8l24 24M8 32 32 8M13.5 4.3l13 31.4M4.3 13.5l31.4 13M4.3 26.5l31.4-13M13.5 35.7l13-31.4" stroke="currentColor" strokeWidth="2.8" />
      <circle cx="20" cy="20" r="5" fill="currentColor" />
    </svg>
  );
}
