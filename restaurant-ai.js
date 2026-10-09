
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

// Dashboard gallery
const galleryDots = [...document.querySelectorAll('.gallery-dots button')];
const dashboardCaption = document.querySelector('.dash-caption');
const dashboardImage = document.querySelector('#dashboard-image');
const dashboardImageNumber = document.querySelector('#dashboard-image-number');
const dashboardViewport = document.querySelector('.dashboard-viewport');
const dashboardContent = [
    ['01', 'ONGOING ORDERS', 'Homepage view of orders currently being processed.', 'assets/restaurant-ai/dashboard/1.png', 'Restaurant dashboard showing ongoing orders'],
    ['02', 'COMPLETED ORDERS', 'The homepage tab showing orders completed over the last three days.', 'assets/restaurant-ai/dashboard/2.png', 'Restaurant dashboard showing recently completed orders'],
    ['03', 'MENU CONTROL', 'View menu items and control their availability and details.', 'assets/restaurant-ai/dashboard/3.png', 'Restaurant dashboard menu control'],
    ['04', 'ADD MENU ITEM', 'Add a new item to the restaurant menu.', 'assets/restaurant-ai/dashboard/4.png', 'Restaurant dashboard add menu item form'],
    ['05', 'ANALYTICS & GRAPHS', 'Visualize restaurant performance through analytical graphs.', 'assets/restaurant-ai/dashboard/5.png', 'Restaurant dashboard analytics graphs'],
    ['06', 'ORDER HISTORY', 'Review historical order records.', 'assets/restaurant-ai/dashboard/6.png', 'Restaurant dashboard order history']
];
let dashboardIndex = 0;
function showDashboardSlide(index) {
    dashboardIndex = (index + dashboardContent.length) % dashboardContent.length;
    const [number, title, description, imagePath, altText] = dashboardContent[dashboardIndex];
    galleryDots.forEach((dot, i) => {
        dot.classList.toggle('active', i === dashboardIndex);
        dot.setAttribute('aria-pressed', String(i === dashboardIndex));
    });
    if (dashboardImage) {
        dashboardImage.style.display = 'block'; dashboardImage.src = imagePath; dashboardImage.alt = altText;
        dashboardViewport?.classList.remove('no-image');
    }
    if (dashboardImageNumber) dashboardImageNumber.textContent = number;
    if (dashboardCaption) {
        dashboardCaption.replaceChildren();
        const n = document.createElement('span'); n.textContent = number;
        const wrap = document.createElement('div');
        const b = document.createElement('b'); b.textContent = title;
        const small = document.createElement('small'); small.textContent = description;
        wrap.append(b, small); dashboardCaption.append(n, wrap);
    }
}
galleryDots.forEach((dot, i) => dot.addEventListener('click', () => showDashboardSlide(i)));
document.querySelector('#dashboard-prev')?.addEventListener('click', () => showDashboardSlide(dashboardIndex - 1));
document.querySelector('#dashboard-next')?.addEventListener('click', () => showDashboardSlide(dashboardIndex + 1));
if (dashboardViewport) {
    let startX = null;
    dashboardViewport.addEventListener('touchstart', e => { startX = e.changedTouches[0].clientX; }, {passive:true});
    dashboardViewport.addEventListener('touchend', e => {
        if (startX === null) return;
        const delta = e.changedTouches[0].clientX - startX;
        if (Math.abs(delta) > 45) showDashboardSlide(dashboardIndex + (delta < 0 ? 1 : -1));
        startX = null;
    }, {passive:true});
}
if (dashboardImage) dashboardImage.addEventListener('error', () => {
    dashboardViewport?.classList.add('no-image'); dashboardImage.style.display = 'none';
});

// Contact form opens a prefilled email draft; no backend or storage is used.
document.querySelector('#contact-form')?.addEventListener('submit', event => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const subject = String(data.get('subject') || 'Portfolio enquiry');
    const body = `Name: ${data.get('name')}\nEmail: ${data.get('email')}\n\n${data.get('message')}`;
    window.location.href = `mailto:YOUR_EMAIL@example.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
});

// YouTube: muted autoplay while visible, pause outside the viewport.
// Native controls are hidden in the embed URL; YouTube may still show branding/overlays.
(function setupYouTubeVisibilityPlayback() {
    const frames = [...document.querySelectorAll('.video-frame iframe')];
    if (!frames.length) return;
    let apiReady = false;
    const players = new Map();
    const visible = new Set();
    function initPlayers() {
        if (!window.YT?.Player) return;
        apiReady = true;
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
        script.async = true; script.dataset.youtubeIframeApi = 'true';
        document.head.appendChild(script);
    }
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(entries => entries.forEach(entry => {
            const frame = frames.find(f => f.closest('.video-frame') === entry.target);
            if (!frame) return;
            const player = players.get(frame);
            if (entry.isIntersecting && entry.intersectionRatio >= 0.55) {
                visible.add(frame);
                if (player?.mute) { player.mute(); player.playVideo(); }
            } else {
                visible.delete(frame);
                if (player?.pauseVideo) player.pauseVideo();
            }
        }), {threshold:[0,0.55,0.75]});
        frames.forEach(frame => observer.observe(frame.closest('.video-frame')));
    }
    if (window.YT?.Player) initPlayers();
})();


// Contact form: prepare a mailto draft; no backend or automatic sending.
const contactForm = document.querySelector('#contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const formData = new FormData(contactForm);
        const name = String(formData.get('name') || '').trim();
        const senderEmail = String(formData.get('email') || '').trim();
        const subject = String(formData.get('subject') || '').trim();
        const message = String(formData.get('message') || '').trim();

        const body = [
            `Name: ${name}`,
            `Email: ${senderEmail}`,
            '',
            message
        ].join('\\n');

        const mailto = `mailto:alyyanawan19@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.location.href = mailto;
    });
}

// Dashboard gallery arrows, dots and touch swipe.
(() => {
 const image=document.querySelector('#dashboard-image'), caption=document.querySelector('.dash-caption');
 const counter=document.querySelector('#dashboard-image-number'), prev=document.querySelector('#dashboard-prev'), next=document.querySelector('#dashboard-next');
 const dots=[...document.querySelectorAll('.gallery-dots:not(.workflow-dots) button')];
 const slides=[["01", "ONGOING ORDERS", "Homepage view of orders currently being processed.", "assets/restaurant-ai/dashboard/1.png", "Restaurant dashboard ongoing orders"], ["02", "COMPLETED ORDERS", "Previously completed orders from the last three days, shown on the second homepage tab.", "assets/restaurant-ai/dashboard/2.png", "Restaurant dashboard completed orders"], ["03", "MENU MANAGEMENT", "View menu items and control their availability and details.", "assets/restaurant-ai/dashboard/3.png", "Restaurant dashboard menu management"], ["04", "ADD MENU ITEM", "Add a new item to the restaurant menu.", "assets/restaurant-ai/dashboard/4.png", "Restaurant dashboard add menu item"], ["05", "ANALYTICS", "Graphs and charts summarizing restaurant performance.", "assets/restaurant-ai/dashboard/5.png", "Restaurant dashboard analytics graphs"], ["06", "ORDER HISTORY", "Review historical orders and past activity.", "assets/restaurant-ai/dashboard/6.png", "Restaurant dashboard order history"]]; let index=0;
 function show(i){ index=(i+slides.length)%slides.length; const [num,title,desc,path,alt]=slides[index];
  if(image){image.src=path;image.alt=alt;image.style.display='block';}
  if(counter)counter.textContent=num;
  if(caption)caption.innerHTML=`<span>${num}</span><div><b>${title}</b><small>${desc}</small></div>`;
  dots.forEach((d,j)=>{d.classList.toggle('active',j===index);d.setAttribute('aria-pressed',String(j===index));});
 }
 prev?.addEventListener('click',()=>show(index-1)); next?.addEventListener('click',()=>show(index+1));
 dots.forEach((d,i)=>d.addEventListener('click',()=>show(i)));
 const viewport=document.querySelector('.dashboard-viewport'); let x0=null;
 viewport?.addEventListener('touchstart',e=>{x0=e.touches[0].clientX;},{passive:true});
 viewport?.addEventListener('touchend',e=>{if(x0===null)return;const dx=e.changedTouches[0].clientX-x0;if(Math.abs(dx)>45)show(index+(dx<0?1:-1));x0=null;},{passive:true});
 show(0);
})();

// Workflow screenshot carousel: arrows, dots and touch swipe.
(() => {
 const slides=[["WhatsApp Agent", "Message handling and agent response.", "assets/restaurant-ai/workflows/whatsapp.png", "WhatsApp agent workflow"], ["Shared AI Tool Layer", "Reusable tools for both AI channels.", "assets/restaurant-ai/workflows/mcp.png", "Shared AI tool layer workflow"], ["Deterministic Order Calculation", "Live menu validation and reliable price calculation.", "assets/restaurant-ai/workflows/calculateTotal.png", "Order total calculation workflow"], ["Place Order", "Validation and confirmed order creation.", "assets/restaurant-ai/workflows/placeOrder.png", "Place order workflow"], ["Dashboard Sync", "Owner actions update operational data used by the ordering agents.", "assets/restaurant-ai/workflows/dashboardAction.png", "Dashboard sync workflow"], ["Mark Item Unavailable", "Update menu item availability.", "assets/restaurant-ai/workflows/89d.png", "Mark item unavailable workflow"], ["Kitchen Queue", "Manage orders in the kitchen queue.", "assets/restaurant-ai/workflows/kitchenQueue.png", "Kitchen queue workflow"], ["Order Status Updates", "Keep order status current across the workflow.", "assets/restaurant-ai/workflows/orderstatus.png", "Order status workflow"], ["Payment Link", "Payment link handling.", "assets/restaurant-ai/workflows/payment.png", "Payment link workflow"], ["Menu Item Updates", "Keep menu data updated for the ordering system.", "assets/restaurant-ai/workflows/updatedMenuItem.png", "Menu item update workflow"]]; const image=document.querySelector('#workflow-image');
 const number=document.querySelector('#workflow-slide-number'), title=document.querySelector('#workflow-slide-title'), desc=document.querySelector('#workflow-slide-description');
 const prev=document.querySelector('#workflow-prev'), next=document.querySelector('#workflow-next'), dots=[...document.querySelectorAll('.workflow-dots button')];
 let index=0;
 function show(i){index=(i+slides.length)%slides.length;const [t,d,path,alt]=slides[index];
  if(image){image.src=path;image.alt=alt;}
  if(number)number.textContent=`${String(index+1).padStart(2,'0')} / ${String(slides.length).padStart(2,'0')}`;
  if(title)title.textContent=t;if(desc)desc.textContent=d;
  dots.forEach((dot,j)=>{dot.classList.toggle('active',j===index);dot.setAttribute('aria-pressed',String(j===index));});
 }
 prev?.addEventListener('click',()=>show(index-1));next?.addEventListener('click',()=>show(index+1));
 dots.forEach((dot,i)=>dot.addEventListener('click',()=>show(i)));
 const viewport=document.querySelector('.workflow-slide-viewport');let x0=null;
 viewport?.addEventListener('touchstart',e=>{x0=e.touches[0].clientX;},{passive:true});
 viewport?.addEventListener('touchend',e=>{if(x0===null)return;const dx=e.changedTouches[0].clientX-x0;if(Math.abs(dx)>45)show(index+(dx<0?1:-1));x0=null;},{passive:true});
 show(0);
})();

// Contact form opens a prepared email draft; it never sends automatically.
(() => {
 const form=document.querySelector('#contact-form');
 form?.addEventListener('submit',event=>{
  event.preventDefault();const data=new FormData(form);
  const name=String(data.get('name')||'').trim(), sender=String(data.get('email')||'').trim();
  const subject=String(data.get('subject')||'').trim(), message=String(data.get('message')||'').trim();
  const body=`Name: ${name}\\nEmail: ${sender}\\n\\n${message}`;
  window.location.href=`mailto:alyyanawan19@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
 });
})();
