
const cursor = document.querySelector('.cursor-glow');

// Cursor glow effect — desktop only
if (cursor && window.matchMedia('(pointer: fine)').matches) {
    window.addEventListener('pointermove', (event) => {
        cursor.animate(
            {
                left: `${event.clientX}px`,
                top: `${event.clientY}px`
            },
            {
                duration: 500,
                fill: 'forwards'
            }
        );
    });
}

// Scroll reveal animations
const revealElements = document.querySelectorAll('.reveal');

if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
        (entries, currentObserver) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    currentObserver.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.12 }
    );

    revealElements.forEach((element) => observer.observe(element));
} else {
    // Fallback for browsers without IntersectionObserver
    revealElements.forEach((element) => {
        element.classList.add('visible');
    });
}

// Subtle 3D tilt interaction — desktop only
if (window.matchMedia('(pointer: fine)').matches) {
    document.querySelectorAll('.tilt-card').forEach((card) => {
        card.addEventListener('pointermove', (event) => {
            const rect = card.getBoundingClientRect();

            const x = (event.clientX - rect.left) / rect.width - 0.5;
            const y = (event.clientY - rect.top) / rect.height - 0.5;

            card.style.transform =
                `perspective(1200px) ` +
                `rotateX(${y * -2.5}deg) ` +
                `rotateY(${x * 3}deg) ` +
                'translateY(-2px)';
        });

        card.addEventListener('pointerleave', () => {
            card.style.transform = '';
        });
    });
}


function bindGallery({ viewport, image, dots, prev, next, slides, render, missingClass }) {
    if (!viewport || !image || !slides.length) return;
    let index = 0, startX = null, startY = null, pointerId = null;

    const show = (n) => {
        index = (n + slides.length) % slides.length;
        render(slides[index], index);
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
            dot.setAttribute('aria-pressed', String(i === index));
        });
    };
    prev?.addEventListener('click', () => show(index - 1));
    next?.addEventListener('click', () => show(index + 1));
    dots.forEach((dot, i) => dot.addEventListener('click', () => show(i)));

    viewport.addEventListener('pointerdown', (e) => {
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        startX = e.clientX; startY = e.clientY; pointerId = e.pointerId;
    });
    viewport.addEventListener('pointerup', (e) => {
        if (pointerId !== e.pointerId || startX === null) return;
        const dx = e.clientX - startX, dy = e.clientY - startY;
        if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.25) show(index + (dx < 0 ? 1 : -1));
        startX = startY = pointerId = null;
    });
    viewport.addEventListener('pointercancel', () => { startX = startY = pointerId = null; });
    image.addEventListener('error', () => {
        if (missingClass) viewport.classList.add(missingClass);
        image.alt = `Screenshot file missing: ${image.getAttribute('src')}`;
    });
    image.addEventListener('load', () => { if (missingClass) viewport.classList.remove(missingClass); });
    show(0);
}

const dashboardContent = [
    ['01','OPERATIONAL OVERVIEW','Orders, revenue, popular items and activity in one view.','1.png','Restaurant dashboard operational overview'],
    ['02','ANALYTICS & TRENDS','Review sales patterns, order activity and performance metrics.','2.png','Restaurant analytics and trends'],
    ['03','OWNER REPORTS','A consolidated performance view for the selected reporting period.','3.png','Restaurant owner reporting dashboard'],
    ['04','ORDER MANAGEMENT','Review customer orders, totals, items and order history in one place.','4.png','Restaurant order history'],
    ['05','MENU CONTROL','Add items and control what the ordering agents can offer.','5.png','Restaurant menu management'],
    ['06','LIVE AI SYNC','Dashboard changes update the operational menu data used by the ordering agents.','6.png','Restaurant dashboard live AI sync']
].map(([number,title,description,file,alt]) => ({number,title,description,src:`assets/restaurant-ai/dashboard/${file}`,alt}));

const dashImage = document.querySelector('#dashboard-image');
const dashCaption = document.querySelector('.dash-caption');
const dashNumber = document.querySelector('#dashboard-image-number');
bindGallery({
    viewport: document.querySelector('.dashboard-viewport'), image: dashImage,
    dots: [...document.querySelectorAll('.dashboard-gallery-dots button')],
    prev: document.querySelector('.dashboard-prev'), next: document.querySelector('.dashboard-next'),
    slides: dashboardContent, missingClass: 'no-image',
    render: (s) => {
        dashImage.src = s.src; dashImage.alt = s.alt; dashNumber.textContent = s.number;
        dashCaption.replaceChildren();
        const num = document.createElement('span'); num.textContent = s.number;
        const wrap = document.createElement('div'), title = document.createElement('b'), desc = document.createElement('small');
        title.textContent = s.title; desc.textContent = s.description; wrap.append(title, desc); dashCaption.append(num, wrap);
    }
});

const workflowContent = [
    ['WhatsApp Agent Workflow','Message handling and agent response across the WhatsApp ordering journey.','whatsapp.png','WhatsApp agent workflow screenshot'],
    ['Shared AI Tool Layer','Reusable MCP tools allow both customer channels to call the same restaurant operations.','mcp.png','Shared AI tool layer workflow screenshot'],
    ['Deterministic Order Calculation','Validate menu items and calculate trusted prices outside the language model.','calculateTotal.png','Deterministic order calculation workflow screenshot'],
    ['Order Creation & Validation','Validate order details, prevent duplicates, assign identifiers and create a confirmed order.','placeOrder.png','Order creation and validation workflow screenshot'],
    ['Dashboard-to-Data Sync','Owner dashboard actions update the operational data used by the ordering agents.','dashboardAction.png','Dashboard to data sync workflow screenshot'],
    ['Mark Item Unavailable','Update an item’s availability so the ordering agent can stop offering it.','89d.png','Mark item unavailable workflow screenshot'],
    ['Kitchen Queue','Route confirmed orders into the kitchen queue for operational tracking.','kitchenQueue.png','Kitchen queue workflow screenshot'],
    ['Order Status Updates','Retrieve and communicate the current status of an order.','orderstatus.png','Order status workflow screenshot'],
    ['Payment Link','Handle payment-link generation as part of the ordering flow.','payment.png','Payment link workflow screenshot'],
    ['Menu Item Updates','Keep menu item data current for the dashboard and AI ordering channels.','updatedMenuItem.png','Menu item update workflow screenshot']
].map(([title,description,file,alt]) => ({title,description,src:`assets/restaurant-ai/workflows/${file}`,alt}));

const workImage = document.querySelector('#workflow-image');
bindGallery({
    viewport: document.querySelector('.workflow-viewport'), image: workImage,
    dots: [...document.querySelectorAll('.workflow-gallery-dots button')],
    prev: document.querySelector('.workflow-prev'), next: document.querySelector('.workflow-next'),
    slides: workflowContent, missingClass: 'no-image',
    render: (s, i) => {
        workImage.src = s.src; workImage.alt = s.alt;
        document.querySelector('#workflow-slide-number').textContent = `${String(i+1).padStart(2,'0')} / ${String(workflowContent.length).padStart(2,'0')}`;
        document.querySelector('#workflow-slide-title').textContent = s.title;
        document.querySelector('#workflow-slide-description').textContent = s.description;
        document.querySelector('#workflow-image-number').textContent = String(i+1).padStart(2,'0');
    }
});

// Play a muted YouTube video while it is prominently visible, pause it when it leaves.
// A manual pause is respected until the video leaves and re-enters the viewport.
(function visibleYouTubePlayback() {
    const frames = [...document.querySelectorAll('.video-frame iframe')];
    if (!frames.length || !('IntersectionObserver' in window)) return;
    const state = new WeakMap();
    frames.forEach(frame => {
        const url = new URL(frame.src);
        url.searchParams.set('enablejsapi','1');
        url.searchParams.set('autoplay','0');
        url.searchParams.set('mute','1');
        url.searchParams.set('cc_load_policy','0');
        if (location.origin && location.origin !== 'null') url.searchParams.set('origin',location.origin);
        frame.src = url.toString();
        state.set(frame,{visible:false,manualPause:false,player:null,visibilityPause:false});
    });

    const begin = frame => {
        const s = state.get(frame);
        if (!s || !s.visible || s.manualPause || !s.player) return;
        try { s.player.mute(); s.player.playVideo(); } catch (_) {}
    };
    const createPlayers = () => {
        frames.forEach(frame => {
            const s = state.get(frame);
            s.player = new YT.Player(frame, { events: {
                onReady: () => begin(frame),
                onStateChange: e => {
                    const current = state.get(frame);
                    if (e.data === YT.PlayerState.PAUSED && current.visible && !current.visibilityPause) current.manualPause = true;
                    if (e.data === YT.PlayerState.PLAYING) current.manualPause = false;
                }
            }});
        });
    };
    window.onYouTubeIframeAPIReady = createPlayers;
    if (window.YT && window.YT.Player) createPlayers();
    else if (!document.querySelector('script[data-youtube-iframe-api]')) {
        const api = document.createElement('script');
        api.src = 'https://www.youtube.com/iframe_api'; api.async = true; api.dataset.youtubeIframeApi = 'true';
        document.head.appendChild(api);
    }

    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
        const frame = entry.target, s = state.get(frame), visible = entry.isIntersecting && entry.intersectionRatio >= 0.55;
        if (visible && !s.visible) { s.visible = true; s.manualPause = false; begin(frame); }
        else if (!visible && s.visible) {
            s.visible = false; s.manualPause = false;
            if (s.player) {
                s.visibilityPause = true;
                try { s.player.pauseVideo(); } catch (_) {}
                window.setTimeout(() => { s.visibilityPause = false; }, 300);
            }
        }
    }), {threshold:[0,0.55,0.8]});
    frames.forEach(frame => observer.observe(frame));
})();
