import React, { useEffect, useState } from "react";
import { dedupeById, HasId } from "../utils/dedupe";
import ScanOverlay from "../components/ScanOverlay";

type CheckinItem = HasId & { name: string };

export default function CheckinPage() {
  const [items, setItems] = useState<CheckinItem[]>([]);
  const [scanSize, setScanSize] = useState({ width: 360, height: 600 });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // jika sudah loaded, jangan load lagi (prevent double fetch)
    if (loaded) return;

    let mounted = true;
    async function load() {
      try {
        const res = await fetch("/api/checkin-items");
        if (!res.ok) return;
        const data: CheckinItem[] = await res.json();
        if (!mounted) return;
        setItems(data);
        setLoaded(true);
      } catch (err) {
        console.error("Failed to load checkin items", err);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [loaded]);

  return (
    <div style={{ position: "relative", minHeight: 600 }}>
      {/* video/canvas scanner di sini */}
      <div id="scanner-area">{/* existing scanner implementation */}</div>

      {/* Overlay di atas scanner */}
      <ScanOverlay width={scanSize.width} height={scanSize.height} />

      {/* list checkin */}
      <div>
        <h2>Checkin</h2>
        {items.map(i => <div key={i.id}>{i.name}</div>)}
      </div>
    </div>
  );
}
