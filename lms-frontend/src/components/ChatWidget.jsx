import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FiSend, FiUser, FiLoader, FiMessageSquare, FiX, FiChevronLeft } from 'react-icons/fi';
import { toast } from 'react-toastify';

const ChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [contacts, setContacts] = useState([]);
    const [activeContact, setActiveContact] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [loadingContacts, setLoadingContacts] = useState(false);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const messagesEndRef = useRef(null);

    const user = JSON.parse(localStorage.getItem('auraUser') || '{}');
    const token = localStorage.getItem('token')?.replace(/"/g, '');
    const API_URL = import.meta.env.VITE_API_URL + "/";

    // Fetch contacts when widget opens for the first time
    useEffect(() => {
        if (isOpen && contacts.length === 0) {
            fetchContacts();
        }
    }, [isOpen]);

    // Initial background fetch just to get unread count badge
    useEffect(() => {
        fetchContacts(true); // silent fetch
    }, []);

    // Polling for new messages in active chat
    useEffect(() => {
        let interval;
        if (activeContact && isOpen) {
            interval = setInterval(() => {
                fetchMessages(activeContact._id, true); // true = silent fetch
            }, 3000);
        }
        return () => clearInterval(interval);
    }, [activeContact, isOpen]);

    const fetchContacts = async (silent = false) => {
        if (!silent) setLoadingContacts(true);
        try {
            const res = await axios.get(`${API_URL}api/messages/contacts`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setContacts(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingContacts(false);
        }
    };

    const fetchMessages = async (contactId, silent = false) => {
        if (!silent) setLoadingMessages(true);
        try {
            const res = await axios.get(`${API_URL}api/messages/conversation/${contactId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessages(res.data);
            
            // Auto scroll to bottom
            setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 100);

            // If we have unread messages in the contacts list for this user, clear them
            if (!silent) {
                setContacts(prev => prev.map(c => c._id === contactId ? { ...c, unreadCount: 0 } : c));
            }

            if (!silent) setLoadingMessages(false);
        } catch (err) {
            console.error(err);
            if (!silent) setLoadingMessages(false);
        }
    };

    const handleSelectContact = (contact) => {
        setActiveContact(contact);
        fetchMessages(contact._id);
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeContact) return;

        const msgText = newMessage.trim();
        setNewMessage(""); // Optimistic clear

        // Optimistic UI update
        const optimisticMsg = {
            _id: Date.now().toString(),
            senderId: user.id || user._id,
            receiverId: activeContact._id,
            text: msgText,
            createdAt: new Date().toISOString()
        };
        setMessages(prev => [...prev, optimisticMsg]);
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);

        try {
            await axios.post(`${API_URL}api/messages`, {
                receiverId: activeContact._id,
                text: msgText
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Let the polling catch the exact saved message
        } catch (err) {
            toast.error("Failed to send message.");
            // Revert optimistic if needed (simplified here)
        }
    };

    // Calculate total unread
    const totalUnread = contacts.reduce((acc, curr) => acc + (curr.unreadCount || 0), 0);

    return (
        <div className="fixed bottom-6 right-6 z-[9999] font-['Poppins']">
            
            {/* Expanded Widget Overlay (Large Centered Modal) */}
            {isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 sm:p-8">
                    <div className="w-full max-w-5xl h-[85vh] bg-[#0b0e14]/95 border border-white/10 rounded-3xl shadow-[0_10px_50px_rgba(0,0,0,0.8)] flex overflow-hidden animate-in zoom-in-95 fade-in duration-300">
                        
                        {/* --- LEFT SIDE: CONTACTS LIST --- */}
                        <div className={`w-full md:w-[300px] lg:w-[350px] border-r border-white/10 flex-col bg-[#05070a] ${activeContact ? 'hidden md:flex' : 'flex'}`}>
                            <div className="p-6 border-b border-white/10 flex items-center justify-between shrink-0">
                                <h3 className="text-white font-bold text-lg flex items-center gap-2">
                                    <FiMessageSquare className="text-[#a855f7]" /> Direct Messages
                                </h3>
                                <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white p-2 bg-white/5 rounded-xl transition-all md:hidden">
                                    <FiX size={18} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-2">
                                {loadingContacts ? (
                                    <div className="flex justify-center p-10"><FiLoader className="text-[#a855f7] animate-spin text-2xl" /></div>
                                ) : contacts.length > 0 ? (
                                    contacts.map(contact => (
                                        <div 
                                            key={contact._id} 
                                            onClick={() => handleSelectContact(contact)}
                                            className={`p-4 rounded-2xl flex items-center gap-4 cursor-pointer transition-all ${activeContact?._id === contact._id ? 'bg-[#a855f7]/20 border border-[#a855f7]/30 shadow-lg' : 'hover:bg-white/[0.05] border border-transparent'}`}
                                        >
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#a855f7] to-[#38bdf8] flex items-center justify-center text-white font-black text-lg shadow-inner shrink-0 relative">
                                                {contact.name?.charAt(0) || "U"}
                                                {contact.unreadCount > 0 && (
                                                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 border-2 border-[#1e293b] rounded-full flex items-center justify-center text-[10px] text-white font-black animate-pulse">
                                                        {contact.unreadCount}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-white font-bold text-sm tracking-tight truncate">{contact.name}</h4>
                                                <p className="text-[#38bdf8] text-[10px] font-bold uppercase tracking-widest mt-0.5">{contact.role}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center p-6 text-slate-500 text-xs italic">No contacts found.</div>
                                )}
                            </div>
                        </div>

                        {/* --- RIGHT SIDE: CHAT AREA --- */}
                        <div className={`flex-1 flex-col bg-[#0b0e14] relative ${activeContact ? 'flex' : 'hidden md:flex'}`}>
                            {activeContact ? (
                                <>
                                    {/* Chat Header */}
                                    <div className="bg-[#1e293b] p-5 flex items-center justify-between border-b border-white/10 shrink-0">
                                        <div className="flex items-center gap-4">
                                            <button onClick={() => setActiveContact(null)} className="md:hidden text-slate-400 hover:text-white transition-all">
                                                <FiChevronLeft size={24} />
                                            </button>
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#a855f7] to-[#38bdf8] flex items-center justify-center text-white font-black shadow-inner">
                                                {activeContact.name?.charAt(0) || "U"}
                                            </div>
                                            <div>
                                                <h3 className="text-white font-bold text-lg tracking-tight">{activeContact.name}</h3>
                                                <p className="text-[#38bdf8] text-[10px] font-black uppercase tracking-widest">{activeContact.role} • {activeContact.email}</p>
                                            </div>
                                        </div>
                                        <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white p-2 bg-white/5 hover:bg-red-500 hover:text-white rounded-xl transition-all">
                                            <FiX size={20} />
                                        </button>
                                    </div>

                                    {/* Chat Messages */}
                                    <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar bg-black/20">
                                        {loadingMessages ? (
                                            <div className="flex justify-center p-10"><FiLoader className="text-[#a855f7] animate-spin text-3xl" /></div>
                                        ) : messages.length > 0 ? (
                                            messages.map(msg => {
                                                const isMe = String(msg.senderId) === String(user.id || user._id);
                                                return (
                                                    <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                        <div className={`max-w-[75%] p-4 rounded-3xl ${isMe ? 'bg-gradient-to-br from-[#a855f7] to-[#820ad4] text-white rounded-tr-sm shadow-[0_5px_15px_rgba(168,85,247,0.3)]' : 'bg-[#1e293b] border border-white/10 text-slate-200 rounded-tl-sm shadow-lg'}`}>
                                                            <p className="text-sm font-medium leading-relaxed">{msg.text}</p>
                                                            <div className={`text-[9px] mt-2 font-bold uppercase tracking-widest ${isMe ? 'text-purple-200' : 'text-slate-500'}`}>
                                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            })
                                        ) : (
                                            <div className="h-full flex flex-col items-center justify-center text-slate-500">
                                                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4"><FiMessageSquare size={28} className="opacity-50"/></div>
                                                <p className="font-bold uppercase tracking-[2px] text-xs">No messages yet</p>
                                                <p className="text-[10px] mt-1">Start the conversation below.</p>
                                            </div>
                                        )}
                                        <div ref={messagesEndRef} />
                                    </div>

                                    {/* Chat Input */}
                                    <div className="p-5 border-t border-white/10 bg-[#05070a]">
                                        <form onSubmit={handleSendMessage} className="flex gap-4">
                                            <input 
                                                type="text" 
                                                value={newMessage}
                                                onChange={(e) => setNewMessage(e.target.value)}
                                                placeholder="Type your message here..."
                                                className="flex-1 bg-[#1e293b] border border-white/10 rounded-2xl px-6 py-4 text-sm text-white font-medium outline-none focus:border-[#a855f7] focus:ring-1 focus:ring-[#a855f7] transition-all"
                                            />
                                            <button 
                                                type="submit"
                                                disabled={!newMessage.trim()}
                                                className="bg-gradient-to-br from-[#a855f7] to-[#820ad4] text-white px-8 rounded-2xl font-bold flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_5px_15px_rgba(168,85,247,0.4)] transition-all hover:scale-105 active:scale-95"
                                            >
                                                <FiSend size={18} />
                                            </button>
                                        </form>
                                    </div>
                                </>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-slate-600 relative">
                                    <button onClick={() => setIsOpen(false)} className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 bg-white/5 rounded-xl transition-all">
                                        <FiX size={20} />
                                    </button>
                                    <FiMessageSquare size={80} className="mb-6 opacity-10" />
                                    <p className="text-lg font-black uppercase tracking-[4px] text-white/50">Select a Contact</p>
                                    <p className="text-[11px] mt-2 text-center font-bold">Choose a teacher or student from the left sidebar to start messaging.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Minimized Bubble Button */}
            {!isOpen && (
                <button 
                    onClick={() => setIsOpen(true)}
                    className="w-14 h-14 bg-gradient-to-br from-[#a855f7] to-[#820ad4] hover:scale-110 transition-transform duration-300 rounded-full shadow-[0_10px_25px_rgba(168,85,247,0.4)] flex items-center justify-center text-white relative"
                >
                    <FiMessageSquare size={24} />
                    {totalUnread > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 border-2 border-[#05070a] rounded-full flex items-center justify-center text-[10px] text-white font-black animate-pulse">
                            {totalUnread}
                        </span>
                    )}
                </button>
            )}
        </div>
    );
};

export default ChatWidget;
