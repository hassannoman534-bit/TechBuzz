"use client";

import { useEffect, useState } from "react";

/**
 * Live local time for the studio. Rendered only after mount, so the server and client
 * HTML always match (no hydration mismatch from clocks).
 */
export function LocalTime({ timeZone, zoneLabel }: { timeZone: string; zoneLabel: string }) {
  const [now, setNow] = useState<string | null>(null);

  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-GB", { timeZone, hour: "2-digit", minute: "2-digit", hour12: false });
    const tick = (): void => setNow(fmt.format(new Date()));
    tick();
    const id = window.setInterval(tick, 15_000);
    return () => window.clearInterval(id);
  }, [timeZone]);

  return (
    <span className="tabular-nums">
      <span suppressHydrationWarning>{now ?? "--:--"}</span> {zoneLabel}
    </span>
  );
}
