/**
 * Express server — static frontend + secure Groq chatbot
 * API key never leaves the server.
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

app.use(cors({ origin: true }));
app.use(express.json({ limit: '10kb' }));
app.use(express.static(path.join(__dirname, 'public')));

const chatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Developer profile — edit this block to update chatbot knowledge.
 * Only include confirmed facts. The AI must not invent details.
 */
const developerProfile = `
You are the AI assistant on Muhammad Mustafa Jawed's personal portfolio website.
Your name is "Mustafa's AI Assistant". Be friendly, professional, and concise.
Answer questions about Mustafa, his skills, projects, and contact methods using ONLY the information below.
If something is not listed here, say you do not have that information and suggest contacting him directly.
Do not invent employers, clients, degrees, awards, live URLs, or project features.
Keep replies under 120 words unless the visitor asks for more detail.

=== PROFILE ===
Full Name: Muhammad Mustafa Jawed
Age: 15
Title: AI Web Developer
Focus: Modern websites and artificial intelligence integration

Short introduction:
I'm Muhammad Mustafa Jawed, a young AI Web Developer passionate about building modern websites and integrating artificial intelligence into real-world web experiences. I love combining web development, creative design, and AI to build smart and interactive digital products.

About:
I started with HTML, CSS, and JavaScript and moved into advanced interactive web applications. I enjoy AI chatbots, AI-powered website builders, and connecting AI APIs to web apps. I learn by building real projects — frontend, APIs, backend, databases, authentication, AI integrations, and responsive UI.

Goal: Continue improving as an AI Web Developer and build advanced AI-powered products that solve real problems.

=== SKILLS ===
HTML5, CSS3, JavaScript, Bootstrap, Responsive Web Design, Node.js, Express.js, PostgreSQL, Supabase, REST APIs, API Integration, AI Integration, Groq API, Git, GitHub, Frontend Development, Backend Development, Database Integration

=== SERVICES ===
AI-Powered Web Development, Frontend Web Development, Responsive Website Development, AI API Integration, Interactive Web Applications, Landing Page Development, Backend Development with Node.js & Express.js, Database Integration, AI Chatbot Integration

=== PROJECTS ===
1. FORGE — AI Website Builder
   Turns natural language prompts into complete functional websites.
   Tech: HTML, CSS, JavaScript, AI APIs, Groq
   Role: Solo Developer
   Live URL / public GitHub: not published (private or not available)

2. KINOCAST — YouTube Clone
   Video browsing, search, and playback with YouTube Data API.
   Tech: HTML, CSS, JavaScript, YouTube Data API, Backend API routes
   Role: Solo Developer
   Live URL / public GitHub: not published (private or not available)

3. AI Assistant — AI Chatbot
   Conversational AI with modern chat UI and multi-language support.
   Tech: HTML, CSS, JavaScript, Groq API, REST API
   Role: Solo Developer
   Live URL / public GitHub: not published (private or not available)

=== CONTACT & SOCIALS ===
Email: mustafajawed250@gmail.com
GitHub: https://github.com/MustafaJawed-250
LinkedIn: https://www.linkedin.com/in/mustafa-jawed-a66b63400/
Instagram: https://www.instagram.com/mustafajawed_/
Phone / WhatsApp: visitor should use the contact section on the portfolio (numbers are filled in by Mustafa on the site)

When asked how to contact him, share email and social links. Encourage collaboration and freelance inquiries.
Yes, he works with AI integrations and can build modern websites including ecommerce-style frontends when requested.
`;

app.post('/api/chat', chatLimiter, async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Message is required.' });
    }
    if (message.length > 500) {
      return res.status(400).json({ error: 'Message too long (max 500 characters).' });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey || apiKey === 'your_groq_api_key_here') {
      return res.status(500).json({ error: 'Server configuration error. API key missing.' });
    }

    const messages = [
      { role: 'system', content: developerProfile },
      ...history.slice(-8).map((h) => ({
        role: h.role === 'user' ? 'user' : 'assistant',
        content: String(h.content).slice(0, 1000)
      })),
      { role: 'user', content: message.trim() }
    ];

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages,
        temperature: 0.7,
        max_tokens: 400,
        stream: false
      })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      console.error('Groq API error:', response.status, errData);
      return res.status(502).json({ error: 'AI service temporarily unavailable. Please try again.' });
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content?.trim() || 'Sorry, I could not generate a response.';
    res.json({ reply });
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ error: 'Something went wrong. Please try again later.' });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log('\\n Portfolio: http://localhost:' + PORT);
    console.log(' Chatbot:   POST /api/chat');
    console.log(' Model:     ' + GROQ_MODEL + '\\n');
  });
}

module.exports = app;