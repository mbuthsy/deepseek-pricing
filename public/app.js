const PEAK_RANGES = [
  [1, 4],
  [6, 10],
];

const BASE_PRICES = {
  "cacheHit-flash": 0.007,
  "cacheHit-pro": 0.022,
  "cacheMiss-flash": 0.22,
  "cacheMiss-pro": 0.66,
  "output-flash": 0.66,
  "output-pro": 1.98,
};

function fmtPrice(v) {
  return "$" + v.toFixed(v < 0.01 ? 6 : v < 1 ? 4 : 2);
}

function renderPrices(peak) {
  const mult = peak ? 2 : 1;
  document.querySelectorAll("#priceTable td[data-k]").forEach((td) => {
    td.textContent = fmtPrice(BASE_PRICES[td.dataset.k] * mult);
  });
  document.getElementById("pricingTitle").textContent =
    (peak ? "Current PEAK Prices" : "Current Off-Peak Prices") + " (USD / 1M tokens)";
}

function isPeak(date) {
  const h = date.getUTCHours() + date.getUTCMinutes() / 60;
  return PEAK_RANGES.some(([start, end]) => h >= start && h < end);
}

function minutesUntilNextChange(date) {
  const nowMin = date.getUTCHours() * 60 + date.getUTCMinutes();
  const boundaries = [];
  PEAK_RANGES.forEach(([s, e]) => {
    boundaries.push(s * 60, e * 60);
  });
  boundaries.sort((a, b) => a - b);
  for (const b of boundaries) {
    if (b > nowMin) return b - nowMin;
  }
  return 24 * 60 - nowMin + boundaries[0];
}

function fmtCountdown(mins) {
  const totalSec = Math.floor(mins * 60);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

let lastPeakState = null;

function render() {
  const now = new Date();
  const peak = isPeak(now);

  const badge = document.getElementById("badge");
  const multiplier = document.getElementById("multiplier");

  badge.textContent = peak ? "PEAK" : "OFF-PEAK";
  badge.className = "badge " + (peak ? "peak" : "offpeak");
  multiplier.textContent = peak
    ? "Prices are 2× standard rate"
    : "Standard pricing in effect";

  renderPrices(peak);

  document.getElementById("localNow").textContent =
    "Local time: " + now.toLocaleString();
  document.getElementById("utcNow").textContent =
    "UTC time: " + now.toUTCString().replace("GMT", "UTC");

  const minsLeft =
    minutesUntilNextChange(now) - now.getUTCSeconds() / 60;
  document.getElementById("countdown").textContent =
    (peak ? "Off-peak begins in " : "Peak begins in ") + fmtCountdown(minsLeft);

  if (lastPeakState !== null && lastPeakState !== peak) {
    notify(peak);
  }
  lastPeakState = peak;
}

function notify(peak) {
  if (Notification.permission !== "granted") return;
  const title = peak ? "DeepSeek: Peak pricing started" : "DeepSeek: Off-peak pricing started";
  const body = peak
    ? "Prices are now 2× standard. Consider pausing heavy usage."
    : "Standard pricing resumed. Good time for heavy usage.";
  new Notification(title, { body });
}

const alertBtn = document.getElementById("alertBtn");
const alertStatus = document.getElementById("alertStatus");

function updateAlertUI() {
  if (!("Notification" in window)) {
    alertBtn.disabled = true;
    alertStatus.textContent = "Notifications not supported in this browser.";
    return;
  }
  if (Notification.permission === "granted") {
    alertBtn.disabled = true;
    alertBtn.textContent = "Alerts Enabled";
    alertStatus.textContent = "You'll be notified on each peak/off-peak switch (keep this tab open).";
  } else if (Notification.permission === "denied") {
    alertBtn.disabled = true;
    alertStatus.textContent = "Notifications blocked. Enable them in your browser settings.";
  }
}

alertBtn.addEventListener("click", async () => {
  const perm = await Notification.requestPermission();
  updateAlertUI();
  if (perm === "granted") notify(isPeak(new Date()));
});

updateAlertUI();
render();
setInterval(render, 1000);

let deferredPrompt = null;
const installBtn = document.getElementById("installBtn");
const installHint = document.getElementById("installHint");

const isStandalone =
  window.matchMedia("(display-mode: standalone)").matches ||
  window.navigator.standalone === true;

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installBtn.style.display = "block";
  installHint.textContent = "";
});

installBtn.addEventListener("click", async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  deferredPrompt = null;
  installBtn.style.display = "none";
  installHint.textContent = outcome === "accepted" ? "App installed." : "";
});

window.addEventListener("appinstalled", () => {
  installBtn.style.display = "none";
  installHint.textContent = "App installed.";
});

if (!isStandalone) {
  const ua = navigator.userAgent;
  const isIOS = /iphone|ipad|ipod/i.test(ua);
  const isSafari = isIOS || (/^((?!chrome|android).)*safari/i.test(ua));
  if (isIOS) {
    installHint.textContent = "To install: tap Share → Add to Home Screen.";
  } else if (isSafari) {
    installHint.textContent = "To install: File → Add to Dock (Safari).";
  } else if (!deferredPrompt) {
    installHint.textContent = "If no button appears, use your browser's Install icon in the address bar.";
  }
}
