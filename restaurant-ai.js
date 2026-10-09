
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

// Dashboard gallery elements
const galleryDots = [
    ...document.querySelectorAll('.gallery-dots button')
];

const dashboardCaption = document.querySelector('.dash-caption');
const dashboardImage = document.querySelector('#dashboard-image');
const dashboardImageNumber = document.querySelector(
    '#dashboard-image-number'
);

// Dashboard gallery content and image paths
const dashboardContent = [
    [
        '01',
        'OPERATIONAL OVERVIEW',
        'Orders, revenue, popular items and activity in one view.',
        'assets/restaurant-ai/dashboard/1.png',
        'Restaurant dashboard operational overview'
    ],
    [
        '02',
        'ANALYTICS & TRENDS',
        'Review sales patterns, order activity and performance metrics.',
        'assets/restaurant-ai/dashboard/2.png',
        'Restaurant analytics and trends'
    ],
    [
        '03',
        'OWNER REPORTS',
        'A consolidated performance view for the selected reporting period.',
        'assets/restaurant-ai/dashboard/3.png',
        'Restaurant owner monthly report'
    ],
    [
        '04',
        'ORDER MANAGEMENT',
        'Review customer orders, totals, items and order history in one place.',
        'assets/restaurant-ai/dashboard/4.png',
        'Restaurant order history'
    ],
    [
        '05',
        'MENU CONTROL',
        'Add items and control what the ordering agents can offer.',
        'assets/restaurant-ai/dashboard/5.png',
        'Restaurant menu management'
    ],
    [
        '06',
        'LIVE AI SYNC',
        'Dashboard changes update the operational menu data used by the ordering agents.',
        'assets/restaurant-ai/dashboard/6.png',
        'Restaurant dashboard live AI sync'
    ]
];

// Update the dashboard gallery
function showDashboardSlide(index) {
    const slide = dashboardContent[index];

    if (!slide) return;

    const [number, title, description, imagePath, altText] = slide;

    galleryDots.forEach((dot, dotIndex) => {
        const isActive = dotIndex === index;

        dot.classList.toggle('active', isActive);
        dot.setAttribute('aria-pressed', String(isActive));
    });

    if (dashboardImage) {
        dashboardImage.style.display = 'block';
        dashboardImage.src = imagePath;
        dashboardImage.alt = altText;

        const viewport = document.querySelector('.dashboard-viewport');

        if (viewport) {
            viewport.classList.remove('no-image');
        }
    }

    if (dashboardImageNumber) {
        dashboardImageNumber.textContent = number;
    }

    if (dashboardCaption) {
        // Build caption with DOM elements rather than injecting HTML.
        dashboardCaption.replaceChildren();

        const numberElement = document.createElement('span');
        numberElement.textContent = number;

        const textContainer = document.createElement('div');

        const titleElement = document.createElement('b');
        titleElement.textContent = title;

        const descriptionElement = document.createElement('small');
        descriptionElement.textContent = description;

        textContainer.append(titleElement, descriptionElement);
        dashboardCaption.append(numberElement, textContainer);
    }
}

galleryDots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
        showDashboardSlide(index);
    });
});

// Handle missing dashboard screenshots
if (dashboardImage) {
    dashboardImage.addEventListener('error', () => {
        const viewport = document.querySelector('.dashboard-viewport');

        if (viewport) {
            viewport.classList.add('no-image');
        }

        dashboardImage.style.display = 'none';
    });

    dashboardImage.addEventListener('load', () => {
        const viewport = document.querySelector('.dashboard-viewport');

        if (viewport) {
            viewport.classList.remove('no-image');
        }

        dashboardImage.style.display = 'block';
    });
}

// Handle missing workflow screenshots
document.querySelectorAll('.workflow-image-grid img').forEach((image) => {
    image.addEventListener('error', () => {
        image.classList.add('image-missing');

        image.alt = `Screenshot file missing: ${image.getAttribute('src')}`;
    });
});
