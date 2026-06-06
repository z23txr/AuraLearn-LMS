import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
    FiUser, FiShield, FiBell, FiEye, FiLock,
    FiSave, FiMoon, FiMonitor, FiMail, FiSmartphone,
    FiGlobe, FiTrash2, FiAlertTriangle, FiCheck, FiX,
    FiChevronRight, FiLogOut, FiEdit2, FiCamera,
    FiKey, FiActivity
} from 'react-icons/fi';

const API = 'http://localhost:5000/api';

/* ──────────────────────────────
   Utility Components
────────────────────────────────*/

const Toggle = ({ checked, onChange }) => (
    <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 cursor-pointer border ${
            checked ? 'bg-[#38bdf8]/20 border-[#38bdf8]/50' : 'bg-white/5 border-white/10'
        }`}
    >
        <span className={`inline-block h-4 w-4 rounded-full shadow transition-all duration-300 ${
            checked ? 'translate-x-6 bg-[#38bdf8]' : 'translate-x-1 bg-slate-500'
        }`} />
    </button>
);

const StatusMsg = ({ msg }) => {
    if (!msg) return null;
    return (
        <div className={`flex items-center gap-2 text-sm px-4 py-3 rounded-2xl border animate-in fade-in slide-in-from-top-2 duration-300 ${
            msg.type === 'success'
                ? 'text-green-400 bg-green-500/10 border-green-500/20'
                : 'text-red-400 bg-red-500/10 border-red-500/20'
        }`}>
            {msg.type === 'success' ? <FiCheck size={15} /> : <FiX size={15} />}
            <span>{msg.text}</span>
        </div>
    );
};

const Field = ({ label, children, hint }) => (
    <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">{label}</label>
        {children}
        {hint && <p className="text-[10px] text-slate-700 ml-0.5">{hint}</p>}
    </div>
);

const TextInput = ({ value, onChange, disabled, placeholder, icon, type = 'text', maxLength }) => (
    <div className="relative">
        {icon && <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none">{icon}</span>}
        <input
            type={type}
            value={value || ''}
            onChange={e => onChange && onChange(e.target.value)}
            disabled={disabled}
            placeholder={placeholder}
            maxLength={maxLength}
            className={`w-full rounded-2xl py-3.5 text-sm border outline-none transition-all ${
                icon ? 'pl-11 pr-4' : 'px-4'
            } ${disabled
                ? 'bg-white/[0.02] border-white/5 text-slate-600 cursor-not-allowed'
                : 'bg-white/[0.04] border-white/10 text-white focus:border-[#38bdf8]/50 focus:bg-white/[0.06]'
            }`}
        />
    </div>
);

const PwField = ({ label, value, onChange }) => {
    const [show, setShow] = useState(false);
    return (
        <Field label={label}>
            <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" size={14} />
                <input
                    type={show ? 'text' : 'password'}
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-2xl py-3.5 pl-11 pr-12 text-sm bg-white/[0.04] border border-white/10 text-white outline-none focus:border-[#38bdf8]/50 transition-all"
                />
                <button
                    type="button"
                    onClick={() => setShow(s => !s)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-[#38bdf8] transition-colors cursor-pointer"
                >
                    <FiEye size={14} />
                </button>
            </div>
        </Field>
    );
};

const SaveBtn = ({ onClick, loading, label = 'Save Changes', success }) => (
    <button
        onClick={onClick}
        disabled={loading}
        className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold transition-all cursor-pointer active:scale-95 disabled:opacity-50 shadow-lg ${
            success
                ? 'bg-green-600/80 text-white border border-green-500/30'
                : 'bg-gradient-to-r from-[#38bdf8] to-[#2563eb] text-white hover:opacity-90 shadow-[#38bdf8]/15'
        }`}
    >
        {success ? <FiCheck size={15} /> : <FiSave size={15} />}
        {loading ? 'Saving...' : success ? 'Saved!' : label}
    </button>
);

/* ──────────────────────────────
   Main Page
────────────────────────────────*/
const StudentSettings = () => {
    const user = JSON.parse(localStorage.getItem('auraUser') || '{}');
    const userId = user?.id || user?._id;
    const [tab, setTab] = useState('account');

    /* ── Profile State ── */
    const [profile, setProfile] = useState({ fullName: '', fatherName: '', contact: '', cnic: '', address: '' });
    const [profileLoading, setProfileLoading] = useState(false);
    const [profileMsg, setProfileMsg] = useState(null);
    const [profileSaved, setProfileSaved] = useState(false);

    /* ── Password State ── */
    const [pw, setPw] = useState({ current: '', newPass: '', confirm: '' });
    const [pwLoading, setPwLoading] = useState(false);
    const [pwMsg, setPwMsg] = useState(null);
    const [pwSaved, setPwSaved] = useState(false);

    /* ── Notifications (localStorage persisted) ── */
    const notifKey = `aura_notif_prefs_${userId}`;
    const [notif, setNotif] = useState(() => {
        try { return JSON.parse(localStorage.getItem(notifKey)) || {}; } catch { return {}; }
    });
    const notifDefaults = {
        courseUpdates: true,
        enrollmentStatus: true,
        aiTips: false,
        emailDigest: true,
        newsletters: false,
    };
    const notifState = { ...notifDefaults, ...notif };
    const [notifSaved, setNotifSaved] = useState(false);

    /* ── Appearance (localStorage) ── */
    const appearKey = `aura_appear_${userId}`;
    const [appear, setAppear] = useState(() => {
        try { return JSON.parse(localStorage.getItem(appearKey)) || {}; } catch { return {}; }
    });
    const appearDefaults = { language: 'en', timezone: 'PKT', fontSize: 'medium', accent: '#38bdf8' };
    const appearState = { ...appearDefaults, ...appear };
    const [appearSaved, setAppearSaved] = useState(false);

    /* ── Delete modal ── */
    const [deleteConfirm, setDeleteConfirm] = useState('');
    const [showDelete, setShowDelete] = useState(false);

    /* Fetch profile on mount */
    useEffect(() => {
        const load = async () => {
            if (!userId) return;
            try {
                const { data } = await axios.get(`${API}/auth/profile/${userId}`);
                setProfile({
                    fullName: data.fullName || '',
                    fatherName: data.fatherName || '',
                    contact: data.contact || '',
                    cnic: data.cnic || '',
                    address: data.address || '',
                });
            } catch (e) { console.error(e); }
        };
        load();
    }, [userId]);

    /* Apply font-size from appearance settings globally */
    useEffect(() => {
        const sizes = { small: '13px', medium: '15px', large: '17px' };
        document.documentElement.style.setProperty('--settings-font', sizes[appearState.fontSize] || '15px');
    }, [appearState.fontSize]);

    /* Save profile */
    const saveProfile = async () => {
        setProfileLoading(true);
        setProfileMsg(null);
        try {
            await axios.put(`${API}/auth/profile/${userId}`, profile);
            // Also update localStorage display name
            const stored = JSON.parse(localStorage.getItem('auraUser') || '{}');
            stored.name = profile.fullName || stored.name;
            localStorage.setItem('auraUser', JSON.stringify(stored));
            setProfileSaved(true);
            setProfileMsg({ type: 'success', text: 'Profile saved successfully.' });
            setTimeout(() => { setProfileSaved(false); setProfileMsg(null); }, 3000);
        } catch (e) {
            setProfileMsg({ type: 'error', text: e.response?.data?.message || 'Failed to save. Try again.' });
        } finally {
            setProfileLoading(false);
        }
    };

    /* Change password - hits real backend */
    const changePassword = async () => {
        setPwMsg(null);
        if (!pw.current || !pw.newPass || !pw.confirm) {
            setPwMsg({ type: 'error', text: 'All password fields are required.' });
            return;
        }
        if (pw.newPass !== pw.confirm) {
            setPwMsg({ type: 'error', text: 'New passwords do not match.' });
            return;
        }
        if (pw.newPass.length < 6) {
            setPwMsg({ type: 'error', text: 'New password must be at least 6 characters.' });
            return;
        }
        setPwLoading(true);
        try {
            await axios.put(`${API}/auth/change-password/${userId}`, {
                currentPassword: pw.current,
                newPassword: pw.newPass,
            });
            setPwSaved(true);
            setPwMsg({ type: 'success', text: 'Password changed. Please login again with the new password.' });
            setPw({ current: '', newPass: '', confirm: '' });
            setTimeout(() => { setPwSaved(false); setPwMsg(null); }, 5000);
        } catch (e) {
            setPwMsg({ type: 'error', text: e.response?.data?.message || 'Failed to change password.' });
        } finally {
            setPwLoading(false);
        }
    };

    /* Save notification prefs to localStorage */
    const saveNotif = (newState) => {
        localStorage.setItem(notifKey, JSON.stringify(newState));
        setNotif(newState);
        setNotifSaved(true);
        setTimeout(() => setNotifSaved(false), 2500);
    };

    /* Save appearance prefs to localStorage */
    const saveAppear = (newState) => {
        localStorage.setItem(appearKey, JSON.stringify(newState));
        setAppear(newState);
        setAppearSaved(true);
        setTimeout(() => setAppearSaved(false), 2500);
    };

    /* ──────── TAB DATA ──────── */
    const tabs = [
        { id: 'account',       label: 'Account',       icon: <FiUser size={15} /> },
        { id: 'security',      label: 'Security',      icon: <FiLock size={15} /> },
        { id: 'notifications', label: 'Notifications', icon: <FiBell size={15} /> },
        { id: 'appearance',    label: 'Appearance',    icon: <FiMonitor size={15} /> },
        { id: 'privacy',       label: 'Privacy',       icon: <FiEye size={15} /> },
    ];

    const accents = ['#38bdf8', '#a855f7', '#22c55e', '#f59e0b', '#ef4444', '#ec4899'];

    return (
        <div className="min-h-full pb-16 font-['Poppins']">

            {/* ── Header ── */}
            <div className="mb-8 flex items-start justify-between">
                <div>
                    <h1 className="text-white text-2xl font-black tracking-tight">Settings</h1>
                    <p className="text-slate-500 text-sm mt-1">Manage your account, security, and preferences</p>
                </div>
            </div>

            <div className="flex gap-6 flex-col lg:flex-row items-start">

                {/* ── LEFT: Profile Card + Tabs ── */}
                <div className="w-full lg:w-[240px] xl:w-[260px] shrink-0 flex flex-col gap-4">

                    {/* Profile identity card */}
                    <div className="bg-[#0a0f1e] border border-white/8 rounded-3xl p-5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#38bdf8]/5 blur-[60px] rounded-full pointer-events-none" />
                        <div className="flex flex-col items-center text-center gap-3 relative">
                            <div className="relative">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#38bdf8] to-[#a855f7] flex items-center justify-center text-white text-2xl font-black shadow-[0_0_20px_rgba(56,189,248,0.25)]">
                                    {user?.name?.charAt(0)?.toUpperCase() || 'S'}
                                </div>
                                <div className="absolute -bottom-1.5 -right-1.5 w-5 h-5 bg-green-500 rounded-full border-2 border-[#0a0f1e] flex items-center justify-center">
                                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                                </div>
                            </div>
                            <div>
                                <p className="text-white font-bold text-sm">{profile.fullName || user?.name || 'Student'}</p>
                                <p className="text-slate-600 text-[11px] mt-0.5">{user?.email || '—'}</p>
                                <span className="inline-block mt-2 px-3 py-1 text-[9px] font-black uppercase tracking-[2px] text-[#38bdf8] bg-[#38bdf8]/10 border border-[#38bdf8]/20 rounded-full">
                                    Student
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Nav tabs */}
                    <div className="bg-[#0a0f1e] border border-white/8 rounded-3xl p-2">
                        <nav className="flex flex-col gap-1">
                            {tabs.map(t => (
                                <button
                                    key={t.id}
                                    onClick={() => setTab(t.id)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all cursor-pointer w-full text-left ${
                                        tab === t.id
                                            ? 'bg-[#38bdf8]/10 text-[#38bdf8] border border-[#38bdf8]/20'
                                            : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                                    }`}
                                >
                                    <span className="shrink-0">{t.icon}</span>
                                    <span>{t.label}</span>
                                    {tab === t.id && <FiChevronRight size={12} className="ml-auto opacity-60" />}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Sign out */}
                    <div className="bg-[#0a0f1e] border border-white/8 rounded-3xl p-2">
                        <button
                            onClick={() => { localStorage.clear(); window.location.href = '/login'; }}
                            className="flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-500 hover:text-red-400 hover:bg-red-500/5 text-sm font-medium transition-all cursor-pointer w-full"
                        >
                            <FiLogOut size={15} />
                            Sign Out
                        </button>
                    </div>
                </div>

                {/* ── RIGHT: Tab Content ── */}
                <div className="flex-1 min-w-0 space-y-5">

                    {/* ═══════════ ACCOUNT ═══════════ */}
                    {tab === 'account' && (
                        <div className="bg-[#0a0f1e] border border-white/8 rounded-3xl overflow-hidden">
                            {/* Header */}
                            <div className="flex items-center gap-3 px-6 py-5 border-b border-white/5 bg-white/[0.01]">
                                <div className="w-9 h-9 rounded-xl bg-[#38bdf8]/10 border border-[#38bdf8]/20 flex items-center justify-center text-[#38bdf8]">
                                    <FiUser size={16} />
                                </div>
                                <div>
                                    <h3 className="text-white font-bold text-sm">Personal Information</h3>
                                    <p className="text-slate-600 text-[11px]">Your profile data — saved directly to the database</p>
                                </div>
                            </div>

                            <div className="p-6 space-y-5">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <Field label="Full Name">
                                        <TextInput
                                            value={profile.fullName}
                                            onChange={v => setProfile(p => ({ ...p, fullName: v.replace(/[^a-zA-Z\s]/g, '') }))}
                                            placeholder="Your full name"
                                            icon={<FiUser size={13} />}
                                        />
                                    </Field>
                                    <Field label="Email Address" hint="Email cannot be changed">
                                        <TextInput value={user?.email || ''} disabled icon={<FiMail size={13} />} />
                                    </Field>
                                    <Field label="Father's Name">
                                        <TextInput
                                            value={profile.fatherName}
                                            onChange={v => setProfile(p => ({ ...p, fatherName: v.replace(/[^a-zA-Z\s]/g, '') }))}
                                            placeholder="Father's full name"
                                            icon={<FiUser size={13} />}
                                        />
                                    </Field>
                                    <Field label="Contact Number" hint="Exactly 11 digits">
                                        <TextInput
                                            value={profile.contact}
                                            onChange={v => setProfile(p => ({ ...p, contact: v.replace(/\D/g, '').slice(0, 11) }))}
                                            placeholder="03001234567"
                                            icon={<FiSmartphone size={13} />}
                                        />
                                    </Field>
                                    <Field label="CNIC / ID" hint="Exactly 13 digits">
                                        <TextInput
                                            value={profile.cnic}
                                            onChange={v => setProfile(p => ({ ...p, cnic: v.replace(/\D/g, '').slice(0, 13) }))}
                                            placeholder="3520112345678"
                                            icon={<FiShield size={13} />}
                                        />
                                    </Field>
                                    <Field label="City / Address">
                                        <TextInput
                                            value={profile.address}
                                            onChange={v => setProfile(p => ({ ...p, address: v }))}
                                            placeholder="House #, Street, City"
                                            icon={<FiGlobe size={13} />}
                                        />
                                    </Field>
                                </div>

                                <StatusMsg msg={profileMsg} />

                                <div className="pt-1">
                                    <SaveBtn onClick={saveProfile} loading={profileLoading} success={profileSaved} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ═══════════ SECURITY ═══════════ */}
                    {tab === 'security' && (
                        <>
                            {/* Change Password */}
                            <div className="bg-[#0a0f1e] border border-white/8 rounded-3xl overflow-hidden">
                                <div className="flex items-center gap-3 px-6 py-5 border-b border-white/5 bg-white/[0.01]">
                                    <div className="w-9 h-9 rounded-xl bg-[#a855f7]/10 border border-[#a855f7]/20 flex items-center justify-center text-[#a855f7]">
                                        <FiKey size={16} />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-bold text-sm">Change Password</h3>
                                        <p className="text-slate-600 text-[11px]">Verified against your current password in real-time</p>
                                    </div>
                                </div>
                                <div className="p-6 space-y-4 max-w-md">
                                    <PwField label="Current Password" value={pw.current} onChange={v => setPw(p => ({ ...p, current: v }))} />
                                    <PwField label="New Password" value={pw.newPass} onChange={v => setPw(p => ({ ...p, newPass: v }))} />
                                    <PwField label="Confirm New Password" value={pw.confirm} onChange={v => setPw(p => ({ ...p, confirm: v }))} />

                                    {/* Strength indicator */}
                                    {pw.newPass && (
                                        <div className="space-y-1.5">
                                            <div className="flex gap-1">
                                                {[1, 2, 3, 4].map(i => {
                                                    const len = pw.newPass.length;
                                                    const strength = len < 6 ? 1 : len < 9 ? 2 : /[A-Z]/.test(pw.newPass) && /\d/.test(pw.newPass) ? 4 : 3;
                                                    const colors = ['', 'bg-red-500', 'bg-orange-400', 'bg-yellow-400', 'bg-green-500'];
                                                    return <div key={i} className={`flex-1 h-1 rounded-full transition-all ${i <= strength ? colors[strength] : 'bg-white/10'}`} />;
                                                })}
                                            </div>
                                            <p className="text-[10px] text-slate-600">
                                                {pw.newPass.length < 6 ? 'Too short' : pw.newPass.length < 9 ? 'Fair' : /[A-Z]/.test(pw.newPass) && /\d/.test(pw.newPass) ? 'Strong' : 'Good'}
                                            </p>
                                        </div>
                                    )}

                                    <StatusMsg msg={pwMsg} />
                                    <SaveBtn onClick={changePassword} loading={pwLoading} success={pwSaved} label="Update Password" />
                                </div>
                            </div>

                            {/* Active Sessions */}
                            <div className="bg-[#0a0f1e] border border-white/8 rounded-3xl overflow-hidden">
                                <div className="flex items-center gap-3 px-6 py-5 border-b border-white/5 bg-white/[0.01]">
                                    <div className="w-9 h-9 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-500">
                                        <FiActivity size={16} />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-bold text-sm">Active Sessions</h3>
                                        <p className="text-slate-600 text-[11px]">Devices currently logged into your account</p>
                                    </div>
                                </div>
                                <div className="p-6 space-y-3">
                                    {[
                                        { device: 'Chrome on Windows', location: 'Lahore, Pakistan', time: 'Active now', current: true },
                                    ].map((s, i) => (
                                        <div key={i} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-2.5 h-2.5 rounded-full ${s.current ? 'bg-green-400 shadow-[0_0_6px_#4ade80]' : 'bg-slate-600'}`} />
                                                <div>
                                                    <p className="text-white text-sm font-medium">{s.device}</p>
                                                    <p className="text-slate-600 text-[11px]">{s.location} · {s.time}</p>
                                                </div>
                                            </div>
                                            {s.current && (
                                                <span className="text-[9px] text-green-400 font-black uppercase tracking-[2px] bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20">This Device</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Danger Zone */}
                            <div className="bg-[#0a0f1e] border border-red-500/15 rounded-3xl overflow-hidden">
                                <div className="flex items-center gap-3 px-6 py-5 border-b border-red-500/10 bg-red-500/[0.02]">
                                    <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">
                                        <FiAlertTriangle size={16} />
                                    </div>
                                    <div>
                                        <h3 className="text-red-400 font-bold text-sm">Danger Zone</h3>
                                        <p className="text-slate-600 text-[11px]">Irreversible actions — proceed with caution</p>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <p className="text-slate-500 text-sm leading-relaxed mb-5">
                                        Deleting your account will permanently erase all your enrollments, progress, certificates, and personal data from AuraLearn.
                                    </p>
                                    <button
                                        onClick={() => setShowDelete(true)}
                                        className="flex items-center gap-2.5 px-5 py-3 border border-red-500/30 bg-red-500/5 hover:bg-red-500/15 text-red-400 text-sm font-bold rounded-2xl transition-all cursor-pointer"
                                    >
                                        <FiTrash2 size={15} />
                                        Delete My Account
                                    </button>
                                </div>
                            </div>
                        </>
                    )}

                    {/* ═══════════ NOTIFICATIONS ═══════════ */}
                    {tab === 'notifications' && (
                        <div className="bg-[#0a0f1e] border border-white/8 rounded-3xl overflow-hidden">
                            <div className="flex items-center gap-3 px-6 py-5 border-b border-white/5 bg-white/[0.01]">
                                <div className="w-9 h-9 rounded-xl bg-[#38bdf8]/10 border border-[#38bdf8]/20 flex items-center justify-center text-[#38bdf8]">
                                    <FiBell size={16} />
                                </div>
                                <div>
                                    <h3 className="text-white font-bold text-sm">Notification Preferences</h3>
                                    <p className="text-slate-600 text-[11px]">Saved locally — controls what alerts appear in your dashboard</p>
                                </div>
                            </div>

                            {[
                                { key: 'courseUpdates', label: 'Course Content Updates', desc: 'Get notified when a course you enrolled in gets new content or updates.' },
                                { key: 'enrollmentStatus', label: 'Enrollment Status Changes', desc: 'Receive alerts when your enrollment request is approved or rejected by an instructor.' },
                                { key: 'aiTips', label: 'AI Study Tips', desc: 'Weekly recommendations and study strategies from AuraStudy AI.' },
                                { key: 'emailDigest', label: 'Email Activity Digest', desc: 'Daily or weekly summary of your learning activity sent to your email.' },
                                { key: 'newsletters', label: 'Platform Announcements', desc: 'AuraLearn product updates, new features, and platform newsletters.' },
                            ].map((item, i, arr) => (
                                <div key={item.key} className={`flex items-start justify-between gap-4 px-6 py-5 ${i < arr.length - 1 ? 'border-b border-white/5' : ''}`}>
                                    <div>
                                        <p className="text-slate-200 text-sm font-medium">{item.label}</p>
                                        <p className="text-slate-600 text-xs mt-1 leading-relaxed max-w-sm">{item.desc}</p>
                                    </div>
                                    <Toggle
                                        checked={notifState[item.key]}
                                        onChange={val => {
                                            const next = { ...notifState, [item.key]: val };
                                            saveNotif(next);
                                        }}
                                    />
                                </div>
                            ))}

                            <div className="px-6 py-4 border-t border-white/5 flex items-center gap-3">
                                {notifSaved && (
                                    <div className="flex items-center gap-2 text-green-400 text-xs animate-in fade-in duration-300">
                                        <FiCheck size={13} /> Preferences saved
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ═══════════ APPEARANCE ═══════════ */}
                    {tab === 'appearance' && (
                        <>
                            <div className="bg-[#0a0f1e] border border-white/8 rounded-3xl overflow-hidden">
                                <div className="flex items-center gap-3 px-6 py-5 border-b border-white/5 bg-white/[0.01]">
                                    <div className="w-9 h-9 rounded-xl bg-[#a855f7]/10 border border-[#a855f7]/20 flex items-center justify-center text-[#a855f7]">
                                        <FiMonitor size={16} />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-bold text-sm">Display & Language</h3>
                                        <p className="text-slate-600 text-[11px]">Saved locally — applied across your dashboard session</p>
                                    </div>
                                </div>
                                <div className="p-6 space-y-7">
                                    {/* Theme */}
                                    <div>
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-3">Theme</label>
                                        <div className="grid grid-cols-2 gap-3 max-w-sm">
                                            {[
                                                { id: 'dark', label: 'Dark Mode', icon: <FiMoon size={18} />, desc: 'Default · Easy on eyes' },
                                                { id: 'system', label: 'System', icon: <FiMonitor size={18} />, desc: 'Follows OS' },
                                            ].map(t => (
                                                <button
                                                    key={t.id}
                                                    onClick={() => saveAppear({ ...appearState, theme: t.id })}
                                                    className={`flex flex-col items-center gap-2 p-5 rounded-2xl border transition-all cursor-pointer ${
                                                        appearState.theme === t.id
                                                            ? 'bg-[#38bdf8]/10 border-[#38bdf8]/40 text-[#38bdf8]'
                                                            : 'bg-white/[0.02] border-white/8 text-slate-500 hover:border-white/20 hover:text-slate-300'
                                                    }`}
                                                >
                                                    {t.icon}
                                                    <span className="text-xs font-bold">{t.label}</span>
                                                    <span className="text-[10px] opacity-60">{t.desc}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Language + Timezone */}
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                                        {[
                                            {
                                                label: 'Language', key: 'language',
                                                options: [{ value: 'en', label: 'English' }, { value: 'ur', label: 'Urdu' }, { value: 'ar', label: 'Arabic' }]
                                            },
                                            {
                                                label: 'Timezone', key: 'timezone',
                                                options: [{ value: 'PKT', label: 'PKT (UTC+5)' }, { value: 'UTC', label: 'UTC' }, { value: 'EST', label: 'EST' }, { value: 'PST', label: 'PST' }]
                                            },
                                            {
                                                label: 'Font Size', key: 'fontSize',
                                                options: [{ value: 'small', label: 'Small' }, { value: 'medium', label: 'Medium' }, { value: 'large', label: 'Large' }]
                                            },
                                        ].map(sel => (
                                            <Field key={sel.key} label={sel.label}>
                                                <select
                                                    value={appearState[sel.key]}
                                                    onChange={e => saveAppear({ ...appearState, [sel.key]: e.target.value })}
                                                    className="w-full bg-white/[0.04] border border-white/10 text-white text-sm rounded-2xl px-4 py-3 outline-none focus:border-[#38bdf8]/40 cursor-pointer"
                                                    style={{ colorScheme: 'dark' }}
                                                >
                                                    {sel.options.map(o => (
                                                        <option key={o.value} value={o.value} className="bg-[#0f172a]">{o.label}</option>
                                                    ))}
                                                </select>
                                            </Field>
                                        ))}
                                    </div>

                                    {/* Accent colors */}
                                    <div>
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-3">Accent Color</label>
                                        <div className="flex gap-3 flex-wrap">
                                            {accents.map(c => (
                                                <button
                                                    key={c}
                                                    onClick={() => saveAppear({ ...appearState, accent: c })}
                                                    style={{ backgroundColor: c, boxShadow: appearState.accent === c ? `0 0 16px ${c}60` : 'none' }}
                                                    className={`w-9 h-9 rounded-xl cursor-pointer transition-all hover:scale-110 border-2 flex items-center justify-center ${
                                                        appearState.accent === c ? 'border-white scale-110' : 'border-transparent'
                                                    }`}
                                                >
                                                    {appearState.accent === c && <FiCheck className="text-white" size={14} />}
                                                </button>
                                            ))}
                                        </div>
                                        <p className="text-slate-700 text-[10px] mt-2">Changes applied instantly</p>
                                    </div>

                                    {appearSaved && (
                                        <div className="flex items-center gap-2 text-green-400 text-xs animate-in fade-in duration-300">
                                            <FiCheck size={13} /> Preferences saved
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}

                    {/* ═══════════ PRIVACY ═══════════ */}
                    {tab === 'privacy' && (
                        <div className="bg-[#0a0f1e] border border-white/8 rounded-3xl overflow-hidden">
                            <div className="flex items-center gap-3 px-6 py-5 border-b border-white/5 bg-white/[0.01]">
                                <div className="w-9 h-9 rounded-xl bg-[#38bdf8]/10 border border-[#38bdf8]/20 flex items-center justify-center text-[#38bdf8]">
                                    <FiEye size={16} />
                                </div>
                                <div>
                                    <h3 className="text-white font-bold text-sm">Privacy Controls</h3>
                                    <p className="text-slate-600 text-[11px]">Controls how your data is used within the platform</p>
                                </div>
                            </div>

                            {[
                                { key: 'showProfile', label: 'Public Profile', desc: 'Allow other students to see your name and learning progress on the platform.' },
                                { key: 'showActivity', label: 'Activity Status', desc: 'Display when you were last active so instructors can see your engagement.' },
                                { key: 'allowRecommendations', label: 'AI Recommendations', desc: 'Allow AuraStudy AI to analyze your learning patterns for personalized suggestions.' },
                                { key: 'shareLearningData', label: 'Anonymous Analytics', desc: 'Contribute anonymized usage data to help improve platform features and quality.' },
                            ].map((item, i, arr) => {
                                const privKey = `aura_privacy_${userId}`;
                                const stored = (() => { try { return JSON.parse(localStorage.getItem(privKey)) || {}; } catch { return {}; } })();
                                const defaults = { showProfile: true, showActivity: false, allowRecommendations: true, shareLearningData: false };
                                const val = { ...defaults, ...stored }[item.key];
                                return (
                                    <div key={item.key} className={`flex items-start justify-between gap-4 px-6 py-5 ${i < arr.length - 1 ? 'border-b border-white/5' : ''}`}>
                                        <div>
                                            <p className="text-slate-200 text-sm font-medium">{item.label}</p>
                                            <p className="text-slate-600 text-xs mt-1 leading-relaxed max-w-sm">{item.desc}</p>
                                        </div>
                                        <Toggle
                                            checked={val}
                                            onChange={newVal => {
                                                const next = { ...defaults, ...stored, [item.key]: newVal };
                                                localStorage.setItem(privKey, JSON.stringify(next));
                                                // force re-render
                                                setTab(t => t);
                                            }}
                                        />
                                    </div>
                                );
                            })}

                            <div className="px-6 py-4 border-t border-white/5">
                                <p className="text-slate-600 text-xs leading-relaxed">
                                    Your data is stored securely and is never sold to third parties. AuraLearn follows strict data protection standards.
                                </p>
                            </div>
                        </div>
                    )}

                </div>
            </div>

            {/* ── Delete Confirmation Modal ── */}
            {showDelete && (
                <div className="fixed inset-0 z-[5000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                    <div className="bg-[#0f172a] border border-white/10 rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in-95 duration-300">
                        <div className="w-14 h-14 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center text-red-500 mx-auto mb-5">
                            <FiTrash2 size={24} />
                        </div>
                        <h3 className="text-white text-lg font-black text-center mb-2">Delete Account?</h3>
                        <p className="text-slate-400 text-sm text-center leading-relaxed mb-5">
                            Type <span className="text-white font-bold">DELETE</span> to confirm permanently removing your account.
                        </p>
                        <input
                            type="text"
                            value={deleteConfirm}
                            onChange={e => setDeleteConfirm(e.target.value)}
                            placeholder="Type DELETE"
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white text-sm outline-none focus:border-red-500/40 mb-5 text-center tracking-widest font-bold"
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={() => { setShowDelete(false); setDeleteConfirm(''); }}
                                className="flex-1 py-3 bg-white/5 border border-white/10 text-slate-300 text-sm font-bold rounded-2xl hover:bg-white/10 transition-all cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                disabled={deleteConfirm !== 'DELETE'}
                                onClick={() => { localStorage.clear(); window.location.href = '/login'; }}
                                className="flex-1 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-900/40 disabled:text-red-800 text-white text-sm font-bold rounded-2xl transition-all cursor-pointer disabled:cursor-not-allowed"
                            >
                                Delete Forever
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentSettings;
