import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import ChatSession from '../models/ChatHistory.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ─────────────────────────────────────────
   Node.js AI Agent Runner (Replaced Python)
───────────────────────────────────────── */
const runNodeAgent = async (message, history, apiKey) => {
    // 1. Input Guardrails
    const offTopicTriggers = [
        "cook", "recipe", "game cheat", "cheat code", "gossip", "movie plot", 
        "song lyric", "joke", "funny story", "play a game", "video game"
    ];
    const msgLower = message.toLowerCase();
    for (const trigger of offTopicTriggers) {
        if (msgLower.includes(trigger)) {
            return { reply: "I am AuraStudy AI, your academic companion. I can only assist with programming, database, and curriculum-related questions. Please ask a study-related question." };
        }
    }

    // 2. Build Gemini Payload
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const contents = history.map(chat => ({
        role: chat.sender === "user" ? "user" : "model",
        parts: [{ text: chat.text }]
    }));
    contents.push({ role: "user", parts: [{ text: message }] });

    const systemInstruction = {
        parts: [{
            text: "You are AuraStudy AI, a dedicated academic tutor and study assistant on the AuraLearn LMS platform.\n" +
                  "Ensure you strictly adhere to the following guidelines:\n\n" +
                  "1. SCOPE GUARDRAILS: Provide only educational, academic, and technical assistance (e.g. computer science, coding, web development, study tips). If the user asks about non-academic or unrelated topics, politely refuse to answer.\n" +
                  "2. STRICT EMOJI BAN: You must NEVER use any emojis, emoticons, smileys, checkmarks, arrows, stars, or pictograms in your response under any circumstances. All your replies must be entirely emoji-free and purely textual.\n" +
                  "3. FORMATTING: Output response using clean GitHub Markdown with section headers, bold keywords, bullet points, and syntax-highlighted code blocks where appropriate. Be concise, professional, and clear."
        }]
    };

    // 3. Make the API Call
    try {
        const response = await fetch(geminiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents, systemInstruction })
        });
        
        if (!response.ok) {
            const errBody = await response.text();
            throw new Error(`Agent HTTP Error ${response.status}: ${response.statusText}. Body: ${errBody}`);
        }

        const data = await response.json();
        let replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || "I am having trouble forming a response. Please try again.";

        // 4. Output Guardrails: Regex Emoji Cleaner
        const emojiPattern = /[\u{10000}-\u{10ffff}]|[\u{2600}-\u{27bf}]|[\u{2000}-\u{3300}]|[\u{2B50}]|[\u{26A0}]/gu;
        let cleanedReply = replyText.replace(emojiPattern, '').trim();

        return { reply: cleanedReply };
    } catch (error) {
        return { error: error.message };
    }
};

/* ─────────────────────────────────────────
   POST /api/chat/query
   Send message in a session (or create new session)
   Body: { message, sessionId? }
   Returns: { reply, sessionId, title }
───────────────────────────────────────── */
export const handleStudyQuery = async (req, res) => {
    try {
        const { message, sessionId } = req.body;
        if (!message) return res.status(400).json({ message: 'Message is required.' });

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) return res.status(400).json({ reply: 'Gemini API key is not configured.' });

        const userId = req.user?._id;

        // Load or create the session
        let session;
        if (sessionId) {
            session = await ChatSession.findOne({ _id: sessionId, userId });
            if (!session) return res.status(404).json({ message: 'Session not found.' });
        } else {
            // Brand new session — title will be set from first message (40 chars)
            session = await ChatSession.create({
                userId,
                title: message.trim().slice(0, 50) || 'New Chat',
                messages: []
            });
        }

        // Build history for Gemini from this session's messages
        const history = session.messages.map(m => ({ sender: m.sender, text: m.text }));

        // Run Gemini agent
        let reply;
        try {
            const result = await runNodeAgent(message, history, apiKey);
            if (result.error) throw new Error(result.error);
            reply = result.reply;
        } catch (agentError) {
            console.error('Node Agent Error:', agentError);
            return res.status(500).json({ message: 'AuraStudy Agent failed.', error: agentError.message });
        }

        // Append both messages to the session
        session.messages.push({ sender: 'user', text: message });
        session.messages.push({ sender: 'ai',   text: reply   });
        await session.save();

        return res.status(200).json({
            reply,
            sessionId: session._id,
            title: session.title
        });

    } catch (error) {
        console.error('Chat Controller Error:', error);
        res.status(500).json({ message: 'Server error.', error: error.message });
    }
};

/* ─────────────────────────────────────────
   GET /api/chat/sessions/:userId
   List all sessions (metadata only, no messages)
───────────────────────────────────────── */
export const listSessions = async (req, res) => {
    try {
        const { userId } = req.params;
        const sessions = await ChatSession
            .find({ userId })
            .select('title createdAt updatedAt')
            .sort({ updatedAt: -1 });  // newest first
        res.status(200).json(sessions);
    } catch (error) {
        res.status(500).json({ message: 'Error listing sessions.', error: error.message });
    }
};

/* ─────────────────────────────────────────
   GET /api/chat/sessions/:userId/:sessionId
   Get full messages of one session
───────────────────────────────────────── */
export const getSession = async (req, res) => {
    try {
        const { userId, sessionId } = req.params;
        const session = await ChatSession.findOne({ _id: sessionId, userId });
        if (!session) return res.status(404).json({ message: 'Session not found.' });
        res.status(200).json({
            _id: session._id,
            title: session.title,
            messages: session.messages.map(m => ({ sender: m.sender, text: m.text }))
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching session.', error: error.message });
    }
};

/* ─────────────────────────────────────────
   DELETE /api/chat/sessions/:userId/:sessionId
   Delete one session
───────────────────────────────────────── */
export const deleteSession = async (req, res) => {
    try {
        const { userId, sessionId } = req.params;
        await ChatSession.findOneAndDelete({ _id: sessionId, userId });
        res.status(200).json({ message: 'Session deleted.' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting session.', error: error.message });
    }
};

/* ─────────────────────────────────────────
   DELETE /api/chat/history/:userId  (clear all)
───────────────────────────────────────── */
export const clearChatHistory = async (req, res) => {
    try {
        const { userId } = req.params;
        await ChatSession.deleteMany({ userId });
        res.status(200).json({ message: 'All sessions cleared.' });
    } catch (error) {
        res.status(500).json({ message: 'Error clearing history.', error: error.message });
    }
};
