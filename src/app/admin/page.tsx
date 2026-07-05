"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  UserCheck,
  Gift,
  TrendingUp,
  Check,
} from "lucide-react";
import AdminShell from "@/components/layout/AdminShell";
import type { Guest, GuestStats } from "@/types/guest";
import { formatRegNumber } from "@/lib/event-config";
import { useEventSettings } from "@/hooks/useEventSettings";

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  accent = "text-navy",
  bar,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  accent?: string;
  bar?: number;
}) {
  return (
    <div className="card-premium p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">
            {label}
          </p>
          <p className={`mt-2 font-serif text-4xl font-bold ${accent}`}>
            {value}
          </p>
          {sub && (
            <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
              {sub}
            </p>
          )}
        </div>
        <div className="rounded-lg bg-parchment p-3 dark:bg-navy-700">
          <Icon className="h-5 w-5 text-royal" />
        </div>
      </div>
      {bar !== undefined && (
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-stone-100 dark:bg-navy-700">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all"
            style={{ width: `${Math.min(bar, 100)}%` }}
          />
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const eventSettings = useEventSettings();
  const [guests, setGuests] = useState<Guest[]>([]);
  const [stats, setStats] = useState<GuestStats | null>(null);

  const fetchData = useCallback(async () => {
    const res = await fetch("/api/guests");
    const data = await res.json();
    setGuests(data.guests);
    setStats(data.stats);
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const pendingGuests = guests.filter((g) => g.status === "pending");
  const recentActivity = guests
    .filter((g) => g.checked_in_at || g.souvenir_claimed_at)
    .sort((a, b) => {
      const ta = a.souvenir_claimed_at || a.checked_in_at || "";
      const tb = b.souvenir_claimed_at || b.checked_in_at || "";
      return tb.localeCompare(ta);
    })
    .slice(0, 6);

  const attendRate =
    stats && stats.total > stats.declined
      ? Math.round(
          ((stats.total - stats.declined) / (stats.total || 1)) * 100
        )
      : 0;

  const checkInRate =
    stats && stats.pending + stats.checked_in + stats.souvenir_claimed > 0
      ? Math.round(
          ((stats.checked_in + stats.souvenir_claimed) /
            (stats.pending + stats.checked_in + stats.souvenir_claimed)) *
            100
        )
      : 0;

  const souvenirRate =
    stats && stats.checked_in + stats.souvenir_claimed > 0
      ? Math.round(
          (stats.souvenir_claimed /
            (stats.checked_in + stats.souvenir_claimed)) *
            100
        )
      : 0;

  const hourlyData = buildHourlyChart(guests);

  return (
    <AdminShell
      title="Event Overview"
      subtitle={`Real-time monitoring untuk ${eventSettings.name}`}
    >
      {stats && (
        <div className="mb-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total Guests"
            value={stats.total - stats.declined}
            sub={`${attendRate}% RSVP`}
            icon={Users}
          />
          <StatCard
            label="Checked-in Guests"
            value={stats.checked_in + stats.souvenir_claimed}
            sub={`${stats.total_pax_checked_in} pax`}
            icon={UserCheck}
            accent="text-emerald-600"
            bar={checkInRate}
          />
          <StatCard
            label="Souvenirs Collected"
            value={stats.souvenir_claimed}
            sub={`${souvenirRate}% distribusi`}
            icon={Gift}
            accent="text-royal"
            bar={souvenirRate}
          />
          <StatCard
            label="Waiting for Check-in"
            value={stats.pending}
            sub="Not arrived yet"
            icon={TrendingUp}
            accent="text-amber-600"
          />
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="card-premium xl:col-span-2 p-6">
          <h2 className="font-serif text-xl font-bold text-navy dark:text-stone-100">
            Arrival Trend
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Guest check-in pace throughout the event
          </p>
          <div className="mt-8 flex h-48 items-end gap-2">
            {hourlyData.map(({ hour, count }) => (
              <div key={hour} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className="w-full rounded-t bg-navy/80 transition-all hover:bg-royal dark:bg-royal/70 dark:hover:bg-royal"
                  style={{
                    height: `${Math.max(8, (count / Math.max(...hourlyData.map((h) => h.count), 1)) * 160)}px`,
                  }}
                />
                <span className="text-[10px] text-stone-400">{hour}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card-premium p-6">
          <h2 className="font-serif text-xl font-bold text-navy dark:text-stone-100">
            Live Activity
          </h2>
          <div className="mt-4 space-y-4">
            {recentActivity.length === 0 ? (
              <p className="text-sm text-stone-400 dark:text-stone-500">No activity yet</p>
            ) : (
              recentActivity.map((g) => (
                <div key={g.id} className="flex items-center gap-3">
                  <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-parchment dark:bg-navy-700">
                    {g.photo_url ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={g.photo_url}
                        alt={g.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs font-bold text-royal">
                        {g.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-navy dark:text-stone-100">
                      {g.name}
                    </p>
                    <p className="text-xs text-stone-400">
                      {g.status === "souvenir_claimed"
                        ? "Souvenir diambil"
                        : "Check-in"}{" "}
                      ·{" "}
                      {new Date(
                        g.souvenir_claimed_at || g.checked_in_at!
                      ).toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="card-premium mt-6 overflow-hidden">
        <div className="flex items-center justify-between border-b border-stone-100 px-6 py-4 dark:border-stone-700">
          <div>
            <h2 className="font-serif text-xl font-bold text-navy dark:text-stone-100">
              Guests Waiting for Check-in
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Registered guests who have not arrived yet
            </p>
          </div>
          <Link href="/admin/guests" className="text-xs font-semibold text-royal hover:underline">
            Lihat Semua →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 text-left dark:bg-navy-900/50">
              <tr>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-stone-400">
                  Name
                </th>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-stone-400">
                  No. Reg
                </th>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-stone-400">
                  Pax
                </th>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-stone-400">
                  Daftar
                </th>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-stone-400">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {pendingGuests.slice(0, 5).map((g) => (
                <tr key={g.id} className="border-t border-stone-50 dark:border-stone-800">
                  <td className="px-6 py-4 font-medium text-navy dark:text-stone-100">
                    {g.name}
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-stone-500 dark:text-stone-400">
                    {formatRegNumber(g.invitation_barcode)}
                  </td>
                  <td className="px-6 py-4">{g.pax}</td>
                  <td className="px-6 py-4 text-stone-500 dark:text-stone-400">
                    {new Date(g.created_at).toLocaleString("id-ID", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      href="/check-in"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:underline"
                    >
                      <Check className="h-3.5 w-3.5" /> Check-in
                    </Link>
                  </td>
                </tr>
              ))}
              {pendingGuests.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-stone-400 dark:text-stone-500">
                    All guests have checked in
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
}

function buildHourlyChart(guests: Guest[]) {
  const hours = ["16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00"];
  const counts: Record<string, number> = {};
  hours.forEach((h) => (counts[h] = 0));

  guests.forEach((g) => {
    if (!g.checked_in_at) return;
    const d = new Date(g.checked_in_at);
    const h = `${String(d.getHours()).padStart(2, "0")}:00`;
    const nearest = hours.reduce((prev, curr) => {
      const ph = parseInt(prev);
      const ch = parseInt(curr);
      const gh = d.getHours();
      return Math.abs(ch - gh) < Math.abs(ph - gh) ? curr : prev;
    });
    counts[nearest] = (counts[nearest] || 0) + 1;
  });

  return hours.map((hour) => ({ hour, count: counts[hour] || 0 }));
}
