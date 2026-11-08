export function createTimer(now) {
  let endAt = 0;
  const remaining = () => (endAt ? Math.max(0, Math.ceil((endAt - now()) / 1000)) : 0);
  return {
    start(seconds) { endAt = now() + seconds * 1000; },
    stop() { endAt = 0; },
    remaining,
    running() { return remaining() > 0; },
  };
}

export function beep() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    const ctx = new Ctx();
    for (let i = 0; i < 3; i++) {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.frequency.value = 880;
      const t = ctx.currentTime + i * 0.3;
      g.gain.setValueAtTime(0.3, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
      o.start(t); o.stop(t + 0.2);
    }
  } catch {}
}
