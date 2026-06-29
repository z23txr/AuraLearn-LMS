import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
    FiUser, FiShield, FiBell, FiEye, FiLock,
    FiSave, FiMoon, FiMonitor, FiMail, FiSmartphone,
    FiGlobe, FiTrash2, FiAlertTriangle, FiCheck, FiX,
    FiChevronRight, FiLogOut, FiEdit2, FiCamera,
    FiKey, FiActivity
} from 'react-icons/fi';
import { applyTheme } from '../../../utils/themeHelper';

const t = {
  en: {
    settings: "Settings",
    sub: "Manage your account, security, and preferences",
    account: "Account",
    security: "Security",
    notifications: "Notifications",
    appearance: "Appearance",
    privacy: "Privacy",
    signOut: "Sign Out",
    personalInfo: "Personal Information",
    personalInfoSub: "Your profile data — saved directly to the database",
    fullName: "Full Name",
    email: "Email Address",
    emailHint: "Email cannot be changed",
    fatherName: "Father's Name",
    contact: "Contact Number",
    contactHint: "Exactly 11 digits",
    cnic: "CNIC / ID",
    cnicHint: "Exactly 13 digits",
    address: "City / Address",
    saveChanges: "Save Changes",
    saved: "Saved!",
    saving: "Saving...",
    changePassword: "Change Password",
    pwSub: "Verified against your current password in real-time",
    currPw: "Current Password",
    newPw: "New Password",
    confPw: "Confirm New Password",
    strength: "Password Strength",
    sessions: "Active Sessions",
    sessionsSub: "Devices currently logged into your account",
    dangerZone: "Danger Zone",
    dangerZoneSub: "Irreversible actions — proceed with caution",
    dangerZoneDesc: "Deleting your account will permanently erase all your enrollments, progress, certificates, and personal data from AuraLearn.",
    deleteBtn: "Delete My Account",
    deleteConfirmTitle: "Delete Account?",
    deleteConfirmDesc: "Type DELETE to confirm permanently removing your account.",
    cancel: "Cancel",
    deleteForever: "Delete Forever",
    theme: "Theme",
    themeDark: "Dark Mode",
    themeDarkDesc: "Default · Easy on eyes",
    themeSystem: "System",
    themeSystemDesc: "Follows OS",
    language: "Language",
    timezone: "Timezone",
    fontSize: "Font Size",
    fontSizeSmall: "Small",
    fontSizeMedium: "Medium",
    fontSizeLarge: "Large",
    accentColor: "Accent Color",
    accentColorSub: "Changes applied instantly",
    prefSaved: "Preferences saved",
    notifTitle: "Notification Preferences",
    notifSub: "Saved locally — controls what alerts appear in your dashboard",
    courseUpdates: "Course Content Updates",
    courseUpdatesDesc: "Get notified when a course you enrolled in gets new content or updates.",
    enrollmentStatus: "Enrollment Status Changes",
    enrollmentStatusDesc: "Receive alerts when your enrollment request is approved or rejected by an instructor.",
    aiTips: "AI Study Tips",
    aiTipsDesc: "Weekly recommendations and study strategies from AuraStudy AI.",
    emailDigest: "Email Activity Digest",
    emailDigestDesc: "Daily or weekly summary of your learning activity sent to your email.",
    newsletters: "Platform Announcements",
    newslettersDesc: "AuraLearn product updates, new features, and platform newsletters.",
    displayLang: "Display & Language",
    displayLangSub: "Saved locally — applied across your dashboard session",
    privacyTitle: "Privacy Controls",
    privacySub: "Controls how your data is used within the platform",
    showProfile: "Public Profile",
    showProfileDesc: "Allow other students to see your name and learning progress on the platform.",
    showActivity: "Activity Status",
    showActivityDesc: "Display when you were last active so instructors can see your engagement.",
    allowRecommendations: "AI Recommendations",
    allowRecommendationsDesc: "Allow AuraStudy AI to analyze your learning patterns for personalized suggestions.",
    shareLearningData: "Anonymous Analytics",
    shareLearningDataDesc: "Contribute anonymized usage data to help improve platform features and quality.",
    privacyFooter: "Your data is stored securely and is never sold to third parties. AuraLearn follows strict data protection standards."
  },
  ur: {
    settings: "ترتیبات",
    sub: "اپنے اکاؤنٹ، سیکیورٹی اور ترجیحات کا نظم کریں",
    account: "اکاؤنٹ",
    security: "سیکیورٹی",
    notifications: "اطلاعات",
    appearance: "ظاہری شکل",
    privacy: "رازداری",
    signOut: "لاگ آؤٹ",
    personalInfo: "ذاتی معلومات",
    personalInfoSub: "آپ کا پروفائل ڈیٹا — براہ راست ڈیٹا بیس میں محفوظ ہے",
    fullName: "پورا نام",
    email: "ای میل ایڈریس",
    emailHint: "ای میل تبدیل نہیں کی جا سکتی",
    fatherName: "والد کا نام",
    contact: "رابطہ نمبر",
    contactHint: "بالکل 11 ہندسے",
    cnic: "شناختی کارڈ نمبر",
    cnicHint: "بالکل 13 ہندسے",
    address: "شہر / پتہ",
    saveChanges: "تبدیلیاں محفوظ کریں",
    saved: "محفوظ ہو گیا!",
    saving: "محفوظ ہو رہا ہے...",
    changePassword: "پاس ورڈ تبدیل کریں",
    pwSub: "ریئل ٹائم میں آپ کے موجودہ پاس ورڈ کے خلاف تصدیق شدہ",
    currPw: "موجودہ پاس ورڈ",
    newPw: "نیا پاس ورڈ",
    confPw: "نئے پاس ورڈ کی تصدیق کریں",
    strength: "پاس ورڈ کی طاقت",
    sessions: "فعال سیشنز",
    sessionsSub: "وہ آلات جو فی الحال آپ کے اکاؤنٹ میں لاگ ان ہیں",
    dangerZone: "خطرناک زون",
    dangerZoneSub: "ناقابل واپسی اقدامات — احتیاط کے ساتھ آگے بڑھیں",
    dangerZoneDesc: "اپنا اکاؤنٹ حذف کرنے سے آپ کے تمام داخلے، ترقی، سرٹیفکیٹ، اور ذاتی ڈیٹا ہمیشہ کے لیے حذف ہو جائے گا۔",
    deleteBtn: "میرا اکاؤنٹ حذف کریں",
    deleteConfirmTitle: "اکاؤنٹ حذف کریں؟",
    deleteConfirmDesc: "اکاؤنٹ کو مستقل طور پر ہٹانے کی تصدیق کے لیے DELETE ٹائپ کریں۔",
    cancel: "منسوخ کریں",
    deleteForever: "ہمیشہ کے لیے حذف کریں",
    theme: "تھیم",
    themeDark: "ڈارک موڈ",
    themeDarkDesc: "پہلے سے طے شدہ · آنکھوں پر آسان",
    themeSystem: "سسٹم",
    themeSystemDesc: "آپریٹنگ سسٹم کے مطابق",
    language: "زبان",
    timezone: "ٹائم زون",
    fontSize: "فونٹ کا سائز",
    fontSizeSmall: "چھوٹا",
    fontSizeMedium: "درمیانہ",
    fontSizeLarge: "بڑا",
    accentColor: "نمایاں رنگ (Accent)",
    accentColorSub: "تبدیلیاں فوراً لاگو ہو جائیں گی",
    prefSaved: "ترجیحات محفوظ ہو گئیں",
    notifTitle: "اطلاعات کی ترجیحات",
    notifSub: "مقامی طور پر محفوظ — کنٹرول کرتا ہے کہ آپ کے ڈیش بورڈ میں کیا الرٹس ظاہر ہوں",
    courseUpdates: "کورس کے مواد کی اپڈیٹس",
    courseUpdatesDesc: "جب آپ کے رجسٹرڈ کورس میں نیا مواد یا اپڈیٹ شامل ہو تو مطلع کیا جائے۔",
    enrollmentStatus: "اندراج کی حیثیت میں تبدیلیاں",
    enrollmentStatusDesc: "جب آپ کی رجسٹریشن کی درخواست انسٹرکٹر کی طرف سے منظور یا مسترد ہو تو الرٹ حاصل کریں۔",
    aiTips: "مصنوعی ذہانت (AI) کے مطالعہ کے مشورے",
    aiTipsDesc: "ہفتہ وار سفارشات اور مطالعہ کی حکمت عملی AuraStudy AI کی طرف سے۔",
    emailDigest: "ای میل سرگرمی کا خلاصہ",
    emailDigestDesc: "آپ کی سیکھنے کی سرگرمی کا روزانہ یا ہفتہ وار خلاصہ آپ کے ای میل پر بھیجا جائے گا۔",
    newsletters: "پلیٹ فارم کے اعلانات",
    newslettersDesc: "AuraLearn کی پروڈکٹ اپڈیٹس، نئی خصوصیات، اور پلیٹ فارم کے خبرنامے۔",
    displayLang: "ڈسپلے اور زبان",
    displayLangSub: "مقامی طور پر محفوظ — آپ کے ڈیش بورڈ سیشن پر لاگو",
    privacyTitle: "رازداری کے کنٹرولز",
    privacySub: "پلیٹ فارم کے اندر آپ کا ڈیٹا کیسے استعمال ہوتا ہے اس کو کنٹرول کریں",
    showProfile: "پبلک پروفائل",
    showProfileDesc: "دوسرے طلباء کو پلیٹ فارم پر آپ کا نام اور سیکھنے کی ترقی دیکھنے کی اجازت دیں۔",
    showActivity: "سرگرمی کی حیثیت",
    showActivityDesc: "ظاہر کریں کہ آپ آخری بار کب سرگرم تھے تاکہ اساتذہ آپ کی مصروفیت دیکھ سکیں۔",
    allowRecommendations: "اے آئی سفارشات",
    allowRecommendationsDesc: "شخصی نوعیت کی تجاویز کے لیے AuraStudy AI کو آپ کے سیکھنے کے پیٹرن کا تجزیہ کرنے کی اجازت دیں۔",
    shareLearningData: "گمنام تجزیات",
    shareLearningDataDesc: "پلیٹ فارم کی خصوصیات اور معیار کو بہتر بنانے میں مدد کے لیے گمنام استعمال کا ڈیٹا فراہم کریں۔",
    privacyFooter: "آپ کا ڈیٹا محفوظ طریقے سے اسٹور کیا جاتا ہے اور کبھی بھی تیسرے فریق کو فروخت نہیں کیا جاتا۔ AuraLearn سخت ڈیٹا پروٹیکشن کے اصولوں پر عمل کرتا ہے۔"
  },
  ar: {
    settings: "الإعدادات",
    sub: "إدارة حسابك وأمانك وتفضيلاتك",
    account: "الحساب",
    security: "الأمان",
    notifications: "الإشعارات",
    appearance: "المظهر",
    privacy: "الخصوصية",
    signOut: "تسجيل الخروج",
    personalInfo: "معلومات شخصية",
    personalInfoSub: "بيانات ملفك الشخصي — محفوظة مباشرة في قاعدة البيانات",
    fullName: "الاسم الكامل",
    email: "البريد الإلكتروني",
    emailHint: "لا يمكن تغيير البريد الإلكتروني",
    fatherName: "اسم الأب",
    contact: "رقم الاتصال",
    contactHint: "بالضبط 11 رقماً",
    cnic: "الرقم القومي / الهوية",
    cnicHint: "بالضبط 13 رقماً",
    address: "المدينة / العنوان",
    saveChanges: "حفظ التغييرات",
    saved: "تم الحفظ!",
    saving: "جاري الحفظ...",
    changePassword: "تغيير كلمة المرور",
    pwSub: "التحقق من كلمة المرور الحالية في الوقت الفعلي",
    currPw: "كلمة المرور الحالية",
    newPw: "كلمة مرور جديدة",
    confPw: "تأكيد كلمة المرور الجديدة",
    strength: "قوة كلمة المرور",
    sessions: "الجلسات النشطة",
    sessionsSub: "الأجهزة المسجلة حالياً في حسابك",
    dangerZone: "منطقة الخطر",
    dangerZoneSub: "إجراءات لا رجعة فيها — تابع بحذر",
    dangerZoneDesc: "حذف حسابك سيؤدي نهائياً إلى محو جميع عمليات التسجيل والتقدم والشهادات والبيانات الشخصية من AuraLearn.",
    deleteBtn: "احذف حسابي",
    deleteConfirmTitle: "حذف الحساب؟",
    deleteConfirmDesc: "اكتب DELETE لتأكيد إزالة حسابك بشكل دائم.",
    cancel: "إلغاء",
    deleteForever: "حذف نهائي",
    theme: "المظهر",
    themeDark: "الوضع الداكن",
    themeDarkDesc: "افتراضي · مريح للعينين",
    themeSystem: "النظام",
    themeSystemDesc: "يتبع نظام التشغيل",
    language: "اللغة",
    timezone: "المنطقة الزمنية",
    fontSize: "حجم الخط",
    fontSizeSmall: "صغير",
    fontSizeMedium: "متوسط",
    fontSizeLarge: "كبير",
    accentColor: "لون التأكيد (Accent)",
    accentColorSub: "يتم تطبيق التغييرات على الفور",
    prefSaved: "تم حفظ التفضيلات",
    notifTitle: "تفضيلات الإشعارات",
    notifSub: "تم الحفظ محلياً — للتحكم في التنبيهات التي تظهر في لوحة التحكم الخاصة بك",
    courseUpdates: "تحديثات محتوى الكورس",
    courseUpdatesDesc: "تلقي إشعارات عندما يحصل الكورس الذي سجلت فيه على محتوى جديد أو تحديثات.",
    enrollmentStatus: "تغييرات حالة التسجيل",
    enrollmentStatusDesc: "تلقي تنبيهات عندما يتم قبول طلب التسجيل الخاص بك أو رفضه من قبل المعلم.",
    aiTips: "نصائح الدراسة بالذكاء الاصطناعي",
    aiTipsDesc: "توصيات واستراتيجيات دراسية أسبوعية من AuraStudy AI.",
    emailDigest: "ملخص النشاط عبر البريد الإلكتروني",
    emailDigestDesc: "ملخص يومي أو أسبوعي لنشاطك التعليمي يتم إرساله إلى بريدك الإلكتروني.",
    newsletters: "إعلانات المنصة",
    newslettersDesc: "تحديثات منتجات AuraLearn، والميزات الجديدة، ونشرات المنصة الإخبارية.",
    displayLang: "الشاشة واللغة",
    displayLangSub: "تم الحفظ محلياً — يتم تطبيقه عبر جلسة لوحة التحكم الخاصة بك",
    privacyTitle: "عناصر التحكم في الخصوصية",
    privacySub: "التحكم في كيفية استخدام بياناتك داخل المنصة",
    showProfile: "الملف الشخصي العام",
    showProfileDesc: "السماح للطلاب الآخرين برؤية اسمك وتقدمك التعليمي على المنصة.",
    showActivity: "حالة النشاط",
    showActivityDesc: "عرض آخر مرة كنت نشطاً فيها حتى يتمكن المعلمون من رؤية مشاركتك.",
    allowRecommendations: "توصيات الذكاء الاصطناعي",
    allowRecommendationsDesc: "السماح لـ AuraStudy AI بتحليل أنماط التعلم الخاصة بك للحصول على اقتراحات مخصصة.",
    shareLearningData: "التحليلات المجهولة",
    shareLearningDataDesc: "المساهمة ببيانات الاستخدام المجهولة للمساعدة في تحسين ميزات وجودة المنصة.",
    privacyFooter: "يتم تخزين بياناتك بشكل آمن ولا يتم بيعها مطلقاً لأطراف ثالثة. يتبع AuraLearn معايير صارمة لحماية البيانات."
  }
};

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
    const appearDefaults = { language: 'en', timezone: 'PKT', fontSize: 'medium', accent: '#38bdf8', theme: 'dark' };
    const appearState = { ...appearDefaults, ...appear };
    const [appearSaved, setAppearSaved] = useState(false);

    /* ── Privacy (localStorage) ── */
    const privKey = `aura_privacy_${userId}`;
    const [privacy, setPrivacy] = useState(() => {
        try { return JSON.parse(localStorage.getItem(privKey)) || {}; } catch { return {}; }
    });
    const privacyDefaults = { showProfile: true, showActivity: false, allowRecommendations: true, shareLearningData: false };
    const privacyState = { ...privacyDefaults, ...privacy };
    const [privacySaved, setPrivacySaved] = useState(false);

    const savePrivacy = (newState) => {
        localStorage.setItem(privKey, JSON.stringify(newState));
        setPrivacy(newState);
        setPrivacySaved(true);
        setTimeout(() => setPrivacySaved(false), 2500);
    };

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

    /* Save appearance prefs to localStorage and apply dynamically */
    const saveAppear = (newState) => {
        localStorage.setItem(appearKey, JSON.stringify(newState));
        setAppear(newState);
        applyTheme(newState, userId);
        setAppearSaved(true);
        setTimeout(() => setAppearSaved(false), 2500);
    };

    const lang = appearState.language || 'en';
    const s = t[lang] || t['en'];

    /* ──────── TAB DATA ──────── */
    const tabs = [
        { id: 'account',       label: s.account,       icon: <FiUser size={15} /> },
        { id: 'security',      label: s.security,      icon: <FiLock size={15} /> },
        { id: 'notifications', label: s.notifications, icon: <FiBell size={15} /> },
        { id: 'appearance',    label: s.appearance,    icon: <FiMonitor size={15} /> },
        { id: 'privacy',       label: s.privacy,       icon: <FiEye size={15} /> },
    ];

    const accents = ['#38bdf8', '#a855f7', '#22c55e', '#f59e0b', '#ef4444', '#ec4899'];

    return (
        <div className="min-h-full pb-16 font-['Poppins']">

            {/* ── Header ── */}
            <div className="mb-8 flex items-start justify-between">
                <div>
                    <h1 className="text-white text-2xl font-black tracking-tight">{s.settings}</h1>
                    <p className="text-slate-500 text-sm mt-1">{s.sub}</p>
                </div>
            </div>

            <div className="flex gap-6 flex-col lg:flex-row items-start">

                {/* ── LEFT: Profile Card + Tabs ── */}
                <div className="w-full lg:w-[240px] xl:w-[260px] shrink-0 flex flex-col gap-4">

                    {/* Profile identity card — hidden on mobile, shown on lg */}
                    <div className="hidden lg:block bg-[#0a0f1e] border border-white/8 rounded-3xl p-5 relative overflow-hidden">
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

                    {/* Nav tabs — horizontal scroll on mobile, vertical on lg */}
                    <div className="bg-[#0a0f1e] border border-white/8 rounded-3xl p-2">
                        <nav className="flex flex-row lg:flex-col gap-1 overflow-x-auto no-scrollbar">
                            {tabs.map(t => (
                                <button
                                    key={t.id}
                                    onClick={() => setTab(t.id)}
                                    className={`flex items-center gap-2 lg:gap-3 px-3 lg:px-4 py-2.5 lg:py-3 rounded-2xl text-xs lg:text-sm font-medium transition-all cursor-pointer shrink-0 lg:w-full text-left ${
                                        tab === t.id
                                            ? 'bg-[#38bdf8]/10 text-[#38bdf8] border border-[#38bdf8]/20'
                                            : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                                    }`}
                                >
                                    <span className="shrink-0">{t.icon}</span>
                                    <span className="whitespace-nowrap">{t.label}</span>
                                    {tab === t.id && <FiChevronRight size={12} className="ml-auto opacity-60 hidden lg:block" />}
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
                            {s.signOut}
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
                                    <h3 className="text-white font-bold text-sm">{s.personalInfo}</h3>
                                    <p className="text-slate-600 text-[11px]">{s.personalInfoSub}</p>
                                </div>
                            </div>

                            <div className="p-6 space-y-5">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <Field label={s.fullName}>
                                        <TextInput
                                            value={profile.fullName}
                                            onChange={v => setProfile(p => ({ ...p, fullName: v.replace(/[^a-zA-Z\s]/g, '') }))}
                                            placeholder="Your full name"
                                            icon={<FiUser size={13} />}
                                        />
                                    </Field>
                                    <Field label={s.email} hint={s.emailHint}>
                                        <TextInput value={user?.email || ''} disabled icon={<FiMail size={13} />} />
                                    </Field>
                                    <Field label={s.fatherName}>
                                        <TextInput
                                            value={profile.fatherName}
                                            onChange={v => setProfile(p => ({ ...p, fatherName: v.replace(/[^a-zA-Z\s]/g, '') }))}
                                            placeholder="Father's full name"
                                            icon={<FiUser size={13} />}
                                        />
                                    </Field>
                                    <Field label={s.contact} hint={s.contactHint}>
                                        <TextInput
                                            value={profile.contact}
                                            onChange={v => setProfile(p => ({ ...p, contact: v.replace(/\D/g, '').slice(0, 11) }))}
                                            placeholder="03001234567"
                                            icon={<FiSmartphone size={13} />}
                                        />
                                    </Field>
                                    <Field label={s.cnic} hint={s.cnicHint}>
                                        <TextInput
                                            value={profile.cnic}
                                            onChange={v => setProfile(p => ({ ...p, cnic: v.replace(/\D/g, '').slice(0, 13) }))}
                                            placeholder="3520112345678"
                                            icon={<FiShield size={13} />}
                                        />
                                    </Field>
                                    <Field label={s.address}>
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
                                    <SaveBtn onClick={saveProfile} loading={profileLoading} success={profileSaved} label={s.saveChanges} />
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
                                        <h3 className="text-white font-bold text-sm">{s.changePassword}</h3>
                                        <p className="text-slate-600 text-[11px]">{s.pwSub}</p>
                                    </div>
                                </div>
                                <div className="p-6 space-y-4 max-w-md">
                                    <PwField label={s.currPw} value={pw.current} onChange={v => setPw(p => ({ ...p, current: v }))} />
                                    <PwField label={s.newPw} value={pw.newPass} onChange={v => setPw(p => ({ ...p, newPass: v }))} />
                                    <PwField label={s.confPw} value={pw.confirm} onChange={v => setPw(p => ({ ...p, confirm: v }))} />

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
                                                {pw.newPass.length < 6 ? (s.themeSystemDesc /* borrowing description or default */ ? 'Too short' : 'Too short') : pw.newPass.length < 9 ? 'Fair' : /[A-Z]/.test(pw.newPass) && /\d/.test(pw.newPass) ? 'Strong' : 'Good'}
                                            </p>
                                        </div>
                                    )}

                                    <StatusMsg msg={pwMsg} />
                                    <SaveBtn onClick={changePassword} loading={pwLoading} success={pwSaved} label={s.changePassword} />
                                </div>
                            </div>

                            {/* Active Sessions */}
                            <div className="bg-[#0a0f1e] border border-white/8 rounded-3xl overflow-hidden">
                                <div className="flex items-center gap-3 px-6 py-5 border-b border-white/5 bg-white/[0.01]">
                                    <div className="w-9 h-9 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-500">
                                        <FiActivity size={16} />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-bold text-sm">{s.sessions}</h3>
                                        <p className="text-slate-600 text-[11px]">{s.sessionsSub}</p>
                                    </div>
                                </div>
                                <div className="p-6 space-y-3">
                                    {[
                                        { device: 'Chrome on Windows', location: 'Lahore, Pakistan', time: 'Active now', current: true },
                                    ].map((sItem, i) => (
                                        <div key={i} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-2.5 h-2.5 rounded-full ${sItem.current ? 'bg-green-400 shadow-[0_0_6px_#4ade80]' : 'bg-slate-600'}`} />
                                                <div>
                                                    <p className="text-white text-sm font-medium">{sItem.device}</p>
                                                    <p className="text-slate-600 text-[11px]">{sItem.location} · {sItem.time}</p>
                                                </div>
                                            </div>
                                            {sItem.current && (
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
                                        <h3 className="text-red-400 font-bold text-sm">{s.dangerZone}</h3>
                                        <p className="text-slate-600 text-[11px]">{s.dangerZoneSub}</p>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <p className="text-slate-500 text-sm leading-relaxed mb-5">
                                        {s.dangerZoneDesc}
                                    </p>
                                    <button
                                        onClick={() => setShowDelete(true)}
                                        className="flex items-center gap-2.5 px-5 py-3 border border-red-500/30 bg-red-500/5 hover:bg-red-500/15 text-red-400 text-sm font-bold rounded-2xl transition-all cursor-pointer"
                                    >
                                        <FiTrash2 size={15} />
                                        {s.deleteBtn}
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
                                    <h3 className="text-white font-bold text-sm">{s.notifTitle}</h3>
                                    <p className="text-slate-600 text-[11px]">{s.notifSub}</p>
                                </div>
                            </div>

                            {[
                                { key: 'courseUpdates', label: s.courseUpdates, desc: s.courseUpdatesDesc },
                                { key: 'enrollmentStatus', label: s.enrollmentStatus, desc: s.enrollmentStatusDesc },
                                { key: 'aiTips', label: s.aiTips, desc: s.aiTipsDesc },
                                { key: 'emailDigest', label: s.emailDigest, desc: s.emailDigestDesc },
                                { key: 'newsletters', label: s.newsletters, desc: s.newslettersDesc },
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
                                        <FiCheck size={13} /> {s.prefSaved}
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
                                        <h3 className="text-white font-bold text-sm">{s.displayLang}</h3>
                                        <p className="text-slate-600 text-[11px]">{s.displayLangSub}</p>
                                    </div>
                                </div>
                                <div className="p-6 space-y-7">
                                    {/* Theme */}
                                    <div>
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-3">{s.theme}</label>
                                        <div className="grid grid-cols-2 gap-3 max-w-sm">
                                            {[
                                                { id: 'dark', label: s.themeDark, icon: <FiMoon size={18} />, desc: s.themeDarkDesc },
                                                { id: 'system', label: s.themeSystem, icon: <FiMonitor size={18} />, desc: s.themeSystemDesc },
                                            ].map(themeItem => (
                                                <button
                                                    key={themeItem.id}
                                                    onClick={() => saveAppear({ ...appearState, theme: themeItem.id })}
                                                    className={`flex flex-col items-center gap-2 p-5 rounded-2xl border transition-all cursor-pointer ${
                                                        appearState.theme === themeItem.id
                                                            ? 'bg-[#38bdf8]/10 border-[#38bdf8]/40 text-[#38bdf8]'
                                                            : 'bg-white/[0.02] border-white/8 text-slate-500 hover:border-white/20 hover:text-slate-300'
                                                    }`}
                                                >
                                                    {themeItem.icon}
                                                    <span className="text-xs font-bold">{themeItem.label}</span>
                                                    <span className="text-[10px] opacity-60">{themeItem.desc}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Language + Timezone */}
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                                        {[
                                            {
                                                label: s.language, key: 'language',
                                                options: [{ value: 'en', label: 'English' }, { value: 'ur', label: 'Urdu' }, { value: 'ar', label: 'Arabic' }]
                                            },
                                            {
                                                label: s.timezone, key: 'timezone',
                                                options: [{ value: 'PKT', label: 'PKT (UTC+5)' }, { value: 'UTC', label: 'UTC' }, { value: 'EST', label: 'EST' }, { value: 'PST', label: 'PST' }]
                                            },
                                            {
                                                label: s.fontSize, key: 'fontSize',
                                                options: [{ value: 'small', label: s.fontSizeSmall }, { value: 'medium', label: s.fontSizeMedium }, { value: 'large', label: s.fontSizeLarge }]
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
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-3">{s.accentColor}</label>
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
                                        <p className="text-slate-700 text-[10px] mt-2">{s.accentColorSub}</p>
                                    </div>

                                    {appearSaved && (
                                        <div className="flex items-center gap-2 text-green-400 text-xs animate-in fade-in duration-300">
                                            <FiCheck size={13} /> {s.prefSaved}
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
                                    <h3 className="text-white font-bold text-sm">{s.privacyTitle}</h3>
                                    <p className="text-slate-600 text-[11px]">{s.privacySub}</p>
                                </div>
                            </div>

                            {[
                                { key: 'showProfile', label: s.showProfile, desc: s.showProfileDesc },
                                { key: 'showActivity', label: s.showActivity, desc: s.showActivityDesc },
                                { key: 'allowRecommendations', label: s.allowRecommendations, desc: s.allowRecommendationsDesc },
                                { key: 'shareLearningData', label: s.shareLearningData, desc: s.shareLearningDataDesc },
                            ].map((item, i, arr) => (
                                <div key={item.key} className={`flex items-start justify-between gap-4 px-6 py-5 ${i < arr.length - 1 ? 'border-b border-white/5' : ''}`}>
                                    <div>
                                        <p className="text-slate-200 text-sm font-medium">{item.label}</p>
                                        <p className="text-slate-600 text-xs mt-1 leading-relaxed max-w-sm">{item.desc}</p>
                                    </div>
                                    <Toggle
                                        checked={privacyState[item.key]}
                                        onChange={newVal => {
                                            const next = { ...privacyState, [item.key]: newVal };
                                            savePrivacy(next);
                                        }}
                                    />
                                </div>
                            ))}

                            <div className="px-6 py-4 border-t border-white/5">
                                <p className="text-slate-600 text-xs leading-relaxed">
                                    {s.privacyFooter}
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
                        <h3 className="text-white text-lg font-black text-center mb-2">{s.deleteConfirmTitle}</h3>
                        <p className="text-slate-400 text-sm text-center leading-relaxed mb-5">
                            {s.deleteConfirmDesc}
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
                                {s.cancel}
                            </button>
                            <button
                                disabled={deleteConfirm !== 'DELETE'}
                                onClick={() => { localStorage.clear(); window.location.href = '/login'; }}
                                className="flex-1 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-900/40 disabled:text-red-800 text-white text-sm font-bold rounded-2xl transition-all cursor-pointer disabled:cursor-not-allowed"
                            >
                                {s.deleteForever}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentSettings;
