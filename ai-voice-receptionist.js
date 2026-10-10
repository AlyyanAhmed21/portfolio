(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const revealItems = [...document.querySelectorAll('.reveal')];
    if (reduceMotion || !('IntersectionObserver' in window)) {
        revealItems.forEach(el => el.classList.add('revealed'));
    } else {
        const revealObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -35px 0px' });
        revealItems.forEach(el => revealObserver.observe(el));
    }

    // Workflow screenshot gallery. Images are expected at assets/AIVoiceReceptionist/1.png ... 5.png.
    const workflows = [
        {
            title: 'MCP Layer',
            description: 'The shared entry point that exposes the appointment tools to Sara.',
            image: 'assets/AIVoiceReceptionist/1.png',
            alt: 'MCP layer workflow showing appointment tools',
            label: 'MCP SERVER / TOOL ROUTING'
        },
        {
            title: 'Appointment Management',
            description: 'Handles appointment cancellation and rescheduling requests.',
            image: 'assets/AIVoiceReceptionist/2.png',
            alt: 'Appointment management workflow for cancellation and rescheduling',
            label: 'CANCEL / RESCHEDULE'
        },
        {
            title: 'Appointment Availability',
            description: 'Checks the requested date against the clinic calendar to identify available slots.',
            image: 'assets/AIVoiceReceptionist/3.png',
            alt: 'Appointment availability workflow checking calendar slots',
            label: 'CHECK FREE SLOTS'
        },
        {
            title: 'Appointment Booking',
            description: 'Creates the confirmed calendar event and records appointment details.',
            image: 'assets/AIVoiceReceptionist/4.png',
            alt: 'Appointment booking workflow creating a calendar event and record',
            label: 'CREATE APPOINTMENT'
        },
        {
            title: 'Appointment Lookup',
            description: 'Finds an existing appointment so the agent can help the caller manage it.',
            image: 'assets/AIVoiceReceptionist/5.png',
            alt: 'Appointment lookup workflow for existing appointments',
            label: 'FIND EXISTING APPOINTMENT'
        }
    ];
    const image = document.querySelector('#workflow-image');
    const title = document.querySelector('#workflow-title');
    const description = document.querySelector('#workflow-description');
    const counter = document.querySelector('#workflow-counter');
    const bottomNumber = document.querySelector('#workflow-bottom-number');
    const imageLabel = document.querySelector('#workflow-image-label');
    const dots = [...document.querySelectorAll('.workflow-dots button')];
    const prev = document.querySelector('#workflow-prev');
    const next = document.querySelector('#workflow-next');
    const imageFrame = document.querySelector('#workflow-image-frame');
    const openButton = document.querySelector('#open-workflow-image');
    const lightbox = document.querySelector('#workflow-lightbox');
    const lightboxImage = document.querySelector('#lightbox-image');
    const lightboxCaption = document.querySelector('#lightbox-caption');
    const closeButton = document.querySelector('#close-workflow-image');
    let current = 0;
    let previousFocus = null;

    function showWorkflow(index) {
        current = (index + workflows.length) % workflows.length;
        const item = workflows[current];
        if (image) {
            image.src = item.image;
            image.alt = item.alt;
            image.onerror = () => {
                imageFrame?.classList.add('image-missing');
            };
            image.onload = () => imageFrame?.classList.remove('image-missing');
        }
        if (title) title.textContent = item.title;
        if (description) description.textContent = item.description;
        if (counter) counter.innerHTML = `${String(current + 1).padStart(2, '0')} <i>/ 05</i>`;
        if (bottomNumber) bottomNumber.textContent = `${String(current + 1).padStart(2, '0')} / 05`;
        if (imageLabel) imageLabel.textContent = item.label;
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === current);
            dot.setAttribute('aria-pressed', String(i === current));
        });
        if (lightbox?.classList.contains('open') && lightboxImage) {
            lightboxImage.src = item.image;
            lightboxImage.alt = item.alt;
            if (lightboxCaption) lightboxCaption.textContent = item.title;
        }
    }

    prev?.addEventListener('click', () => showWorkflow(current - 1));
    next?.addEventListener('click', () => showWorkflow(current + 1));
    dots.forEach((dot, i) => dot.addEventListener('click', () => showWorkflow(i)));

    function openLightbox() {
        if (!lightbox || !lightboxImage) return;
        previousFocus = document.activeElement;
        const item = workflows[current];
        lightboxImage.src = item.image;
        lightboxImage.alt = item.alt;
        if (lightboxCaption) lightboxCaption.textContent = item.title;
        lightbox.classList.add('open');
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        closeButton?.focus();
    }
    function closeLightbox() {
        if (!lightbox) return;
        lightbox.classList.remove('open');
        lightbox.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        previousFocus?.focus?.();
    }
    openButton?.addEventListener('click', openLightbox);
    closeButton?.addEventListener('click', closeLightbox);
    lightbox?.addEventListener('click', event => {
        if (event.target === lightbox) closeLightbox();
    });
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && lightbox?.classList.contains('open')) closeLightbox();
        if (lightbox?.classList.contains('open') && event.key === 'ArrowRight') showWorkflow(current + 1);
        if (lightbox?.classList.contains('open') && event.key === 'ArrowLeft') showWorkflow(current - 1);
    });

    // Swipe navigation for mobile gallery.
    let touchStartX = null;
    imageFrame?.addEventListener('touchstart', event => {
        touchStartX = event.touches[0].clientX;
    }, { passive: true });
    imageFrame?.addEventListener('touchend', event => {
        if (touchStartX === null) return;
        const delta = event.changedTouches[0].clientX - touchStartX;
        if (Math.abs(delta) > 45) showWorkflow(current + (delta < 0 ? 1 : -1));
        touchStartX = null;
    }, { passive: true });

    showWorkflow(0);
})();


    // Match the existing project-page playback behavior: muted autoplay while a video is in view,
    // pausing it when it leaves view. Native YouTube controls remain available to the viewer.
    (() => {
        const frames = [...document.querySelectorAll('.video-frame iframe')];
        if (!frames.length || !('IntersectionObserver' in window)) return;
        const players = new Map();
        const visible = new Set();
        function initPlayers() {
            if (!window.YT?.Player) return;
            frames.forEach(frame => {
                if (players.has(frame)) return;
                const player = new YT.Player(frame, {
                    events: {
                        onReady: event => {
                            event.target.mute();
                            if (visible.has(frame)) event.target.playVideo();
                        }
                    }
                });
                players.set(frame, player);
            });
        }
        window.onYouTubeIframeAPIReady = initPlayers;
        if (!document.querySelector('script[data-youtube-iframe-api]')) {
            const script = document.createElement('script');
            script.src = 'https://www.youtube.com/iframe_api';
            script.async = true;
            script.dataset.youtubeIframeApi = 'true';
            document.head.appendChild(script);
        }
        const observer = new IntersectionObserver(entries => entries.forEach(entry => {
            const frame = frames.find(item => item.closest('.video-frame') === entry.target);
            if (!frame) return;
            const player = players.get(frame);
            if (entry.isIntersecting && entry.intersectionRatio >= 0.55) {
                visible.add(frame);
                if (player?.mute) { player.mute(); player.playVideo(); }
            } else {
                visible.delete(frame);
                if (player?.pauseVideo) player.pauseVideo();
            }
        }), { threshold: [0, 0.55, 0.75] });
        frames.forEach(frame => observer.observe(frame.closest('.video-frame')));
        if (window.YT?.Player) initPlayers();
    })();
