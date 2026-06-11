"use client";

import { useEffect, useState } from "react";

function format(tz: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: tz,
  }).format(new Date());
}

/** Live local clock for the given IANA timezone. Renders nothing until mounted. */
export function LocalTime({ timezone }: { timezone: string }) {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const tick = () => setTime(format(timezone));
    tick();
    const id = setInterval(tick, 1000 * 15);
    return () => clearInterval(id);
  }, [timezone]);

  return (
    <span className="tabular-nums" suppressHydrationWarning>
      {time ?? "--:--"} <span className="text-faint">IST</span>
    </span>
  );
}
