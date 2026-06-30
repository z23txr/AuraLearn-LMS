import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import {
    FiSend, FiCpu, FiCode, FiDatabase, FiLayers, FiZap,
    FiTrash2, FiPlus, FiMessageSquare, FiClock, FiBookOpen
} from 'react-icons/fi';

const API = import.meta.env.VITE_API_URL + '/api';

const WELCOME_MSG = {
    sender: 'ai',
    text: "Hello! I am **AuraStudy AI**, your dedicated academic companion powered by Gemini 2.5.\n\nStart typing your question below, or click a quick query to begin. Each conversation is saved as a separate session."
};

/* ─── Format date nicely ─── */
const fmtDate = (d) => {
    const date = new Date(d);
    const now  = new Date();
    const diff = (now - date) / 1000;
    if (diff < 60)        return 'Just now';
    if (diff < 3600)      return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400)     return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800)    return date.toLocaleDateString([], { weekday: 'short' });
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

/* ─── Markdown renderer ─── */
const parseInline = (str) => {
    if (!str) return str;
    const parts = [];
    const re = /\*\*(.*?)\*\*/g;
    let m, last = 0;
    while ((m = re.exec(str)) !== null) {
        if (m.index > last) parts.push(str.substring(last, m.index));
        parts.push(<strong key={m.index} className="text-white font-semibold">{m[1]}</strong>);
        last = re.lastIndex;
    }
    if (last < str.length) parts.push(str.substring(last));
    return parts.length ? parts : str;
};

const renderContent = (text) => {
    if (!text) return null;
    const lines = text.split('\n');
    const els = [];
    let inCode = false, codeLines = [], lang = '';

    lines.forEach((line, i) => {
        if (line.startsWith('```')) {
            if (!inCode) { inCode = true; lang = line.replace('```','').trim() || 'CODE'; codeLines = []; }
            else {
                inCode = false;
                const code = codeLines.join('\n');
                els.push(
                    <div key={`c${i}`} className="my-3 rounded-2xl overflow-hidden border border-white/10 bg-[#060d1a]">
                        <div className="flex justify-between px-4 py-2 bg-white/[0.04] border-b border-white/5">
                            <span className="text-[10px] font-black text-[#38bdf8] uppercase tracking-[2px]">{lang}</span>
                            <button onClick={() => navigator.clipboard.writeText(code.trim())} className="text-[10px] text-slate-500 hover:text-white cursor-pointer">Copy</button>
                        </div>
                        <pre className="p-4 overflow-x-auto text-[#7dd3fc] text-xs font-mono whitespace-pre">{code.trim()}</pre>
                    </div>
                );
            }
            return;
        }
        if (inCode) { codeLines.push(line); return; }

        const c = line.trim();
        if (!c) { els.push(<div key={i} className="h-1.5" />); return; }
        if (c.startsWith('### ')) { els.push(<h3 key={i} className="text-[#38bdf8] font-bold mt-4 mb-2 text-sm">{c.slice(4)}</h3>); return; }
        if (c.startsWith('## '))  { els.push(<h2 key={i} className="text-white font-bold mt-4 mb-2">{c.slice(3)}</h2>); return; }
        if (c.startsWith('- ') || c.startsWith('* ')) {
            els.push(<div key={i} className="flex gap-2 mb-1 ml-1"><span className="text-[#a855f7] mt-1.5 text-xs shrink-0">•</span><p className="text-slate-300 text-sm leading-relaxed">{parseInline(c.slice(2))}</p></div>);
            return;
        }
        if (/^\d+\.\s/.test(c)) {
            const n = c.match(/^(\d+)\./)[1];
            els.push(<div key={i} className="flex gap-2 mb-1 ml-1"><span className="text-[#38bdf8] font-bold text-xs mt-1.5 shrink-0 w-4">{n}.</span><p className="text-slate-300 text-sm leading-relaxed">{parseInline(c.replace(/^\d+\.\s/,''))}</p></div>);
            return;
        }
        els.push(<p key={i} className="text-slate-300 text-sm leading-relaxed mb-1">{parseInline(c)}</p>);
    });
    return els;
};

/* ══════════════════════════════════════
   Main Component
══════════════════════════════════════ */
const AIAssistant = () => {
    const user      = JSON.parse(localStorage.getItem('auraUser') || '{}');
    const userId    = user?.id || user?._id;
    const token     = localStorage.getItem('token')?.replace(/"/g, '');
    const authHdr   = { Authorization: `Bearer ${token}` };
    const initials  = user?.name?.charAt(0)?.toUpperCase() || 'S';

    /* ── State ── */
    const [sessions,       setSessions]       = useState([]);    // sidebar list
    const [activeSession,  setActiveSession]  = useState(null);  // { _id, title, messages[] }
    const [inputValue,     setInputValue]     = useState('');
    const [isLoading,      setIsLoading]      = useState(false);
    const [sessionsLoading,setSessionsLoading]= useState(true);
    const [msgLoading,     setMsgLoading]     = useState(false);
    const [deletingId,     setDeletingId]     = useState(null);

    const messagesEndRef = useRef(null);
    const inputRef       = useRef(null);

    /* ── Auto-scroll ── */
    const scrollBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);
    useEffect(() => { scrollBottom(); }, [activeSession?.messages, isLoading]);

    /* ── Load sessions list ── */
    const loadSessions = useCallback(async () => {
        if (!userId) return;
        try {
            const { data } = await axios.get(`${API}/chat/sessions/${userId}`, { headers: authHdr });
            setSessions(data);
        } catch (e) {
            console.warn('Sessions load error:', e);
        } finally {
            setSessionsLoading(false);
        }
    }, [userId]);

    useEffect(() => { loadSessions(); }, [loadSessions]);

    /* ── Open a session ── */
    const openSession = async (session) => {
        if (activeSession?._id === session._id) return;
        setMsgLoading(true);
        try {
            const { data } = await axios.get(
                `${API}/chat/sessions/${userId}/${session._id}`,
                { headers: authHdr }
            );
            setActiveSession(data);
        } catch (e) {
            console.warn('Session open error:', e);
        } finally {
            setMsgLoading(false);
        }
    };

    /* ── New chat ── */
    const startNewChat = () => {
        setActiveSession({ _id: null, title: 'New Chat', messages: [WELCOME_MSG] });
        setInputValue('');
    };

    /* ── Delete session ── */
    const deleteSession = async (e, sessionId) => {
        e.stopPropagation();
        setDeletingId(sessionId);
        try {
            await axios.delete(`${API}/chat/sessions/${userId}/${sessionId}`, { headers: authHdr });
            setSessions(prev => prev.filter(s => s._id !== sessionId));
            if (activeSession?._id === sessionId) {
                setActiveSession(null);
            }
        } catch (e) {
            console.warn('Delete error:', e);
        } finally {
            setDeletingId(null);
        }
    };

    /* ── Send message ── */
    const handleSend = async (textToSend) => {
        const queryText = textToSend || inputValue;
        if (!queryText.trim() || isLoading) return;
        if (!textToSend) setInputValue('');

        // Optimistic: if no active session yet, show welcome + user message immediately
        const currentMessages = activeSession?.messages?.filter(m => m.sender !== 'ai' || m.text !== WELCOME_MSG.text)
            || [];
        const optimisticMsgs = [...(activeSession?.messages || [{ ...WELCOME_MSG }]),
            { sender: 'user', text: queryText }
        ];

        setActiveSession(prev => ({
            ...(prev || { _id: null, title: 'New Chat' }),
            messages: optimisticMsgs
        }));
        setIsLoading(true);

        try {
            const { data } = await axios.post(
                `${API}/chat/query`,
                { message: queryText, sessionId: activeSession?._id || undefined },
                { headers: authHdr }
            );

            // Update with AI reply
            setActiveSession(prev => ({
                ...prev,
                _id:    data.sessionId,
                title:  data.title || prev?.title || 'New Chat',
                messages: [...optimisticMsgs, { sender: 'ai', text: data.reply }]
            }));

            // Refresh sessions list (new session appears or updatedAt changes)
            loadSessions();

        } catch (err) {
            console.error('Send error:', err);
            setActiveSession(prev => ({
                ...prev,
                messages: [...optimisticMsgs, {
                    sender: 'ai',
                    text: '**Connection Error**\n\nUnable to reach AuraStudy AI. Please ensure the backend server is running.'
                }]
            }));
        } finally {
            setIsLoading(false);
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    };

    const handleKey = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
    };

    const quickPrompts = [
        { icon: <FiCode size={14} />,     title: 'React Hooks',      q: 'Explain useState and useEffect with examples.' },
        { icon: <FiDatabase size={14} />, title: 'MongoDB Schema',   q: 'Best practices for 1-to-many relationships in MongoDB.' },
        { icon: <FiLayers size={14} />,   title: 'MERN Stack',       q: 'Explain MERN stack folder structure and architecture.' },
        { icon: <FiZap size={14} />,      title: 'JS Study Plan',    q: 'Give me a 4-week plan to master JavaScript.' },
        { icon: <FiBookOpen size={14} />, title: 'OOP Concepts',     q: 'Explain the 4 pillars of OOP with code examples.' },
    ];

    const displayMessages = activeSession?.messages || [];

    return (
        <div className="flex gap-4 h-full font-['Poppins'] overflow-hidden">

            {/* ═══ LEFT: Sessions Sidebar ═══ */}
            <div className="hidden lg:flex flex-col w-[260px] xl:w-[280px] shrink-0 gap-3 overflow-hidden">

                {/* New Chat button */}
                <button
                    onClick={startNewChat}
                    className="flex items-center justify-center gap-2 w-full py-3.5 bg-gradient-to-r from-[#38bdf8] to-[#2563eb] text-white text-sm font-bold rounded-2xl hover:opacity-90 active:scale-95 transition-all cursor-pointer shadow-lg shadow-[#38bdf8]/15 shrink-0"
                >
                    <FiPlus size={16} />
                    New Chat
                </button>

                {/* Sessions list */}
                <div className="flex-1 bg-[#0a0f1e] border border-white/8 rounded-3xl overflow-hidden flex flex-col min-h-0">
                    <div className="px-4 py-3.5 border-b border-white/5 flex items-center gap-2 shrink-0">
                        <FiClock size={13} className="text-slate-600" />
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-[2px]">Chat History</span>
                        {sessions.length > 0 && (
                            <span className="ml-auto text-[9px] bg-white/5 text-slate-500 px-2 py-0.5 rounded-full font-bold">{sessions.length}</span>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto p-2 space-y-1" style={{ scrollbarWidth: 'none' }}>
                        {sessionsLoading ? (
                            <div className="p-4 space-y-3 animate-pulse">
                                {[1,2,3].map(i => (
                                    <div key={i} className="space-y-1.5">
                                        <div className="h-3 bg-white/5 rounded-full w-4/5" />
                                        <div className="h-2 bg-white/5 rounded-full w-2/5" />
                                    </div>
                                ))}
                            </div>
                        ) : sessions.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full py-10 text-center px-4">
                                <FiMessageSquare className="text-slate-700 mb-3" size={28} />
                                <p className="text-slate-600 text-xs leading-relaxed">No sessions yet. Start a new chat to begin.</p>
                            </div>
                        ) : (
                            sessions.map(s => (
                                <button
                                    key={s._id}
                                    onClick={() => openSession(s)}
                                    className={`w-full text-left p-3 rounded-2xl transition-all group flex items-start gap-2 cursor-pointer ${
                                        activeSession?._id === s._id
                                            ? 'bg-[#38bdf8]/10 border border-[#38bdf8]/20'
                                            : 'hover:bg-white/5 border border-transparent'
                                    }`}
                                >
                                    <FiMessageSquare
                                        size={14}
                                        className={`shrink-0 mt-0.5 ${activeSession?._id === s._id ? 'text-[#38bdf8]' : 'text-slate-600'}`}
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-xs font-semibold truncate ${activeSession?._id === s._id ? 'text-[#38bdf8]' : 'text-slate-300'}`}>
                                            {s.title}
                                        </p>
                                        <p className="text-[10px] text-slate-600 mt-0.5">{fmtDate(s.updatedAt)}</p>
                                    </div>
                                    <button
                                        onClick={(e) => deleteSession(e, s._id)}
                                        disabled={deletingId === s._id}
                                        className="shrink-0 opacity-0 group-hover:opacity-100 p-1 text-slate-600 hover:text-red-400 transition-all cursor-pointer rounded-lg hover:bg-red-500/10 disabled:opacity-50"
                                        title="Delete session"
                                    >
                                        <FiTrash2 size={12} />
                                    </button>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Quick prompts (collapsed) */}
                <div className="bg-[#0a0f1e] border border-white/8 rounded-3xl p-3 shrink-0">
                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-[2px] mb-2 px-1">Quick Start</p>
                    <div className="flex flex-col gap-1">
                        {quickPrompts.slice(0,3).map((p, i) => (
                            <button
                                key={i}
                                onClick={() => { startNewChat(); setTimeout(() => handleSend(p.q), 50); }}
                                disabled={isLoading}
                                className="flex items-center gap-2.5 p-2.5 bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 hover:border-[#38bdf8]/20 rounded-xl transition-all text-left cursor-pointer group disabled:opacity-40"
                            >
                                <span className="text-[#38bdf8] group-hover:text-[#a855f7] transition-colors shrink-0">{p.icon}</span>
                                <span className="text-[11px] text-slate-400 group-hover:text-white transition-colors truncate">{p.title}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ═══ RIGHT: Chat Area ═══ */}
            <div className="flex-1 flex flex-col bg-[#0a0f1e] border border-white/8 rounded-3xl overflow-hidden min-w-0">

                {/* Chat Header */}
                <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/[0.01]">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 bg-gradient-to-tr from-[#38bdf8] to-[#a855f7] rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg">
                            <FiCpu size={17} />
                        </div>
                        <div className="min-w-0">
                            <h3 className="text-white font-bold text-sm truncate">
                                {activeSession?.title || 'AuraStudy AI'}
                            </h3>
                            <p className="text-slate-500 text-[10px] flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                                Gemini 2.5 · Academic Companion
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        {/* Mobile new chat */}
                        <button
                            onClick={startNewChat}
                            className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold text-[#38bdf8] bg-[#38bdf8]/10 border border-[#38bdf8]/20 rounded-xl transition-all cursor-pointer"
                        >
                            <FiPlus size={12} /> New
                        </button>
                        {activeSession?._id && (
                            <button
                                onClick={(e) => deleteSession(e, activeSession._id)}
                                title="Delete this session"
                                className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold text-slate-500 hover:text-red-400 bg-white/5 hover:bg-red-500/10 rounded-xl transition-all cursor-pointer border border-white/5"
                            >
                                <FiTrash2 size={12} />
                                <span className="hidden sm:inline">Delete</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Messages Feed */}
                <div
                    className="flex-1 overflow-y-auto px-5 py-6 space-y-5"
                    style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.06) transparent' }}
                >
                    {/* No session selected */}
                    {!activeSession && !sessionsLoading && (
                        <div className="flex flex-col items-center justify-center h-full text-center gap-4">
                            <div className="w-16 h-16 bg-gradient-to-tr from-[#38bdf8]/20 to-[#a855f7]/20 border border-white/10 rounded-3xl flex items-center justify-center text-[#38bdf8]">
                                <FiCpu size={28} />
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-lg">AuraStudy AI</h3>
                                <p className="text-slate-500 text-sm mt-1 max-w-sm leading-relaxed">
                                    Select a past session from the sidebar, or start a new chat below.
                                </p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2 max-w-lg w-full">
                                {quickPrompts.map((p, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleSend(p.q)}
                                        className="flex items-center gap-3 p-4 bg-white/[0.03] border border-white/8 hover:border-[#38bdf8]/30 rounded-2xl text-left transition-all cursor-pointer group"
                                    >
                                        <span className="text-[#38bdf8] group-hover:text-[#a855f7] transition-colors shrink-0">{p.icon}</span>
                                        <div>
                                            <p className="text-white text-xs font-semibold">{p.title}</p>
                                            <p className="text-slate-600 text-[10px] mt-0.5 truncate">{p.q.slice(0,45)}...</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Loading session messages */}
                    {msgLoading && (
                        <div className="flex flex-col gap-5 animate-pulse">
                            {[1,2,3].map(i => (
                                <div key={i} className={`flex gap-3 ${i % 2 === 0 ? 'flex-row-reverse' : ''}`}>
                                    <div className="w-9 h-9 rounded-xl bg-white/5 shrink-0" />
                                    <div className={`space-y-2 max-w-[60%] ${i % 2 === 0 ? 'items-end' : ''}`}>
                                        <div className="h-3 bg-white/5 rounded-full w-40" />
                                        <div className="h-3 bg-white/5 rounded-full w-28" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Messages */}
                    {!msgLoading && displayMessages.map((msg, i) => (
                        <div
                            key={i}
                            className={`flex gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                        >
                            <div className={`w-9 h-9 rounded-xl shrink-0 flex items-center justify-center font-bold shadow-md ${
                                msg.sender === 'user'
                                    ? 'bg-gradient-to-tr from-[#38bdf8] to-[#2563eb] text-white text-sm'
                                    : 'bg-white/5 border border-white/10 text-[#a855f7]'
                            }`}>
                                {msg.sender === 'user' ? initials : <FiCpu size={16} />}
                            </div>
                            <div className={`max-w-[75%] xl:max-w-[72%] rounded-2xl border overflow-hidden ${
                                msg.sender === 'user'
                                    ? 'bg-gradient-to-br from-[#1e2d4a] to-[#0f1a2e] border-[#38bdf8]/15 rounded-tr-sm'
                                    : 'bg-[#111827]/60 border-white/5 rounded-tl-sm'
                            }`}>
                                <div className="p-4">{renderContent(msg.text)}</div>
                            </div>
                        </div>
                    ))}

                    {/* AI typing indicator */}
                    {isLoading && (
                        <div className="flex gap-3 animate-in fade-in duration-300">
                            <div className="w-9 h-9 rounded-xl shrink-0 flex items-center justify-center bg-white/5 border border-white/10 text-[#a855f7]">
                                <FiCpu size={16} />
                            </div>
                            <div className="bg-[#111827]/60 border border-white/5 rounded-2xl rounded-tl-sm p-4 flex items-center gap-1.5">
                                <span className="w-2 h-2 bg-[#38bdf8] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <span className="w-2 h-2 bg-[#a855f7] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <span className="w-2 h-2 bg-[#38bdf8] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="shrink-0 px-5 py-4 border-t border-white/5 bg-white/[0.01]">
                    {/* Mobile quick prompts */}
                    <div className="lg:hidden flex gap-2 mb-3 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                        {quickPrompts.slice(0,3).map((p,i) => (
                            <button key={i} onClick={() => handleSend(p.q)} disabled={isLoading}
                                className="shrink-0 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-[10px] text-slate-400 hover:text-white transition-all cursor-pointer whitespace-nowrap disabled:opacity-40">
                                {p.title}
                            </button>
                        ))}
                    </div>

                    <div className="flex gap-3 items-end">
                        <textarea
                            ref={inputRef}
                            value={inputValue}
                            onChange={e => {
                                setInputValue(e.target.value);
                                e.target.style.height = 'auto';
                                e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                            }}
                            onKeyDown={handleKey}
                            disabled={isLoading}
                            placeholder="Ask anything academic — your conversation will be saved automatically..."
                            rows={1}
                            className="flex-1 bg-white/[0.04] border border-white/10 focus:border-[#38bdf8]/40 rounded-2xl py-3.5 px-5 text-white text-sm outline-none placeholder:text-slate-600 resize-none transition-all disabled:opacity-50 leading-relaxed"
                            style={{ minHeight: '52px', maxHeight: '120px', scrollbarWidth: 'none' }}
                        />
                        <button
                            onClick={() => handleSend()}
                            disabled={isLoading || !inputValue.trim()}
                            className="w-[52px] h-[52px] shrink-0 rounded-2xl bg-gradient-to-r from-[#38bdf8] to-[#a855f7] text-white flex items-center justify-center shadow-lg active:scale-95 transition-all disabled:opacity-30 cursor-pointer hover:shadow-[0_0_20px_rgba(56,189,248,0.3)]"
                        >
                            <FiSend size={18} />
                        </button>
                    </div>
                    <p className="text-center text-slate-700 text-[9px] mt-2.5 uppercase tracking-widest">
                        AuraStudy AI · Academic use only · Sessions saved to database
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AIAssistant;
