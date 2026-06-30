require('dotenv').config();
const fetch = globalThis.fetch;
const apiKey = process.env.GEMINI_API_KEY;
const fetchGemini = async () => {
    try {
        const geminiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + apiKey;
        const contents = [{ role: 'user', parts: [{ text: 'Hello' }] }];
        const systemInstruction = {
            parts: [{
                text: 'You are AuraStudy AI.'
            }]
        };
        const response = await fetch(geminiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents, systemInstruction })
        });
        if (!response.ok) {
            const errBody = await response.text();
            console.log('HTTP Error:', response.status, errBody);
        } else {
            const data = await response.json();
            console.log('Success:', JSON.stringify(data).substring(0, 100));
        }
    } catch(e) { console.error('Fetch Error:', e); }
};
fetchGemini();
