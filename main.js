const SKILL_ICON_MAP = {
    'XGBoost': 'fas fa-cogs',
    'LightGBM': 'fas fa-cogs',
    'Random Forest': 'fas fa-tree',
    'SVM': 'fas fa-sliders-h',
    'Regression': 'fas fa-chart-line',
    'scikit-learn': 'fas fa-database',
    'PyTorch': 'fab fa-python',
    'TensorFlow': 'fas fa-microchip',
    'Keras': 'fas fa-microchip',
    'Neural Networks': 'fas fa-brain',
    'Vision Transformers': 'fas fa-eye',
    'PINNs': 'fas fa-atom',
    'LangCommunity': 'fas fa-robot',
    'RAG': 'fas fa-book-open',
    'Hugging Face Transformers': 'fas fa-face-smile',
    'GPT / Llama 3': 'fas fa-comment-dots',
    'Prompt Engineering': 'fas fa-bolt',
    'FAISS / Pinecone': 'fas fa-search',
    'OpenCV': 'fas fa-camera',
    'YOLOv5 / v8': 'fas fa-bullseye',
    'Object Detection': 'fas fa-eye',
    'Image Classification': 'fas fa-image',
    'Diffusion Models': 'fas fa-wand-magic-sparkles',
    'Pandas': 'fas fa-table',
    'NumPy': 'fas fa-cubes',
    'Feature Engineering': 'fas fa-chart-bar',
    'Time-Series Analysis': 'fas fa-wave-square',
    'Signal Processing': 'fas fa-signal',
    'Data Visualization': 'fas fa-chart-pie',
    'Docker': 'fab fa-docker',
    'MLflow': 'fas fa-box-archive',
    'DVC': 'fas fa-database',
    'CI/CD': 'fas fa-screwdriver-wrench',
    'FastAPI': 'fas fa-server',
    'Model Serving': 'fas fa-cloud',
    'n8n': 'fas fa-robot',
    'Make': 'fas fa-gears',
    'Multi-Agentic Systems': 'fas fa-layer-group',
    'Workflow Automation': 'fas fa-play-circle',
    'Python': 'fab fa-python',
    'SQL': 'fas fa-database',
    'C': 'fas fa-code',
    'C++': 'fas fa-code',
    'JavaScript': 'fab fa-js-square'
};

const SKILL_GROUPS = {
    'Machine Learning & AI': ['XGBoost', 'LightGBM', 'Random Forest', 'SVM', 'Regression', 'scikit-learn'],
    'Deep Learning': ['PyTorch', 'TensorFlow', 'Keras', 'Neural Networks', 'Vision Transformers', 'PINNs'],
    'LLMs & NLP': ['LangCommunity', 'RAG', 'Hugging Face Transformers', 'GPT / Llama 3', 'Prompt Engineering', 'FAISS / Pinecone'],
    'Computer Vision': ['OpenCV', 'YOLOv5 / v8', 'Object Detection', 'Image Classification', 'Diffusion Models'],
    'Data Science & Visualization': ['Pandas', 'NumPy', 'Feature Engineering', 'Time-Series Analysis', 'Signal Processing', 'Data Visualization'],
    'MLOps & Deployment': ['Docker', 'MLflow', 'DVC', 'CI/CD', 'FastAPI', 'Model Serving'],
    'Automation': ['n8n', 'Make', 'Multi-Agentic Systems', 'Workflow Automation'],
    'Programming Languages': ['Python', 'SQL', 'C', 'C++', 'JavaScript']
};

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
    initSkillWheel();
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


function initSkillWheel() {
    const overlay = document.getElementById('skill-wheel-overlay');
    const panel = overlay ? overlay.querySelector('.skill-wheel-panel') : null;
    const titleEl = document.getElementById('skill-wheel-title');
    const ring = document.getElementById('skill-wheel-ring');
    const orbs = Array.from(document.querySelectorAll('.skill-orb'));
    if (!overlay || !panel || !titleEl || !ring || !orbs.length) return;

    let active = null;

    const closeWheel = () => {
        active = null;
        overlay.classList.remove('open');
        overlay.setAttribute('aria-hidden', 'true');
        ring.innerHTML = '';
    };

    const renderNodes = skills => {
        ring.innerHTML = '';
        const count = skills.length;
        const panelRect = panel.getBoundingClientRect();
        const radius = Math.max(120, Math.min(205, Math.min(panelRect.width, panelRect.height) * 0.31));

        skills.forEach((label, i) => {
            const angle = (-Math.PI / 2) + ((Math.PI * 2) * i / count);
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;

            const node = document.createElement('div');
            node.className = 'skill-node';
            node.style.setProperty('--x', `${x}px`);
            node.style.setProperty('--y', `${y}px`);
            node.style.setProperty('--delay', `${i * 40}ms`);

            const iconWrap = document.createElement('span');
            iconWrap.className = 'skill-node-icon';
            const icon = document.createElement('i');
            icon.className = SKILL_ICON_MAP[label] || 'fas fa-circle-dot';
            iconWrap.appendChild(icon);

            const text = document.createElement('span');
            text.className = 'skill-node-label';
            text.textContent = label;

            node.appendChild(iconWrap);
            node.appendChild(text);
            ring.appendChild(node);
        });
    };

    const openWheel = group => {
        const skills = SKILL_GROUPS[group];
        if (!skills) return;
        active = group;
        titleEl.textContent = group;
        renderNodes(skills);
        overlay.classList.add('open');
        overlay.setAttribute('aria-hidden', 'false');
    };

    const autoCloseByRadius = evt => {
        if (!active || !overlay.classList.contains('open')) return;
        const rect = panel.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = evt.clientX - cx;
        const dy = evt.clientY - cy;
        const dist = Math.hypot(dx, dy);
        const closeRadius = Math.min(rect.width, rect.height) * 0.58;
        if (dist > closeRadius) closeWheel();
    };

    orbs.forEach(orb => {
        const group = orb.getAttribute('data-skill-group');
        orb.addEventListener('click', () => openWheel(group));
    });

    overlay.addEventListener('pointermove', autoCloseByRadius);
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && overlay.classList.contains('open')) closeWheel();
    });
    overlay.addEventListener('click', e => {
        if (e.target === overlay) closeWheel();
    });

    window.addEventListener('resize', () => {
        if (!active || !overlay.classList.contains('open')) return;
        renderNodes(SKILL_GROUPS[active] || []);
    });
}

