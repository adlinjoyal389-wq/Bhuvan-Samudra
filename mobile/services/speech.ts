import * as ExpoSpeech from 'expo-speech';
import { Platform } from 'react-native';

export interface SpeechOptions {
  language?: string;
  pitch?: number;
  rate?: number;
  onDone?: () => void;
  onStopped?: () => void;
  onError?: (error: any) => void;
}

export const SpeechService = {
  getLanguageCode(lang: string = 'en'): string {
    switch (lang) {
      case 'ta':
        return 'ta-IN';
      case 'te':
        return 'te-IN';
      case 'ml':
        return 'ml-IN';
      case 'hi':
        return 'hi-IN';
      case 'gu':
        return 'gu-IN';
      case 'en':
      default:
        return 'en-IN';
    }
  },

  async speak(text: string, options?: SpeechOptions): Promise<void> {
    const langCode = this.getLanguageCode(options?.language || 'en');
    const rate = options?.rate || 0.88; // Slower for maritime outdoor audio clarity

    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = langCode;
        utterance.rate = rate;
        if (options?.pitch) utterance.pitch = options.pitch;

        utterance.onend = () => {
          options?.onDone?.();
        };
        utterance.onerror = (e) => {
          console.warn("Web Speech error:", e);
          options?.onError?.(e);
        };

        window.speechSynthesis.speak(utterance);
        return;
      }

      // Native Expo Speech
      await ExpoSpeech.stop();
      ExpoSpeech.speak(text, {
        language: langCode,
        pitch: options?.pitch || 1.0,
        rate: rate,
        onDone: options?.onDone,
        onStopped: options?.onStopped,
        onError: options?.onError,
      });
    } catch (e) {
      console.warn("Speech synthesis unavailable:", e);
      options?.onDone?.();
    }
  },

  async stop(): Promise<void> {
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      await ExpoSpeech.stop();
    } catch (e) {
      console.warn("Error stopping speech:", e);
    }
  },

  async isSpeaking(): Promise<boolean> {
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && 'speechSynthesis' in window) {
        return window.speechSynthesis.speaking;
      }
      return await ExpoSpeech.isSpeakingAsync();
    } catch (e) {
      return false;
    }
  },
};
