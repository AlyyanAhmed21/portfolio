require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Groq = require('groq-sdk');

const app = express();
app.use(cors());
app.use(express.json());

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const context = `
You are Alyyan Ahmed's portfolio assistant.
Experience:
- Intern at iOPTIME (Nov 2025-Feb 2026): EV Battery Analytics (91% acc), PINNs, RAG.
- Intern at CSERA (2025): YOLOv8, MLOps, FastAPI.
- Intern at Air University: Network Security AI.
Skills: Python, MLOps, Docker, RAG, Computer Vision (YOLO), LLMs.
Projects: Chest Cancer Classifier, Facial Emotion ViT.
Style: Professional, technical, concise.
`;

app.post('/chat', async (req, res) => {
    try {
        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: context },
                { role: "user", content: req.body.message }
            ],
            model: "mixtral-8x7b-32768",
        });
        res.json({ reply: completion.choices[0].message.content });
    } catch (error) {
        res.status(500).json({ reply: "Connection Error" });
    }
});

app.listen(3000, () => console.log('Server running on 3000'));