import React from "react";
import "./ScanOverlay.css";

type Props = {
  width?: number | string;   // px number atau string seperti "80%"
  height?: number | string;
  borderWidth?: number;
  borderColor?: string;
  borderRadius?: number;
};

export default function ScanOverlay({
  width = 360,
  height = 600,
  borderWidth = 4,
  borderColor = "#ffffff",
  borderRadius = 8,
}: Props) {
  const style: React.CSSProperties = {
    width,
    height,
    borderWidth,
    borderColor,
    borderRadius,
  };

  return (
    <div className="scan-overlay" aria-hidden>
      <div className="scan-box" style={style}>
        <div className="corner top-left" />
        <div className="corner top-right" />
        <div className="corner bottom-left" />
        <div className="corner bottom-right" />
      </div>
    </div>
  );
}
