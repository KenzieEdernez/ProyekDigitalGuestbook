import React, { useEffect, useState } from "react";
import { dedupeById } from "../utils/dedupe";

type Souvenir = { id: string; title: string };

export default function SouvenirPage() {
  const [souvenirs, setSouvenirs] = useState<Souvenir[]>([]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await fetch("/api/souvenirs");
        if (!res.ok) return;
        const data: Souvenir[] = await res.json();
        if (!mounted) return;
        setSouvenirs(prev => dedupeById<Souvenir>([...prev, ...data]));
      } catch (err) {
        console.error("Failed to load souvenirs", err);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  return (
    <div>
      <h2>Souvenir</h2>
      {souvenirs.map(s => <div key={s.id}>{s.title}</div>)}
    </div>
  );
}
