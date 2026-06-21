import React, { useState } from "react";
import BarcodeScanner from "./BarcodeScanner";

export default function CheckInButton() {
  const [open, setOpen] = useState(false);
  const [lastBarcode, setLastBarcode] = useState<string | null>(null);

  function handleSuccess(code: string) {
    setLastBarcode(code);
    // you can do additional UI actions here (show souvenir info, etc.)
  }

  return (
    <div>
      <button onClick={() => setOpen(true)}>Check-in</button>

      {open && (
        <div style={modalOverlayStyle} role="dialog" aria-modal="true">
          <div style={modalContentStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3>Scan Barcode untuk Check-in</h3>
              <button onClick={() => setOpen(false)}>Tutup</button>
            </div>

            <BarcodeScanner
              start={true}
              onSuccess={(code) => {
                handleSuccess(code);
                setOpen(false);
              }}
              onClose={() => setOpen(false)}
            />
          </div>
        </div>
      )}

      {lastBarcode && <p>Terakhir terbaca: {lastBarcode}</p>}
    </div>
  );
}

const modalOverlayStyle: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: "rgba(0,0,0,0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
};

const modalContentStyle: React.CSSProperties = {
  width: "95%",
  maxWidth: 720,
  background: "#fff",
  padding: 16,
  borderRadius: 8,
};
