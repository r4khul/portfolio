"use client";

import { useEffect, useRef } from "react";
import { getCalApi } from "@calcom/embed-react";
import { useTheme } from "next-themes";

export function CalEmbed() {
  const { resolvedTheme } = useTheme();
  const calRef = useRef<Awaited<ReturnType<typeof getCalApi>> | null>(null);

  useEffect(() => {
    let isMounted = true;

    (async function () {
      if (!calRef.current) {
        calRef.current = await getCalApi({ namespace: "meet" });
      }

      if (!isMounted || !calRef.current) return;

      const isDark = resolvedTheme === "dark";

      calRef.current("ui", {
        theme: isDark ? "dark" : "light",
        hideEventTypeDetails: false,
        layout: "month_view",
      });

      if (isDark) {
        document.documentElement.style.colorScheme = "dark";
      } else {
        document.documentElement.style.colorScheme = "light";
        // Force light-theme values for Cal's inline style overrides to prevent dark theme leaks
        document.documentElement.style.setProperty("--cal-brand", "#18181b");
        document.documentElement.style.setProperty("--cal-brand-emphasis", "#52525b");
        document.documentElement.style.setProperty("--cal-brand-subtle", "#a1a1aa");
        document.documentElement.style.setProperty("--cal-brand-text", "#fcfcfc");
        document.documentElement.style.setProperty("--cal-brand-accent", "#18181b");
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [resolvedTheme]);

  return null;
}
