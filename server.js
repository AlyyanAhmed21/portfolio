require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Groq = require('groq-sdk');

const app = express();
app.use(cors());
app.use(express.json());

const https = require('https');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const githubUser = process.env.GITHUB_USERNAME || 'AlyyanAhmed21';

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
        const model = process.env.GROQ_MODEL || "llama3-8b-8192";
        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: context },
                { role: "user", content: req.body.message }
            ],
            model
        });
        res.json({ reply: completion.choices[0].message.content });
    } catch (error) {
        res.status(500).json({ reply: "Connection Error", details: error.message });
    }
});

app.get('/github-stats', async (req, res) => {
    try {
        const token = process.env.GITHUB_TOKEN;
        if (!token) {
            return res.status(400).json({ error: 'Missing GitHub token' });
        }

        const query = `
          query($login: String!, $fromYear: DateTime!, $to: DateTime!) {
            user(login: $login) {
              repositories(privacy: PUBLIC) { totalCount }
              contributionsCollection(from: $fromYear, to: $to) {
                contributionCalendar { totalContributions }
                totalCommitContributions
              }
            }
          }
        `;

        const to = new Date().toISOString();
        const fromYear = new Date();
        fromYear.setFullYear(fromYear.getFullYear() - 1);
        const payload = JSON.stringify({
            query,
            variables: {
                login: githubUser,
                fromYear: fromYear.toISOString(),
                to
            }
        });

        const data = await new Promise((resolve, reject) => {
            const reqGh = https.request(
                {
                    hostname: 'api.github.com',
                    path: '/graphql',
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'User-Agent': 'portfolio-app',
                        'Authorization': `Bearer ${token}`,
                        'Content-Length': Buffer.byteLength(payload)
                    }
                },
                resp => {
                    let body = '';
                    resp.on('data', chunk => (body += chunk));
                    resp.on('end', () => {
                        if (resp.statusCode < 200 || resp.statusCode >= 300) {
                            return reject(new Error(`GitHub API error: ${resp.statusCode} ${body}`));
                        }
                        try {
                            resolve(JSON.parse(body));
                        } catch (e) {
                            reject(new Error('Invalid JSON from GitHub'));
                        }
                    });
                }
            );
            reqGh.on('error', reject);
            reqGh.write(payload);
            reqGh.end();
        });

        if (data?.errors?.length) {
            return res.status(500).json({ error: 'GitHub API error', details: data.errors.map(e => e.message).join(' | ') });
        }

        const user = data?.data?.user;
        if (!user) {
            return res.status(500).json({ error: 'Invalid GitHub response', details: 'User not found or missing data' });
        }

        res.json({
            publicRepos: user.repositories.totalCount,
            totalCommits: user.contributionsCollection.totalCommitContributions,
            contributionsLastYear: user.contributionsCollection.contributionCalendar.totalContributions
        });
    } catch (error) {
        res.status(500).json({ error: 'GitHub stats error', details: error.message });
    }
});

app.listen(3000, () => console.log('Server running on 3000'));
