from typing import Dict, Any


class VoiceService:
    """
    Voice service abstraction designed for Sarvam AI / Whisper STT & TTS.
    Can operate in mock mode for instant local testing or connect with API keys.
    """

    SUPPORTED_LANGUAGES = {
        "en": "English",
        "ta": "Tamil (தமிழ்)",
        "te": "Telugu (తెలుగు)",
        "ml": "Malayalam (മലയാളം)",
        "hi": "Hindi (हिन्दी)",
        "gu": "Gujarati (ગુજરાતી)",
    }

    def synthesize_speech_hint(self, text: str, lang: str = "en") -> Dict[str, Any]:
        """Provides synthesis metadata compatible with Expo Speech and Web Speech API"""
        voice_map = {
            "en": "en-IN",
            "ta": "ta-IN",
            "te": "te-IN",
            "ml": "ml-IN",
            "hi": "hi-IN",
            "gu": "gu-IN",
        }
        return {
            "text": text,
            "language_code": voice_map.get(lang, "en-IN"),
            "rate": 0.9,  # slightly slower for clarity outdoors
            "pitch": 1.0,
            "provider": "Sarvam AI / Expo Speech Engine",
        }
