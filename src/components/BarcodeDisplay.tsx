"use client";

import { useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";

interface BarcodeDisplayProps {
  value: string;
  label?: string;
  className?: string;
}

export default function BarcodeDisplay({
  value,
  label,
  className = "",
}: BarcodeDisplayProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (svgRef.current && value) {
      try {
        JsBarcode(svgRef.current, value, {
          format: "CODE128",
          width: 2,
          height: 64,
          displayValue: true,
          fontSize: 14,
          margin: 8,
          lineColor: "#1a2332",
        });
      } catch {
        // invalid barcode
      }
    }
  }, [value]);

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {label && (
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-stone-400">
          {label}
        </p>
      )}
      <div className="rounded-lg bg-white p-3 ring-1 ring-stone-100">
        <svg ref={svgRef} />
      </div>
      <p className="mt-2 font-mono text-sm font-semibold text-navy">{value}</p>
    </div>
  );
}
