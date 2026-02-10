// --- 1. GSAP SCROLL ANIMATIONS ---
gsap.registerPlugin(ScrollTrigger);

// Animate Glass Panels entering view
gsap.utils.toArray('.glass-panel').forEach(panel => {
    gsap.from(panel, {
        scrollTrigger: { trigger: panel, start: "top 90%" },
        y: 40, opacity: 0, duration: 0.8, ease: "power2.out"
    });
});

// Experience timeline slide-in
gsap.utils.toArray('.experience-item').forEach(item => {
    gsap.from(item, {
        scrollTrigger: { trigger: item, start: "top 85%" },
        x: 40,
        opacity: 0,
        duration: 0.7,
        ease: "power2.out"
    });
});

// Section title reveal
gsap.utils.toArray('.section-title').forEach(title => {
    gsap.from(title, {
        scrollTrigger: { trigger: title, start: "top 90%" },
        y: 20,
        opacity: 0,
        duration: 0.6,
        ease: "power2.out"
    });
});

// --- 2. PROJECT POPUPS (Modal Logic) ---
const modal = document.getElementById('modal');
const projectData = {
    '1': {
        title: 'Chest Cancer MLOps',
        stack: ['MLflow', 'DVC', 'Docker', 'TensorFlow', 'CI/CD'],
        desc: 'Engineered a full CI/CD pipeline using MLflow for experiment tracking and DVC for data versioning. Containerized a TensorFlow/Keras model via Docker and automated deployment to Hugging Face Spaces, achieving 93% accuracy.',
        link: 'https://github.com/AlyyanAhmed21/End-to-End-Chest-Cancer-Classification-using-MLflow-and-DVC'
    },
    '2': {
        title: 'AI-Powered Portfolio',
        stack: ['RAG', 'LLM-3', 'FAISS', 'LangChain'],
        desc: 'Developed a self-referential portfolio using LLM-3 and RAG pipelines for dynamic question-answering. Implemented FAISS-based vector search to simulate an interactive "AI version" of myself.',
        link: 'https://github.com/AlyyanAhmed21'
    },
    '3': {
        title: 'Facial Emotion Recognition',
        stack: ['ViT', 'Gradio', 'Hugging Face', 'GitHub Actions'],
        desc: 'Built a production-grade MLOps pipeline with ViT Transformers. Integrated DVC, MLflow, and GitHub Actions for CI/CD. Deployed via Docker-ready setup.',
        link: 'https://github.com/AlyyanAhmed21/Emotion-Recognition-MLOps'
    },
    '4': {
        title: 'Pneumonia Detection (ViT)',
        stack: ['ResNet-50', 'Vision Transformer', 'MongoDB', 'Gradio'],
        desc: 'Designed a dual-model system with ResNet-50 for OOD filtering and ViT for pneumonia detection (94% accuracy). Implemented full MLOps pipeline.',
        link: 'https://github.com/AlyyanAhmed21/Chest-X-ray-Pneumonia-Detection-with-ViT'
    }
};

document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('click', () => {
        const id = card.dataset.id;
        const data = projectData[id];
        
        document.getElementById('m-title').innerText = data.title;
        document.getElementById('m-desc').innerText = data.desc;
        document.getElementById('m-git').href = data.link;
        
        const stackContainer = document.getElementById('m-stack');
        stackContainer.innerHTML = '';
        data.stack.forEach(tech => {
            const span = document.createElement('span');
            span.innerText = tech;
            stackContainer.appendChild(span);
        });
        
        modal.showModal();
        gsap.fromTo(modal, {scale: 0.9, opacity: 0}, {scale: 1, opacity: 1, duration: 0.2});
    });
});

document.getElementById('close-modal').onclick = () => modal.close();
modal.addEventListener('click', (e) => { if(e.target === modal) modal.close(); });


// --- 3. CHAT WIDGET LOGIC ---
const chatUI = document.getElementById('ai-chat');
const chatTrigger = document.getElementById('floating-chat');
const closeChat = document.getElementById('close-chat');
const sendBtn = document.getElementById('send-btn');
const input = document.getElementById('user-input');
const feed = document.getElementById('feed');

// --- 0. VANTA BACKGROUND (Topology) ---
let vantaBg = null;
function initVanta() {
    const el = document.getElementById('bg');
    if (!el || !window.VANTA || !window.VANTA.TOPOLOGY) return;
    if (vantaBg) vantaBg.destroy();
    vantaBg = window.VANTA.TOPOLOGY({
        el,
        mouseControls: false,
        touchControls: false,
        gyroControls: false,
        minHeight: 200.0,
        minWidth: 200.0,
        scale: 1.0,
        scaleMobile: 1.0,
        color: 0x6f5bff,
        backgroundColor: 0x08060f,
        points: 8.0,
        maxDistance: 10.0,
        spacing: 26.0,
        showDots: false,
        speed: 0.12
    });
}
window.addEventListener('load', initVanta, { passive: true });

if (chatTrigger) {
    chatTrigger.onclick = () => {
        const isHidden = chatUI.classList.contains('hidden');
        if (isHidden) {
            chatUI.classList.remove('hidden');
            gsap.fromTo(chatUI, {y: 50, opacity: 0}, {y: 0, opacity: 1, duration: 0.4});
        } else {
            chatUI.classList.add('hidden');
        }
    };
}
closeChat.onclick = () => chatUI.classList.add('hidden');

async function sendMessage() {
    const text = input.value;
    if(!text) return;

    addMsg(text, 'user');
    input.value = '';
    const loadingId = addMsg('Processing...', 'ai');

    try {
        const res = await fetch('http://localhost:3000/chat', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ message: text })
        });
        const data = await res.json();
        document.getElementById(loadingId).remove();
        addMsg(data.reply, 'ai');
    } catch(e) {
        document.getElementById(loadingId).innerText = "Error: Backend offline.";
    }
}

function addMsg(text, type) {
    const div = document.createElement('div');
    div.className = `msg ${type}`;
    div.innerText = text;
    div.id = Math.random().toString(36);
    feed.appendChild(div);
    feed.scrollTop = feed.scrollHeight;
    return div.id;
}

sendBtn.onclick = sendMessage;
input.onkeypress = (e) => { if(e.key === 'Enter') sendMessage(); };
