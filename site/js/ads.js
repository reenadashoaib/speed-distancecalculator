/*
 * Fills every [data-ad] element from AD_CONFIG and runs the corner box
 * and the full-screen overlay. No edits needed here — see ad-config.js.
 */
(function () {
  "use strict";

  var config = window.AD_CONFIG || { slots: {} };
  var client = (config.adsenseClient || "").trim();
  var scriptLoaded = false;

  function storageGet(key) {
    try { return window.sessionStorage.getItem(key); } catch (e) { return null; }
  }
  function storageSet(key, value) {
    try { window.sessionStorage.setItem(key, value); } catch (e) { /* private mode */ }
  }

  function loadAdSense() {
    if (scriptLoaded || !client) return;
    scriptLoaded = true;
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=" + encodeURIComponent(client);
    s.crossOrigin = "anonymous";
    document.head.appendChild(s);
  }

  function placeholder(el, slot) {
    el.classList.add("ad-slot--empty");
    el.innerHTML =
      '<span class="ad-ph-size">' + (slot.size || "") + "</span>" +
      '<span class="ad-ph-name">' + el.getAttribute("data-ad").replace(/-/g, " ") + "</span>";
  }

  function fill(el) {
    if (el.getAttribute("data-ad-filled")) return;
    var name = el.getAttribute("data-ad");
    var slot = config.slots[name] || {};

    // AdSense cannot size a unit inside a hidden container; try again when it becomes visible.
    if (!slot.html && el.offsetWidth === 0) return;
    el.setAttribute("data-ad-filled", "1");

    if (slot.html) {
      el.innerHTML = slot.html;
      return;
    }
    if (!client || !slot.adsenseSlot) {
      placeholder(el, slot);
      return;
    }

    loadAdSense();
    var ins = document.createElement("ins");
    ins.className = "adsbygoogle";
    ins.style.display = "block";
    ins.setAttribute("data-ad-client", client);
    ins.setAttribute("data-ad-slot", slot.adsenseSlot);
    if (slot.layout) {
      ins.setAttribute("data-ad-layout", slot.layout);
      ins.style.textAlign = "center";
    }
    ins.setAttribute("data-ad-format", slot.format || "auto");
    if (slot.format === "horizontal" || slot.format === "auto") {
      ins.setAttribute("data-full-width-responsive", "true");
    }
    el.appendChild(ins);
    try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (e) { /* blocked */ }
  }

  function fillAll() {
    var slots = document.querySelectorAll("[data-ad]");
    for (var i = 0; i < slots.length; i++) fill(slots[i]);
  }

  /* ---------- Bottom-right corner box ---------- */

  function setupCorner() {
    var box = document.getElementById("ad-corner");
    var opts = config.videoCorner || {};
    if (!box) return;
    if (!opts.enabled || storageGet("adCornerClosed")) { box.remove(); return; }

    setTimeout(function () {
      box.hidden = false;
      fill(box.querySelector("[data-ad]"));
    }, (opts.showAfterSeconds || 0) * 1000);

    box.querySelector(".ad-corner-close").addEventListener("click", function () {
      box.remove();
      storageSet("adCornerClosed", "1");
    });
  }

  /* ---------- Full-screen overlay ---------- */

  var overlay, overlayShown = false;

  function showOverlay() {
    var opts = config.interstitial || {};
    if (!overlay || overlayShown) return;
    if (opts.oncePerSession && storageGet("adOverlaySeen")) return;
    overlayShown = true;
    storageSet("adOverlaySeen", "1");

    var closeBtn = overlay.querySelector(".ad-overlay-close");
    var counter = overlay.querySelector(".ad-overlay-count");
    var remaining = opts.closeAfterSeconds || 0;
    var lastFocus = document.activeElement;

    function close() {
      if (closeBtn.disabled) return;
      overlay.hidden = true;
      document.body.classList.remove("has-overlay");
      document.removeEventListener("keydown", onKey);
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }
    function onKey(e) {
      if (e.key === "Escape") close();
      if (e.key === "Tab") { e.preventDefault(); closeBtn.focus(); }
    }
    function tick() {
      if (remaining > 0) {
        counter.textContent = "Close in " + remaining;
        remaining--;
        setTimeout(tick, 1000);
      } else {
        closeBtn.disabled = false;
        counter.textContent = "Close";
      }
    }

    overlay.hidden = false;
    document.body.classList.add("has-overlay");
    fill(overlay.querySelector("[data-ad]"));
    closeBtn.disabled = true;
    closeBtn.addEventListener("click", close);
    overlay.addEventListener("click", function (e) { if (e.target === overlay) close(); });
    document.addEventListener("keydown", onKey);
    closeBtn.focus();
    tick();
  }

  function setupOverlay() {
    var opts = config.interstitial || {};
    overlay = document.getElementById("ad-overlay");
    if (!overlay) return;
    if (!opts.enabled) { overlay.remove(); overlay = null; return; }
    setTimeout(showOverlay, (opts.showAfterSeconds || 0) * 1000);

    var calculations = 0;
    document.addEventListener("calculator:result", function () {
      calculations++;
      if (calculations === 2) setTimeout(showOverlay, 600);
    });
  }

  function init() {
    fillAll();
    setupCorner();
    setupOverlay();
    var resizeTimer;
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(fillAll, 250);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
