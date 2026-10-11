(() => {
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('visible'); revealObserver.unobserve(entry.target); }
    }), { threshold: 0.12 });
    revealEls.forEach(el => revealObserver.observe(el));
  } else revealEls.forEach(el => el.classList.add('visible'));

  const menu = document.querySelector('.projects-menu');
  const toggle = document.querySelector('.projects-toggle');
  if (menu && toggle) {
    toggle.addEventListener('click', () => {
      const open = menu.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    document.addEventListener('click', e => {
      if (!menu.contains(e.target)) { menu.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); }
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') { menu.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); toggle.focus(); }
    });
  }

  // YouTube IFrame API: autoplay muted only while a video is visible, pause when it leaves view.
  const frames = [...document.querySelectorAll('iframe.yt-autoplay')];
  if (!frames.length) return;
  const send = (frame, func) => {
    try { frame.contentWindow.postMessage(JSON.stringify({ event: 'command', func, args: [] }), '*'); } catch (_) {}
  };
  const prepare = frame => {
    const url = new URL(frame.src, window.location.href);
    url.searchParams.set('enablejsapi', '1');
    url.searchParams.set('autoplay', '0');
    url.searchParams.set('mute', '1');
    url.searchParams.set('controls', '1');
    url.searchParams.set('playsinline', '1');
    if (location.hostname && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') url.searchParams.set('origin', location.origin);
    frame.src = url.toString();
  };
  frames.forEach(prepare);
  if ('IntersectionObserver' in window) {
    const videoObserver = new IntersectionObserver(entries => entries.forEach(entry => {
      const frame = entry.target;
      if (entry.isIntersecting && entry.intersectionRatio >= 0.55) {
        send(frame, 'mute');
        send(frame, 'playVideo');
      } else send(frame, 'pauseVideo');
    }), { threshold: [0, 0.25, 0.55, 0.8] });
    frames.forEach(frame => videoObserver.observe(frame));
  }
})();