"use client";

import { useEffect } from "react";
import { getCalApi } from "@calcom/embed-react";

export function CalEmbed() {
  useEffect(() => {
    let calInstance: Awaited<ReturnType<typeof getCalApi>> | null = null;

    const applyThemeStyles = (isDark: boolean) => {
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
    };

    const updateCalTheme = (isDark: boolean) => {
      if (calInstance) {
        calInstance("ui", {
          theme: isDark ? "dark" : "light",
          hideEventTypeDetails: false,
          layout: "month_view",
        });
      }
      applyThemeStyles(isDark);
    };

    (async function () {
      calInstance = await getCalApi({ namespace: "meet" });
      const isDark = document.documentElement.classList.contains("dark");
      updateCalTheme(isDark);
    })();

    // Monitor both html class and inline style changes in real-time
    const observer = new MutationObserver(() => {
      // Temporarily disconnect observer to prevent infinite feedback loop during style updates
      observer.disconnect();

      const isDark = document.documentElement.classList.contains("dark");
      updateCalTheme(isDark);

      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["class", "style"],
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "style"],
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  return null;
}
