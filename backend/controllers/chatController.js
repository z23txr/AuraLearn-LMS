import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import ChatSession from '../models/ChatHistory.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ─────────────────────────────────────────
   Python Agent Runner
───────────────────────────────────────── */
const runPythonAgent = (message, history, apiKey) => {
    return new Promise((resolve, reject) => {
        const pythonScriptPath = path.join(__dirname, 'study_agent.py');
        const child = spawn('python', [pythonScriptPath]);
        let outputData = '', errorData = '';
        child.stdout.on('data', d => { outputData += d.toString(); });
        child.stderr.on('data', d => { errorData += d.toString(); });
        child.on('close', code => {
            if (code !== 0) {
                reject(new Error(errorData || `Exit code ${code}`));
            } else {
                try { resolve(JSON.parse(outputData)); }
                catch (e) { reject(new Error(`Parse error: ${outputData}`)); }
            }
        });
        child.stdin.write(JSON.stringify({ apiKey, message, history }));
        child.stdin.end();
    });
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
            const result = await runPythonAgent(message, history, apiKey);
            if (result.error) throw new Error(result.error);
            reply = result.reply;
        } catch (agentError) {
            console.error('Python Agent Error:', agentError);
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
