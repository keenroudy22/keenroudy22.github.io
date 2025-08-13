const $ = (q, el=document)=>el.querySelector(q);
const $$ = (q, el=document)=>Array.from(el.querySelectorAll(q));

/* Year */
$("#year").textContent = new Date().getFullYear();

/* Mobile menu */
const toggle = $(".nav-toggle");
const list = $("#nav-list");
if (toggle) {
  toggle.addEventListener("click", ()=>{
    const expanded = toggle.getAttribute("aria-expanded")==="true";
    toggle.setAttribute("aria-expanded", String(!expanded));
    list.classList.toggle("show");
  });
}

/* Theme toggle */
$("#themeToggle")?.addEventListener("click", ()=>{
  document.body.classList.toggle("goldish");
});

/* PWA: service worker + install prompt */
if ("serviceWorker" in navigator) {
  window.addEventListener("load", ()=>{
    navigator.serviceWorker.register("./sw.js");
  });
}
let deferredPrompt;
window.addEventListener("beforeinstallprompt", (e)=>{
  e.preventDefault();
  deferredPrompt = e;
  $("#installBtn")?.removeAttribute("hidden");
});
$("#installBtn")?.addEventListener("click", async ()=>{
  if (deferredPrompt) {
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    $("#installBtn").setAttribute("hidden", "true");
  }
});

/* Apps loader (from data/apps.json) */
async function loadApps(){
  try{
    const res = await fetch("./data/apps.json", {cache:"no-store"});
    const apps = await res.json();
    const grid = $("#appsGrid");
    grid.innerHTML = "";
    for(const app of apps){
      const card = document.createElement("article");
      card.className = "card";
      card.innerHTML = `
        <div class="card-media"><div class="logo-chip">${app.emoji||"✨"}</div></div>
        <div class="card-body">
          <h3>${app.name}</h3>
          <p>${app.desc||""}</p>
          <a class="card-link" href="${app.href}" target="_blank" rel="noopener">Open</a>
        </div>`;
      grid.appendChild(card);
    }
  }catch(err){
    console.error("apps load failed", err);
    $("#appsGrid").innerHTML = "<p>Could not load apps. Edit <code>data/apps.json</code> to add yours.</p>";
  }
}
loadApps();

/* SKOL button = burst */
$("#skolButton")?.addEventListener("click", ()=>{
  const burst = document.createElement("div");
  burst.className = "skol-burst";
  burst.textContent = "SKOL!";
  document.body.appendChild(burst);
  const x = Math.random() * (window.innerWidth - 160) + 40;
  const y = Math.random() * (window.innerHeight - 200) + 80;
  burst.style.left = x + "px";
  burst.style.top = y + "px";
  setTimeout(()=>burst.remove(), 2000);
});
const extra = document.createElement("style");
extra.textContent = `
.skol-burst{
  position:fixed; z-index:9999; font-weight:800; color: var(--gold);
  font-size: clamp(20px, 6vw, 64px);
  transform: rotate(-6deg); text-shadow: 0 10px 24px rgba(0,0,0,.45);
  animation: fly 2s ease-out forwards;
}
@keyframes fly{
  from{ transform: translateY(0) rotate(-6deg); opacity:1 }
  to{ transform: translateY(-120px) rotate(6deg); opacity:0 }
}`;
document.head.appendChild(extra);

/* Vikings toys */
// Chant (simple metronome clap using WebAudio)
$("#chantBtn")?.addEventListener("click", ()=>{
  const ctx = new (window.AudioContext||window.webkitAudioContext)();
  let count = 0;
  const tempo = 85; // adjust if you like
  const interval = (60/tempo)*1000;
  const id = setInterval(()=>{
    // two claps, pause, repeat
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.value = (count%4===0 || count%4===1) ? 880 : 220;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.15, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.15);
    count++;
    if (count > 16) { clearInterval(id); }
  }, interval);
});

// Confetti
$("#confettiBtn")?.addEventListener("click", ()=>{
  for(let i=0;i<120;i++){
    const dot = document.createElement("div");
    dot.className = "confetti";
    dot.style.left = Math.random()*100 + "vw";
    dot.style.animationDuration = (2.5 + Math.random()*2.5) + "s";
    dot.style.background = (Math.random() > 0.5) ? "var(--purple)" : "var(--gold)";
    document.body.appendChild(dot);
    setTimeout(()=>dot.remove(), 6000);
  }
});
