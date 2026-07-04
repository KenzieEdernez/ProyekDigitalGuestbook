"use client";

import { QRCodeSVG } from "qrcode.react";

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
  return (
    <div className={`flex flex-col items-center ${className}`}>
      {label && (
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-stone-400">
          {label}
        </p>
      )}
      <div className="rounded-lg bg-white p-5 ring-1 ring-stone-100">
        <QRCodeSVG value={value} size={240} level="H" includeMargin />
      </div>
      <p className="mt-2 font-mono text-sm font-semibold text-navy">{value}</p>
    </div>
  );
}
