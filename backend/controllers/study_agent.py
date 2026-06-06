import sys
import json
import urllib.request
import urllib.error
import re

def clean_emojis(text):
    """
    Output Guardrail: Strip all emoji characters, pictograms, and symbols using regex
    to guarantee the response is entirely emoji-free.
    """
    # Regex matching emojis, miscellaneous symbols, dingbats, and supplemental symbols
    emoji_pattern = re.compile(
        r'[\U00010000-\U0010ffff]|[\u2600-\u27bf]|[\u2000-\u3300]|[\u2B50]|[\u26A0]',
        flags=re.UNICODE
    )
    # Strip matches and clean extra duplicate spaces
    cleaned = emoji_pattern.sub('', text)
    return cleaned.strip()

def check_topic_guardrails(message):
    """
    Input Guardrail: Check if the message is off-topic (chit-chat, entertainment, gaming, cooking).
    If it violates the guidelines, return a polite refusal message directly.
    """
    off_topic_triggers = [
        "cook", "recipe", "game cheat", "cheat code", "gossip", "movie plot", 
        "song lyric", "joke", "funny story", "play a game", "video game"
    ]
    msg_lower = message.lower()
    for trigger in off_topic_triggers:
        if trigger in msg_lower:
            return "I am AuraStudy AI, your academic companion. I can only assist with programming, database, and curriculum-related questions. Please ask a study-related question."
    return None

def run_agent():
    try:
        # 1. Read JSON input from stdin
        input_data = json.loads(sys.stdin.read())
        api_key = input_data.get("apiKey")
        message = input_data.get("message", "")
        history = input_data.get("history", [])

        if not api_key:
            print(json.dumps({"error": "Gemini API key is missing."}))
            return

        # 2. Check input guardrails
        guardrail_error = check_topic_guardrails(message)
        if guardrail_error:
            print(json.dumps({"reply": guardrail_error}))
            return

        # 3. Construct Gemini URL
        gemini_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"

        # 4. Map history into Gemini payload contents
        # Gemini roles: 'user' for student, 'model' for assistant
        contents = []
        for chat in history:
            role = "user" if chat.get("sender") == "user" else "model"
            contents.append({
                "role": role,
                "parts": [{"text": chat.get("text", "")}]
            })

        # Append the current user query
        contents.append({
            "role": "user",
            "parts": [{"text": message}]
        })

        # System instructions with strict formatting guidelines
        system_instruction = {
            "parts": [{
                "text": (
                    "You are AuraStudy AI, a dedicated academic tutor and study assistant on the AuraLearn LMS platform.\n"
                    "Ensure you strictly adhere to the following guidelines:\n\n"
                    "1. SCOPE GUARDRAILS: Provide only educational, academic, and technical assistance (e.g. computer science, coding, web development, study tips). If the user asks about non-academic or unrelated topics, politely refuse to answer.\n"
                    "2. STRICT EMOJI BAN: You must NEVER use any emojis, emoticons, smileys, checkmarks, arrows, stars, or pictograms in your response under any circumstances. All your replies must be entirely emoji-free and purely textual.\n"
                    "3. FORMATTING: Output response using clean GitHub Markdown with section headers, bold keywords, bullet points, and syntax-highlighted code blocks where appropriate. Be concise, professional, and clear."
                )
            }]
        }

        payload = {
            "contents": contents,
            "systemInstruction": system_instruction
        }

        # 5. Make request using built-in urllib
        req_data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(
            gemini_url,
            data=req_data,
            headers={"Content-Type": "application/json"},
            method="POST"
        )

        with urllib.request.urlopen(req) as response:
            res_data = response.read().decode("utf-8")
            res_json = json.loads(res_data)

            candidates = res_json.get("candidates", [])
            reply_text = ""
            if candidates:
                parts = candidates[0].get("content", {}).get("parts", [])
                if parts:
                    reply_text = parts[0].get("text", "")

            if not reply_text:
                reply_text = "I am having trouble forming a response. Please try again."

            # 6. Apply output guardrails: Clean any accidental emojis
            cleaned_reply = clean_emojis(reply_text)

            print(json.dumps({"reply": cleaned_reply}))

    except urllib.error.HTTPError as he:
        err_body = he.read().decode("utf-8") if he else ""
        print(json.dumps({"error": f"Agent HTTP Error {he.code}: {he.reason}. Body: {err_body}"}))
    except Exception as e:
        print(json.dumps({"error": f"Agent error: {str(e)}"}))

if __name__ == "__main__":
    run_agent()
