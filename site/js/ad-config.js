/*
 * Ad configuration — the only file you need to edit to turn ads on.
 *
 * 1. Set `adsenseClient` to your publisher ID, e.g. "ca-pub-1234567890123456".
 * 2. For each slot, paste the numeric ad unit ID from AdSense → Ads → By ad unit.
 * 3. To sell a slot directly instead, put your creative's HTML in `html`.
 *    `html` always wins over AdSense for that slot.
 *
 * Slots with no AdSense ID and no `html` show a labelled placeholder,
 * so you can see every position while the site is waiting for approval.
 */
window.AD_CONFIG = {
  adsenseClient: "", // "ca-pub-XXXXXXXXXXXXXXXX"

  slots: {
    "top-banner":     { adsenseSlot: "", format: "horizontal", size: "728 × 90",  html: "" },
    "rail-left":      { adsenseSlot: "", format: "vertical",   size: "160 × 600", html: "" },
    "rail-right":     { adsenseSlot: "", format: "vertical",   size: "300 × 600", html: "" },
    "tile-1":         { adsenseSlot: "", format: "rectangle",  size: "300 × 250", html: "" },
    "tile-2":         { adsenseSlot: "", format: "rectangle",  size: "300 × 250", html: "" },
    "tile-3":         { adsenseSlot: "", format: "rectangle",  size: "300 × 250", html: "" },
    "tile-4":         { adsenseSlot: "", format: "rectangle",  size: "300 × 250", html: "" },
    "tile-5":         { adsenseSlot: "", format: "rectangle",  size: "300 × 250", html: "" },
    "tile-6":         { adsenseSlot: "", format: "rectangle",  size: "300 × 250", html: "" },
    "in-article":     { adsenseSlot: "", format: "fluid",      size: "Responsive", html: "", layout: "in-article" },
    "footer-banner":  { adsenseSlot: "", format: "horizontal", size: "728 × 90",  html: "" },
    "video-corner":   { adsenseSlot: "", format: "rectangle",  size: "320 × 180", html: "" },
    "interstitial":   { adsenseSlot: "", format: "rectangle",  size: "336 × 280", html: "" }
  },

  // Floating box in the bottom-right corner.
  videoCorner: {
    enabled: true,
    showAfterSeconds: 4
  },

  // Full-screen overlay. Shown at most once per visit.
  interstitial: {
    enabled: true,
    showAfterSeconds: 25,     // or after the visitor's second calculation, whichever comes first
    closeAfterSeconds: 5,     // countdown before the close button works
    oncePerSession: true
  }
};
