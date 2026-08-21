// ============================================================
// WolfNetwork — Iceboat Racing
// ============================================================

// ---------- Navbar + menu mobile ----------
const navbar = document.getElementById("navbar");
const hamburger = document.getElementById("hamburger");
const navLinks = document.getElementById("navLinks");

window.addEventListener("scroll", () => {
  navbar.classList.toggle("scrolled", window.scrollY > 24);
}, { passive: true });

hamburger.addEventListener("click", () => {
  navLinks.classList.toggle("open");
  hamburger.classList.toggle("open");
});
navLinks.querySelectorAll("a").forEach((link) =>
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    hamburger.classList.remove("open");
  })
);

// ---------- Copiar IP ----------
document.querySelectorAll(".copy-ip").forEach((btn) => {
  btn.addEventListener("click", async (e) => {
    e.preventDefault();
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
    setTimeout(() => btn.classList.remove("copied"), 1500);
  });
});

// ---------- Contadores animados ----------
function animateTo(el, target) {
  const start = performance.now();
  const duration = 900;
  function frame(now) {
    const t = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = Math.round(target * eased).toLocaleString("pt-BR");
    if (t < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      counterObserver.unobserve(entry.target);
      animateTo(entry.target, parseInt(entry.target.dataset.count, 10));
    });
  },
  { threshold: 0.5 }
);
document.querySelectorAll("[data-count]").forEach((el) => counterObserver.observe(el));

// ---------- Status ao vivo (mcstatus.io) ----------
const statusDot = document.getElementById("statusDot");
const statusText = document.getElementById("statusText");
const playersEl = document.querySelector("[data-live='players']");

(async () => {
  try {
    const res = await fetch(
      "https://api.mcstatus.io/v2/status/java/wolfnetwork.com.br",
      { signal: AbortSignal.timeout(8000) }
    );
    const data = await res.json();
    if (data.online) {
      statusDot.classList.add("online");
      const n = data.players?.online ?? 0;
      statusText.innerHTML = `Servidor online — <b>${n} jogador${n === 1 ? "" : "es"} agora</b>`;
      if (playersEl) {
        playersEl.dataset.count = Math.max(n, 1);
        playersEl.textContent = "0";
        counterObserver.observe(playersEl);
      }
    } else {
      statusDot.classList.add("offline");
      statusText.textContent = "Servidor offline no momento";
    }
  } catch {
    statusDot.classList.add("online");
    statusText.innerHTML = "Servidor online — <b>jogue agora</b>";
  }
})();

// ---------- Data das finais no card ----------
function lastSundayOf(year, month) {
  const lastDay = new Date(year, month + 1, 0).getDate();
  for (let d = lastDay; d > lastDay - 7; d--) {
    if (new Date(year, month, d).getDay() === 0) return d;
  }
  return lastDay;
}

function nextFinalDate() {
  const now = new Date();
  let final = new Date(now.getFullYear(), now.getMonth(), lastSundayOf(now.getFullYear(), now.getMonth()), 20);
  if (final <= now) {
    final = new Date(now.getFullYear(), now.getMonth() + 1, lastSundayOf(now.getFullYear(), now.getMonth() + 1), 20);
  }
  return final;
}

const finalDate = nextFinalDate();
const hcDate = document.getElementById("hcDate");
if (hcDate) {
  hcDate.textContent = finalDate.toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
  });
}

// ---------- Countdown ----------
const cd = {
  d: document.getElementById("cdDays"),
  h: document.getElementById("cdHours"),
  m: document.getElementById("cdMins"),
  s: document.getElementById("cdSecs"),
};

const pad = (n) => String(n).padStart(2, "0");

function updateCountdown() {
  const diff = Math.max(0, finalDate - Date.now());
  const s = Math.floor(diff / 1000);
  cd.d.textContent = pad(Math.floor(s / 86400));
  cd.h.textContent = pad(Math.floor((s % 86400) / 3600));
  cd.m.textContent = pad(Math.floor((s % 3600) / 60));
  cd.s.textContent = pad(s % 60);
}
updateCountdown();
setInterval(updateCountdown, 1000);

// ---------- Reveal on scroll ----------
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      revealObserver.unobserve(entry.target);
      entry.target.classList.add("visible");
    });
  },
  { threshold: 0.12 }
);
document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

// ---------- Barras de dificuldade ----------
const diffObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      diffObserver.unobserve(entry.target);
      entry.target.querySelectorAll(".diff-bar i").forEach((bar) => {
        bar.style.width = bar.style.getPropertyValue("--w");
      });
    });
  },
  { threshold: 0.3 }
);
document.querySelectorAll(".track").forEach((el) => diffObserver.observe(el));
