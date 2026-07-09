"use client";

import { useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";

interface LinearBarcodeProps {
  value: string;
  className?: string;
}

export default function LinearBarcode({ value, className = "" }: LinearBarcodeProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !value) return;
    try {
      JsBarcode(svgRef.current, value, {
        format: "CODE128",
        width: 2,
        height: 72,
        displayValue: true,
        fontSize: 14,
        margin: 12,
        background: "#ffffff",
        lineColor: "#1a2332",
      });
    } catch {
      // invalid barcode value
    }
  }, [value]);

  return (
    <div className={`overflow-hidden rounded-xl bg-white p-2 ${className}`}>
      <svg ref={svgRef} className="mx-auto max-w-full" />
    </div>
  );
}
