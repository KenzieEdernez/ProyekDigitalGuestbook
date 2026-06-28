import { useEffect, useRef } from "react";

/**
 * Menjalankan effect hanya sekali per lifecycle pada client, walau StrictMode mem-mount dua kali di dev.
 * Gunakan untuk side-effect non-idempotent (mis. mengirim data ke server).
 */
export function useSingleEffect(effect: () => void | (() => void), deps: any[]) {
  const calledRef = useRef(false);
  useEffect(() => {
    if (calledRef.current) return;
    calledRef.current = true;
    return effect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
