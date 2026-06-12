import { memo } from "react";

/**
 * StripeBar — replaces the header space with a decorative diagonal-stripe band.
 * Uses the same repeating-linear-gradient motif as the contact card's `.hatch` class
 * but with a denser cadence and a subtle border-bottom for structural grounding.
 */
export const StripeBar = memo(() => {
  return (
    <div
      aria-hidden
      className="stripe-bar relative h-16 w-full overflow-hidden border-b border-edge"
    >
      {/* Primary stripe layer — tight diagonal lines */}
      <div className="stripe-bar__pattern absolute inset-0" />
      {/* Fade vignette — left and right edges dissolve into background */}
      <div className="stripe-bar__vignette absolute inset-0" />
    </div>
  );
});

StripeBar.displayName = "StripeBar";
