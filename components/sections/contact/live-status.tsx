"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { ContactContent } from "./contact.config";

type Hours = ContactContent["hours"];
type Status = { time: string; open: boolean };

const DAY_INDEX: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

function read(hours: Hours): Status {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: hours.timeZone,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const get = (t: string): string => parts.find((p) => p.type === t)?.value ?? "";
  const h = Number(get("hour")) % 24;
  const m = Number(get("minute"));
  const day = DAY_INDEX[get("weekday")] ?? 0;
  const open = hours.days.includes(day) && h >= hours.open && h < hours.close;
  return { time: `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`, open };
}

/**
 * The studio's real local time and whether the team is in right now.
 * Rendered after mount only (no clock in the server HTML), refreshed every 15s.
 */
export function LiveStatus({ hours, className }: { hours: Hours; className?: string }) {
  const [s, setS] = useState<Status | null>(null);

  useEffect(() => {
    const tick = (): void => setS(read(hours));
    tick();
    const id = window.setInterval(tick, 15_000);
    return () => window.clearInterval(id);
  }, [hours]);

  return (
    <p className={cn("flex items-center gap-3 whitespace-nowrap text-[0.95rem] text-white/70", className)} aria-live="polite">
      <span aria-hidden className="relative flex size-2">
        <span
          className={cn(
            "absolute inset-0 rounded-full motion-reduce:animate-none",
            s?.open ? "animate-ping bg-[#2cf5b0]/60" : "bg-transparent",
          )}
        />
        <span className={cn("relative size-2 rounded-full transition-colors duration-500", s?.open ? "bg-[#2cf5b0]" : "bg-white/30")} />
      </span>
      <span>
        <span className="tabular-nums text-white" suppressHydrationWarning>
          {s?.time ?? "--:--"}
        </span>{" "}
        in {hours.zoneLabel}
        <span className="text-white/45"> · {s ? (s.open ? "Studio open" : "Studio closed") : hours.label}</span>
      </span>
    </p>
  );
}
