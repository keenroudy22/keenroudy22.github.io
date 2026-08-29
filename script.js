document.documentElement.classList.add("js");

const navToggle = document.querySelector(".nav-toggle");
const nav = document.querySelector(".site-nav");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function closeNavigation() {
  nav?.classList.remove("open");
  navToggle?.setAttribute("aria-expanded", "false");
}

navToggle?.addEventListener("click", () => {
  const open = navToggle.getAttribute("aria-expanded") === "true";
  navToggle.setAttribute("aria-expanded", String(!open));
  nav?.classList.toggle("open", !open);
});

nav?.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeNavigation));
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeNavigation();
    navToggle?.focus();
  }
});

document.querySelector("#year").textContent = new Date().getFullYear();

const reveals = document.querySelectorAll(".reveal");
if (reduceMotion || !("IntersectionObserver" in window)) {
  reveals.forEach((element) => element.classList.add("visible"));
} else {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  reveals.forEach((element) => observer.observe(element));
}

async function loadNow() {
  const grid = document.querySelector("#now-grid");
  const updated = document.querySelector("#now-updated");
  if (!grid || !updated) return;

  try {
    const response = await fetch("./data/now.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`Status ${response.status}`);
    const items = await response.json();
    if (!Array.isArray(items) || items.length === 0) throw new Error("No scoreboard items");

    const fragment = document.createDocumentFragment();
    items.forEach((item) => {
      if (!item?.label || !item?.value) return;
      const card = document.createElement("article");
      const label = document.createElement("span");
      const value = document.createElement("strong");
      label.textContent = item.label;
      value.textContent = item.value;
      card.append(label, value);
      fragment.append(card);
    });

    if (!fragment.childNodes.length) throw new Error("No valid scoreboard items");
    grid.replaceChildren(fragment);

    document.querySelectorAll(".wire-group").forEach((group) => {
      const wireFragment = document.createDocumentFragment();
      items.forEach((item) => {
        if (!item?.label || !item?.value) return;
        const update = document.createElement("span");
        const label = document.createElement("b");
        label.textContent = item.label.toUpperCase();
        update.append(label, document.createTextNode(` ${item.value}`));
        wireFragment.append(update);
      });
      group.replaceChildren(wireFragment);
    });

    const latest = items.find((item) => item.updated)?.updated;
    if (latest) updated.textContent = `Updated ${latest}`;
  } catch (error) {
    console.info("Using the built-in scoreboard snapshot.", error);
  }
}
loadNow();

function celebrateSkol() {
  const shout = document.createElement("p");
  shout.className = "skol-shout";
  shout.textContent = "SKOL!";
  document.body.append(shout);
  window.setTimeout(() => shout.remove(), 850);

  if (reduceMotion) return;
  const colors = ["#f5c451", "#4d2c7a", "#fff8e9"];
  for (let index = 0; index < 70; index += 1) {
    const piece = document.createElement("span");
    piece.className = "confetti";
    piece.style.left = `${Math.random() * 100}vw`;
    piece.style.background = colors[index % colors.length];
    piece.style.setProperty("--fall-time", `${2.4 + Math.random() * 2}s`);
    piece.style.setProperty("--drift", `${-80 + Math.random() * 160}px`);
    piece.style.transform = `rotate(${Math.random() * 180}deg)`;
    document.body.append(piece);
    window.setTimeout(() => piece.remove(), 4700);
  }
}
document.querySelector("#skol-button")?.addEventListener("click", celebrateSkol);

// Retire the old cache-first PWA without keeping an installable app on this site.
if ("serviceWorker" in navigator && !localStorage.getItem("kr-sw-cleanup-v1")) {
  window.addEventListener("load", async () => {
    try {
      await navigator.serviceWorker.register("./sw.js", { updateViaCache: "none" });
      if ("caches" in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((key) => caches.delete(key)));
      }
      localStorage.setItem("kr-sw-cleanup-v1", "complete");
    } catch (error) {
      console.info("Legacy cache cleanup will retry on the next visit.", error);
    }
  });
}
