// ============================================================
// WolfNetwork — Iceboat Racing
// ============================================================

// ---------- Navbar: fundo ao rolar ----------
const navbar = document.getElementById("navbar");
window.addEventListener("scroll", () => {
  navbar.classList.toggle("scrolled", window.scrollY > 40);
});

// ---------- Menu mobile ----------
const hamburger = document.getElementById("hamburger");
const navLinks = document.getElementById("navLinks");
hamburger.addEventListener("click", () => navLinks.classList.toggle("open"));
navLinks.querySelectorAll("a").forEach((link) =>
  link.addEventListener("click", () => navLinks.classList.remove("open"))
);

// ---------- Copiar IP ----------
document.querySelectorAll(".copy-ip").forEach((btn) => {
  btn.addEventListener("click", async () => {
    const ip = btn.dataset.ip;
    try {
      await navigator.clipboard.writeText(ip);
    } catch {
      const tmp = document.createElement("textarea");
      tmp.value = ip;
      document.body.appendChild(tmp);
      tmp.select();
      document.execCommand("copy");
      tmp.remove();
    }
    btn.classList.add("copied");
    setTimeout(() => btn.classList.remove("copied"), 1600);
  });
});

// ---------- Contador de jogadores (animado) ----------
const statPlayers = document.getElementById("statPlayers");
const targetPlayers = 347;
let current = 0;
const observer = new IntersectionObserver(
  (entries) => {
    if (!entries[0].isIntersecting) return;
    observer.disconnect();
    const tick = () => {
      current += Math.max(1, Math.ceil((targetPlayers - current) / 20));
      if (current >= targetPlayers) {
        statPlayers.textContent = targetPlayers;
        return;
      }
      statPlayers.textContent = current;
      requestAnimationFrame(tick);
    };
    tick();
  },
  { threshold: 0.4 }
);
observer.observe(statPlayers);

// ---------- Countdown para as finais (último domingo do mês, 20h BRT) ----------
function nextFinalDate() {
  const now = new Date();
  // Fuso BRT = UTC-3
  const brt = new Date(now.getTime() + now.getTimezoneOffset() * 60000);
  const year = brt.getFullYear();
  const month = brt.getMonth();
  // Último dia do mês
  const lastDay = new Date(year, month + 1, 0).getDate();
  let sunday = null;
  for (let d = lastDay; d > lastDay - 7; d--) {
    if (new Date(year, month, d).getDay() === 0) {
      sunday = d;
      break;
    }
  }
  // 20h BRT -> 23h UTC
  const final = new Date(Date.UTC(year, month, sunday, 23, 0, 0));
  if (final <= now) {
    const nm = month + 1;
    const nlLast = new Date(year, nm + 1, 0).getDate();
    let nsun = null;
    for (let d = nlLast; d > nlLast - 7; d--) {
      if (new Date(year, nm, d).getDay() === 0) {
        nsun = d;
        break;
      }
    }
    return new Date(Date.UTC(year, nm, nsun, 23, 0, 0));
  }
  return final;
}

const cdDays = document.getElementById("cdDays");
const cdHours = document.getElementById("cdHours");
const cdMins = document.getElementById("cdMins");
const cdSecs = document.getElementById("cdSecs");

function pad(n) {
  return String(n).padStart(2, "0");
}

function updateCountdown() {
  const diff = Math.max(0, nextFinalDate() - Date.now());
  const s = Math.floor(diff / 1000);
  cdDays.textContent = pad(Math.floor(s / 86400));
  cdHours.textContent = pad(Math.floor((s % 86400) / 3600));
  cdMins.textContent = pad(Math.floor((s % 3600) / 60));
  cdSecs.textContent = pad(s % 60);
}
updateCountdown();
setInterval(updateCountdown, 1000);

// ---------- Reveal on scroll ----------
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);
document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));
