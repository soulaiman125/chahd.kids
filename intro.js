(() => {
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  if (motion.matches || document.visibilityState === 'hidden') return;

  const key = 'chahd_intro_seen';
  const seenCookie = () => document.cookie.split(';').some(value => value.trim() === key + '=1');
  try {
    if (seenCookie()) return;
  } catch { /* Storage can be unavailable in a private or local preview. */ }
  try {
    if (sessionStorage.getItem(key)) return;
  } catch { /* Fall back to the session cookie. */ }

  let remembered = false;
  try {
    const secure = location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = key + '=1; Path=/; SameSite=Lax' + secure;
    remembered = seenCookie();
  } catch { /* Fall back to tab session storage. */ }
  try {
    sessionStorage.setItem(key, '1');
    remembered = true;
  } catch { /* Skip the intro if it would repeat on every navigation. */ }
  if (!remembered) return;

  const root = document.documentElement;
  const started = performance.now();
  const events = new AbortController();
  const signal = events.signal;
  let readyTimer;
  let fadeTimer;
  let fallbackTimer;
  let leaving = false;

  function finish() {
    clearTimeout(readyTimer);
    clearTimeout(fadeTimer);
    clearTimeout(fallbackTimer);
    root.classList.remove('intro-active', 'intro-revealing');
    events.abort();
  }

  function reveal() {
    if (leaving) return;
    leaving = true;
    root.classList.add('intro-revealing');
    fadeTimer = setTimeout(finish, 280);
  }

  function ready() {
    clearTimeout(readyTimer);
    readyTimer = setTimeout(reveal, Math.max(0, 650 - (performance.now() - started)));
  }

  fallbackTimer = setTimeout(reveal, 1200);
  document.addEventListener('DOMContentLoaded', () => {
    const leadImage = document.querySelector('.hero img, .landing-main-photo');
    if (!leadImage || leadImage.complete) {
      ready();
    } else {
      leadImage.addEventListener('load', ready, { once: true, signal });
      leadImage.addEventListener('error', ready, { once: true, signal });
    }
  }, { once: true, signal });

  // Reveal immediately on interaction and let the original event continue.
  document.addEventListener('keydown', finish, { capture: true, signal });
  document.addEventListener('focusin', finish, { capture: true, signal });
  document.addEventListener('pointerdown', finish, { capture: true, passive: true, signal });
  motion.addEventListener('change', finish, { signal });
  window.addEventListener('pagehide', finish, { once: true, signal });
  root.classList.add('intro-active');
})();
