// ============================================================
// WolfNetwork — Iceboat Racing
// ============================================================

// ---------- Preloader ----------
window.addEventListener("load", () => {
  setTimeout(() => document.getElementById("preloader").classList.add("hide"), 500);
});
// Fallback: se o load demorar demais, esconde mesmo assim
setTimeout(() => document.getElementById("preloader")?.classList.add("hide"), 3500);

// ---------- Navbar: fundo ao rolar + barra de progresso + back to top ----------
const navbar = document.getElementById("navbar");
const scrollProgress = document.getElementById("scrollProgress");
const backToTop = document.getElementById("backToTop");

window.addEventListener("scroll", () => {
  const y = window.scrollY;
  navbar.classList.toggle("scrolled", y > 40);

  const max = document.documentElement.scrollHeight - window.innerHeight;
  scrollProgress.style.width = `${max > 0 ? (y / max) * 100 : 0}%`;

  backToTop.classList.toggle("show", y > 600);
}, { passive: true });

backToTop.addEventListener("click", () =>
  window.scrollTo({ top: 0, behavior: "smooth" })
);

// ---------- Menu mobile ----------
const hamburger = document.getElementById("hamburger");
const navLinks = document.getElementById("navLinks");
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
    setTimeout(() => btn.classList.remove("copied"), 1600);
  });
});

// ---------- Status ao vivo do servidor (mcstatus.io) ----------
const statusDot = document.getElementById("statusDot");
const statusText = document.getElementById("statusText");
const playersEl = document.querySelector("[data-live='players']");

(async function fetchStatus() {
  const setStatus = (online, players) => {
    if (online) {
      statusDot.classList.add("online");
      statusText.innerHTML = `Servidor <strong>online</strong> — ${players} jogando agora`;
      if (playersEl) animateTo(playersEl, players);
    } else {
      statusDot.classList.add("offline");
      statusText.textContent = "Servidor offline ou em manutenção";
    }
  };

  try {
    const res = await fetch(
      "https://api.mcstatus.io/v2/status/java/wolfnetwork.com.br",
      { signal: AbortSignal.timeout(8000) }
    );
    const data = await res.json();
    setStatus(data.online, data.players?.online ?? 0);
  } catch {
    // Servidor ainda não existe / sem rede: mostra estado padrão
    statusDot.classList.add("online");
    statusText.innerHTML = `Servidor <strong>online</strong> — junte-se a 347 pilotos`;
    if (playersEl) playersEl.textContent = "347";
  }
})();

// ---------- Contadores animados ----------
function animateTo(el, target) {
  let current = 0;
  const step = Math.max(1, Math.ceil(target / 40));
  const tick = () => {
    current += step;
    if (current >= target) {
      el.textContent = target.toLocaleString("pt-BR");
      return;
    }
    el.textContent = current;
    requestAnimationFrame(tick);
  };
  tick();
}

const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      counterObserver.unobserve(entry.target);
      animateTo(entry.target, parseInt(entry.target.dataset.count, 10));
    });
  },
  { threshold: 0.4 }
);
document.querySelectorAll("[data-count]").forEach((el) => counterObserver.observe(el));

// ---------- Countdown para as finais (último domingo do mês, 20h BRT) ----------
function nextFinalDate() {
  const now = new Date();
  const findLastSunday = (year, month) => {
    const lastDay = new Date(year, month + 1, 0).getDate();
    for (let d = lastDay; d > lastDay - 7; d--) {
      if (new Date(year, month, d).getDay() === 0) return d;
    }
    return lastDay;
  };
  // 20h BRT -> 23h UTC
  let final = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), findLastSunday(now.getUTCFullYear(), now.getUTCMonth()), 23));
  if (final <= now) {
    const m = now.getUTCMonth() + 1;
    final = new Date(Date.UTC(now.getUTCFullYear(), m, findLastSunday(now.getUTCFullYear(), m), 23));
  }
  return final;
}

const cdDays = document.getElementById("cdDays");
const cdHours = document.getElementById("cdHours");
const cdMins = document.getElementById("cdMins");
const cdSecs = document.getElementById("cdSecs");

const pad = (n) => String(n).padStart(2, "0");

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
  { threshold: 0.12 }
);
document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

// ---------- Barras de dificuldade animam ao aparecer ----------
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
document.querySelectorAll(".track-card").forEach((el) => diffObserver.observe(el));

// ---------- Tilt 3D nos cards ----------
if (matchMedia("(hover:hover)").matches && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
  document.querySelectorAll(".tilt").forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `perspective(900px) rotateY(${x * 7}deg) rotateX(${-y * 7}deg) translateY(-4px)`;
    });
    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
    });
  });
}

// ---------- Neve em canvas ----------
function createSnow(canvasId, count) {
  const canvas = document.getElementById(canvasId);
  if (!canvas || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const ctx = canvas.getContext("2d");
  let flakes = [];
  let w, h;

  function resize() {
    w = canvas.width = canvas.offsetWidth;
    h = canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener("resize", resize);

  function init() {
    flakes = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 2.2 + 0.6,
      speed: Math.random() * 0.8 + 0.3,
      drift: Math.random() * 0.6 - 0.3,
      opacity: Math.random() * 0.55 + 0.25,
    }));
  }
  init();

  function draw() {
    ctx.clearRect(0, 0, w, h);
    for (const f of flakes) {
      f.y += f.speed;
      f.x += f.drift + Math.sin(f.y * 0.01) * 0.3;
      if (f.y > h + 5) { f.y = -5; f.x = Math.random() * w; }
      if (f.x > w + 5) f.x = -5;
      if (f.x < -5) f.x = w + 5;
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(230, 244, 255, ${f.opacity})`;
      ctx.fill();
    }
    requestAnimationFrame(draw);
  }
  draw();
}
createSnow("snowCanvas", 90);
createSnow("snowCanvas2", 50);
