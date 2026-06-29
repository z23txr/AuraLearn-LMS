export const applyTheme = (appearSettings, userId) => {
  if (!appearSettings) {
    const appearKey = `aura_appear_${userId}`;
    try {
      appearSettings = JSON.parse(localStorage.getItem(appearKey)) || {};
    } catch {
      appearSettings = {};
    }
  }

  const defaults = { language: 'en', timezone: 'PKT', fontSize: 'medium', accent: '#38bdf8', theme: 'dark' };
  const settings = { ...defaults, ...appearSettings };

  // 1. Apply Accent Color
  const accent = settings.accent;
  // Tailored dark bases for each accent color for a perfect theme match
  const darkBases = {
    '#38bdf8': { base: '#020617', bg: '#0f172a', bgLight: '#1e293b' }, // Cyan
    '#a855f7': { base: '#0f0518', bg: '#1c0b2b', bgLight: '#2d1445' }, // Purple
    '#22c55e': { base: '#021207', bg: '#052e16', bgLight: '#14532d' }, // Green
    '#f59e0b': { base: '#140c02', bg: '#291400', bgLight: '#4a2500' }, // Amber
    '#ef4444': { base: '#170303', bg: '#3b0707', bgLight: '#590e0e' }, // Red
    '#ec4899': { base: '#1a0511', bg: '#3e0a23', bgLight: '#5e1036' }, // Pink
  };
  
  const tColor = darkBases[accent] || darkBases['#38bdf8'];

  let styleEl = document.getElementById('aura-dynamic-theme-style');
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = 'aura-dynamic-theme-style';
    document.head.appendChild(styleEl);
  }

  styleEl.innerHTML = `
    :root {
      --accent-color: ${accent} !important;
      --accent-color-rgb: ${hexToRgb(accent)} !important;
    }
    
    /* Dark Mode Global Tinting */
    html.dark-mode body {
      background-color: ${tColor.base} !important;
    }

    .dark-mode .bg-\\[\\#0f172a\\] { background-color: ${tColor.bg} !important; }
    .dark-mode .bg-\\[\\#0f172a\\]\\/10 { background-color: color-mix(in srgb, ${tColor.bg} 10%, transparent) !important; }
    .dark-mode .bg-\\[\\#0f172a\\]\\/20 { background-color: color-mix(in srgb, ${tColor.bg} 20%, transparent) !important; }
    .dark-mode .bg-\\[\\#0f172a\\]\\/30 { background-color: color-mix(in srgb, ${tColor.bg} 30%, transparent) !important; }
    .dark-mode .bg-\\[\\#0f172a\\]\\/40 { background-color: color-mix(in srgb, ${tColor.bg} 40%, transparent) !important; }
    .dark-mode .bg-\\[\\#0f172a\\]\\/50 { background-color: color-mix(in srgb, ${tColor.bg} 50%, transparent) !important; }
    .dark-mode .bg-\\[\\#0f172a\\]\\/60 { background-color: color-mix(in srgb, ${tColor.bg} 60%, transparent) !important; }
    .dark-mode .bg-\\[\\#0f172a\\]\\/70 { background-color: color-mix(in srgb, ${tColor.bg} 70%, transparent) !important; }
    .dark-mode .bg-\\[\\#0f172a\\]\\/75 { background-color: color-mix(in srgb, ${tColor.bg} 75%, transparent) !important; }
    .dark-mode .bg-\\[\\#0f172a\\]\\/80 { background-color: color-mix(in srgb, ${tColor.bg} 80%, transparent) !important; }
    .dark-mode .bg-\\[\\#0f172a\\]\\/90 { background-color: color-mix(in srgb, ${tColor.bg} 90%, transparent) !important; }
    .dark-mode .bg-\\[\\#0f172a\\]\\/95 { background-color: color-mix(in srgb, ${tColor.bg} 95%, transparent) !important; }
    .dark-mode .bg-\\[\\#0f172a\\]\\/98 { background-color: color-mix(in srgb, ${tColor.bg} 98%, transparent) !important; }

    .dark-mode .bg-\\[\\#1e293b\\] { background-color: ${tColor.bgLight} !important; }
    .dark-mode .bg-\\[\\#1e293b\\]\\/10 { background-color: color-mix(in srgb, ${tColor.bgLight} 10%, transparent) !important; }
    .dark-mode .bg-\\[\\#1e293b\\]\\/20 { background-color: color-mix(in srgb, ${tColor.bgLight} 20%, transparent) !important; }
    .dark-mode .bg-\\[\\#1e293b\\]\\/30 { background-color: color-mix(in srgb, ${tColor.bgLight} 30%, transparent) !important; }
    .dark-mode .bg-\\[\\#1e293b\\]\\/40 { background-color: color-mix(in srgb, ${tColor.bgLight} 40%, transparent) !important; }
    .dark-mode .bg-\\[\\#1e293b\\]\\/50 { background-color: color-mix(in srgb, ${tColor.bgLight} 50%, transparent) !important; }
    .dark-mode .bg-\\[\\#1e293b\\]\\/60 { background-color: color-mix(in srgb, ${tColor.bgLight} 60%, transparent) !important; }
    .dark-mode .bg-\\[\\#1e293b\\]\\/70 { background-color: color-mix(in srgb, ${tColor.bgLight} 70%, transparent) !important; }
    .dark-mode .bg-\\[\\#1e293b\\]\\/80 { background-color: color-mix(in srgb, ${tColor.bgLight} 80%, transparent) !important; }
    .dark-mode .bg-\\[\\#1e293b\\]\\/90 { background-color: color-mix(in srgb, ${tColor.bgLight} 90%, transparent) !important; }
    .dark-mode .bg-\\[\\#1e293b60\\] { background-color: color-mix(in srgb, ${tColor.bgLight} 60%, transparent) !important; }

    .dark-mode .bg-slate-900 { background-color: ${tColor.bg} !important; }
    .dark-mode .bg-slate-900\\/40 { background-color: color-mix(in srgb, ${tColor.bg} 40%, transparent) !important; }

    .dark-mode .border-\\[\\#1e293b\\] { border-color: ${tColor.bgLight} !important; }
    .dark-mode .border-\\[\\#0f172a\\] { border-color: ${tColor.bg} !important; }
    .dark-mode .from-\\[\\#0f172a\\] {
      --tw-gradient-from: ${tColor.bg} var(--tw-gradient-from-position) !important;
      --tw-gradient-to: color-mix(in srgb, ${tColor.bg} 0%, transparent) var(--tw-gradient-to-position) !important;
      --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to) !important;
    }
    .dark-mode .to-\\[\\#1e293b\\] {
      --tw-gradient-to: ${tColor.bgLight} var(--tw-gradient-to-position) !important;
    }
    
    /* Text Color Overrides */
    .text-\\[\\#38bdf8\\], 
    .hover\\:text-\\[\\#38bdf8\\]:hover, 
    .peer-focus\\:text-\\[\\#38bdf8\\], 
    .group-hover\\:text-\\[\\#38bdf8\\] {
      color: ${accent} !important;
    }
    
    /* Background Color Overrides */
    .bg-\\[\\#38bdf8\\], 
    .hover\\:bg-\\[\\#38bdf8\\]:hover {
      background-color: ${accent} !important;
    }
    
    /* Border Color Overrides */
    .border-\\[\\#38bdf8\\], 
    .hover\\:border-\\[\\#38bdf8\\]:hover, 
    .focus\\:border-\\[\\#38bdf8\\]:focus, 
    .group-hover\\:border-\\[\\#38bdf8\\]\\/50 {
      border-color: ${accent} !important;
    }
    
    /* Alpha Opacity Overrides */
    .bg-\\[\\#38bdf8\\]\\/10 {
      background-color: color-mix(in srgb, ${accent} 10%, transparent) !important;
    }
    .bg-\\[\\#38bdf8\\]\\/20 {
      background-color: color-mix(in srgb, ${accent} 20%, transparent) !important;
    }
    .border-\\[\\#38bdf8\\]\\/10 {
      border-color: color-mix(in srgb, ${accent} 10%, transparent) !important;
    }
    .border-\\[\\#38bdf8\\]\\/20 {
      border-color: color-mix(in srgb, ${accent} 20%, transparent) !important;
    }
    .border-\\[\\#38bdf8\\]\\/30 {
      border-color: color-mix(in srgb, ${accent} 30%, transparent) !important;
    }
    .text-\\[\\#38bdf8\\]\\/10 {
      color: color-mix(in srgb, ${accent} 10%, transparent) !important;
    }
    .shadow-\\[\\#38bdf8\\]\\/15 {
      --tw-shadow-color: color-mix(in srgb, ${accent} 15%, transparent) !important;
    }
    .shadow-\\[\\#38bdf8\\]\\/30 {
      --tw-shadow-color: color-mix(in srgb, ${accent} 30%, transparent) !important;
    }
    .shadow-\\[\\#38bdf8\\]\\/40 {
      --tw-shadow-color: color-mix(in srgb, ${accent} 40%, transparent) !important;
    }
  `;

  // 2. Apply Font Size
  const sizes = { small: '14px', medium: '16px', large: '18px' };
  document.documentElement.style.fontSize = sizes[settings.fontSize] || '16px';

  // 3. Apply Theme (Light/Dark Mode)
  if (settings.theme === 'light') {
    document.body.style.backgroundColor = '#f8fafc';
    document.body.style.color = '#0f172a';
    document.documentElement.classList.add('light-mode');
    document.documentElement.classList.remove('dark-mode');
  } else {
    document.body.style.backgroundColor = '';
    document.body.style.color = '';
    document.documentElement.classList.remove('light-mode');
    document.documentElement.classList.add('dark-mode');
  }

  // 4. Apply Language (Translating / RTL support)
  if (settings.language === 'ur' || settings.language === 'ar') {
    document.documentElement.dir = 'rtl';
    document.documentElement.lang = settings.language;
  } else {
    document.documentElement.dir = 'ltr';
    document.documentElement.lang = 'en';
  }
};

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? 
    `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` 
    : '56, 189, 248';
}
