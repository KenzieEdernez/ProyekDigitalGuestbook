"use client";

import { useState } from "react";
import Link from "next/link";
import { Upload, Plus } from "lucide-react";
import * as XLSX from "xlsx";
import AdminShell from "@/components/layout/AdminShell";
import type { ImportGuestRow } from "@/types/guest";

export default function ImportPage() {
  const [preview, setPreview] = useState<ImportGuestRow[]>([]);
  const [result, setResult] = useState<{
    imported: number;
    skipped: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parseFile = (file: File) => {
    setError(null);
    setResult(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);

        const guests: ImportGuestRow[] = rows.map((row) => ({
          name: String(
            row["Nama"] || row["nama"] || row["Name"] || row["name"] || ""
          ),
          pax: Number(
            row["Pax"] || row["pax"] || row["Jumlah"] || row["jumlah"] || 1
          ),
          address: String(row["Alamat"] || row["address"] || "").trim() || undefined,
          phone: String(row["HP"] || row["phone"] || "").trim() || undefined,
          invitation_barcode:
            String(
              row["Barcode"] ||
                row["barcode"] ||
                row["Barcode Undangan"] ||
                ""
            ).trim() || undefined,
        }));

        const valid = guests.filter((g) => g.name.trim());
        if (valid.length === 0) {
          setError("Tidak ada data valid. Pastikan kolom 'Nama' ada.");
          return;
        }
        setPreview(valid);
      } catch {
        setError("Gagal membaca file Excel.");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleImport = async () => {
    if (preview.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guests: preview }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Import gagal.");
        return;
      }
      setResult(data);
      setPreview([]);
    } catch {
      setError("Gagal terhubung ke server.");
    } finally {
      setLoading(false);
    }
  };

  const addRow = () => setPreview([...preview, { name: "", pax: 1 }]);

  const updateRow = (
    i: number,
    field: keyof ImportGuestRow,
    value: string | number
  ) => {
    const updated = [...preview];
    updated[i] = { ...updated[i], [field]: value };
    setPreview(updated);
  };

  return (
    <AdminShell
      title="Import & Quick Entry"
      subtitle="Tambah tamu manual atau import dari Excel"
    >
      {error && (
        <div className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {result && (
        <div className="mb-6 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Import selesai: <strong>{result.imported}</strong> berhasil,{" "}
          <strong>{result.skipped}</strong> dilewati.{" "}
          <Link href="/admin/guests" className="underline">
            Lihat daftar tamu →
          </Link>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card-premium p-6">
          <div className="flex items-center gap-3">
            <Upload className="h-5 w-5 text-royal" />
            <h2 className="font-serif text-lg font-bold text-navy">
              Upload Excel
            </h2>
          </div>
          <p className="mt-2 text-sm text-stone-500">
            Kolom: Nama (wajib), Pax, Alamat, HP, Barcode (opsional)
          </p>
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) parseFile(f);
            }}
            className="mt-4 block w-full text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-parchment file:px-4 file:py-2 file:text-sm file:font-semibold file:text-navy"
          />
        </div>

        <div className="card-premium p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-lg font-bold text-navy">
              Manual Entry
            </h2>
            <button
              onClick={addRow}
              className="inline-flex items-center gap-1 text-sm text-royal hover:underline"
            >
              <Plus className="h-4 w-4" /> Tambah
            </button>
          </div>

          {preview.length === 0 ? (
            <p className="mt-8 text-center text-sm text-stone-400">
              Upload Excel atau tambah tamu manual
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {preview.map((row, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    placeholder="Nama"
                    value={row.name}
                    onChange={(e) => updateRow(i, "name", e.target.value)}
                    className="input-field flex-1"
                  />
                  <input
                    type="number"
                    min={1}
                    value={row.pax}
                    onChange={(e) =>
                      updateRow(i, "pax", parseInt(e.target.value) || 1)
                    }
                    className="input-field w-16"
                  />
                  <button
                    onClick={() =>
                      setPreview(preview.filter((_, j) => j !== i))
                    }
                    className="px-2 text-red-400"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                onClick={handleImport}
                disabled={loading}
                className="btn-navy mt-4 w-full py-3"
              >
                {loading
                  ? "Mengimport..."
                  : `Import ${preview.filter((r) => r.name.trim()).length} Tamu`}
              </button>
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
