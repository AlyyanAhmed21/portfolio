document.addEventListener('DOMContentLoaded', () => {
    if (window.AOS) {
        AOS.init({
            duration: 800,
            easing: 'ease-out-cubic',
            once: true,
            offset: 50
        });
    }

    initGitHubStats();
});

async function initGitHubStats() {
    const reposEl = document.getElementById('stat-public-repos');
    const commitsEl = document.getElementById('stat-commits-year');
    const contribsEl = document.getElementById('stat-contribs-year');
    if (!reposEl || !commitsEl || !contribsEl) return;

    const apiBase = window.location.protocol === 'file:' ? 'http://localhost:3000' : '';

    try {
        const res = await fetch(`${apiBase}/github-stats`);
        if (!res.ok) throw new Error('github stats request failed');
        const data = await res.json();

        animateCounter(reposEl, Number(data.publicRepos || 0), '');
        animateCounter(commitsEl, Number(data.totalCommits || 0), '');
        animateCounter(contribsEl, Number(data.contributionsLastYear || 0), '');
    } catch (err) {
        reposEl.textContent = '--';
        commitsEl.textContent = '--';
        contribsEl.textContent = '--';
    }
}

function animateCounter(el, target, suffix) {
    const start = 0;
    const duration = 1200;
    const t0 = performance.now();

    const tick = now => {
        const progress = Math.min(1, (now - t0) / duration);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(start + (target - start) * eased);
        el.textContent = `${current}${suffix}`;
        if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
}
