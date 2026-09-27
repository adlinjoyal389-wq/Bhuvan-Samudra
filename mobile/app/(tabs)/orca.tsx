import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { THEME } from '../../constants/theme';
import { ApiService } from '../../services/api';
import { StorageService } from '../../services/storage';
import { SpeechService } from '../../services/speech';
import { ExplainableEvidenceModal } from '../../components/ExplainableEvidenceModal';

interface Message {
  id: string;
  sender: 'user' | 'orca';
  text: string;
  time: string;
  evidence?: any;
  mapAction?: any;
}

export default function AskOrcaScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const initialQuery = params.initialQuestion as string;

  const profile = StorageService.getUserProfile();
  const lang = profile.preferred_language || 'en';

  const [inputQuery, setInputQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'orca',
      text:
        lang === 'ta'
          ? 'வணக்கம் அமோக்! நான் ORCA கடல்சார் முகவர். நீங்கள் எங்கே மீன் பிடிக்கலாம், கடல் பாதுகாப்பு, அல்லது எல்லை தூரம் பற்றி குரல் வழியே கேட்கலாம்.'
          : 'Hello Amogh! I am ORCA, your Marine Ecosystem Assistant. You can ask me by voice or text about safe fishing zones, weather conditions, or maritime boundaries.',
      time: '10:30 AM',
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceCandidate, setVoiceCandidate] = useState<string | null>(null);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [selectedEvidence, setSelectedEvidence] = useState<any | null>(null);

  useEffect(() => {
    if (initialQuery) {
      handleSend(initialQuery);
    }
  }, [initialQuery]);

  const handleSend = async (questionText: string) => {
    const q = questionText.trim();
    if (!q) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: q,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);

    try {
      const res = await ApiService.queryORCA(q, lang);
      const orcaMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'orca',
        text: res.answer,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        evidence: res.evidence,
        mapAction: res.map_action,
      };

      setMessages((prev) => [...prev, orcaMsg]);

      // Speak answer automatically
      handleSpeakAnswer(orcaMsg.id, res.answer);
    } catch (e) {
      console.warn("Failed to query ORCA", e);
    } finally {
      setLoading(false);
    }
  };

  const startListeningSim = () => {
    setIsListening(true);
    // Simulate real speech recognition with Tamil/English sample query
    setTimeout(() => {
      setIsListening(false);
      const recognized =
        lang === 'ta' ? 'இன்று எங்கே மீன் பிடிக்கலாம்?' : 'Where can I fish today?';
      setVoiceCandidate(recognized);
    }, 2200);
  };

  const confirmVoiceCandidate = () => {
    if (voiceCandidate) {
      const q = voiceCandidate;
      setVoiceCandidate(null);
      handleSend(q);
    }
  };

  const handleSpeakAnswer = async (msgId: string, text: string) => {
    if (speakingMsgId === msgId) {
      await SpeechService.stop();
      setSpeakingMsgId(null);
      return;
    }

    setSpeakingMsgId(msgId);
    await SpeechService.speak(text, {
      language: lang,
      rate: 0.88,
      onDone: () => setSpeakingMsgId(null),
      onStopped: () => setSpeakingMsgId(null),
      onError: () => setSpeakingMsgId(null),
    });
  };

  const quickQuestions =
    lang === 'ta'
      ? [
          'இன்று எங்கே மீன் பிடிக்கலாம்?',
          'கடல் பாதுகாப்பு எப்படி?',
          'எல்லை தூரம் என்ன?',
          'நேற்றைய PFZ என்ன?',
          'அருகிலுள்ள மீன்பிடி மண்டலங்களைக் காட்டு',
        ]
      : [
          'Where can I fish today?',
          'Is the sea safe today?',
          'How far am I from the border?',
          "What was yesterday's PFZ?",
          'Show nearby fishing zones',
        ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons name="robot" size={24} color="#38BDF8" />
          </View>
          <View>
            <Text style={styles.headerTitle}>Ask ORCA Assistant</Text>
            <Text style={styles.headerSub}>
              Multi-Agent Collaborative Intelligence ({lang.toUpperCase()})
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.langPill}
          onPress={() => router.push('/(tabs)/profile')}
        >
          <Text style={styles.langPillText}>{lang.toUpperCase()}</Text>
        </TouchableOpacity>
      </View>

      {/* Messages Scroll */}
      <ScrollView
        style={styles.chatScroll}
        contentContainerStyle={styles.chatContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          const isSpeaking = speakingMsgId === msg.id;

          return (
            <View
              key={msg.id}
              style={[styles.msgRow, isUser ? styles.msgRowUser : styles.msgRowOrca]}
            >
              {!isUser && (
                <View style={styles.orcaAvatar}>
                  <MaterialCommunityIcons name="robot" size={16} color="#FFFFFF" />
                </View>
              )}

              <View
                style={[
                  styles.msgBubble,
                  isUser ? styles.bubbleUser : styles.bubbleOrca,
                ]}
              >
                <Text style={[styles.msgText, isUser && styles.msgTextUser]}>
                  {msg.text}
                </Text>

                <View style={styles.msgFooter}>
                  <Text style={[styles.msgTime, isUser && styles.msgTimeUser]}>
                    {msg.time}
                  </Text>

                  {!isUser && (
                    <View style={styles.orcaActionsRow}>
                      {/* Audio playback button */}
                      <TouchableOpacity
                        style={styles.bubbleActionBtn}
                        onPress={() => handleSpeakAnswer(msg.id, msg.text)}
                      >
                        <Ionicons
                          name={isSpeaking ? 'pause' : 'volume-high'}
                          size={15}
                          color={THEME.colors.primaryBlue}
                        />
                      </TouchableOpacity>

                      {/* Evidence toggle */}
                      {msg.evidence && (
                        <TouchableOpacity
                          style={styles.evidenceBtn}
                          onPress={() => setSelectedEvidence(msg.evidence)}
                        >
                          <Ionicons name="help-circle" size={14} color="#0284C7" />
                          <Text style={styles.evidenceBtnText}>Why this answer?</Text>
                        </TouchableOpacity>
                      )}

                      {/* Map Action Link */}
                      {msg.mapAction && (
                        <TouchableOpacity
                          style={styles.mapActionPill}
                          onPress={() => router.push('/(tabs)/map')}
                        >
                          <Ionicons name="map" size={13} color="#15803D" />
                          <Text style={styles.mapActionPillText}>Show on Map</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                </View>
              </View>
            </View>
          );
        })}

        {loading && (
          <View style={styles.loadingBubble}>
            <ActivityIndicator size="small" color={THEME.colors.primaryBlue} />
            <Text style={styles.loadingText}>ORCA Agents are analyzing satellite telemetry...</Text>
          </View>
        )}
      </ScrollView>

      {/* Quick Prompt Chips */}
      <View style={styles.quickPromptContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
          {quickQuestions.map((q, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.promptChip}
              onPress={() => handleSend(q)}
            >
              <Text style={styles.promptChipText}>{q}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Input Bar with Large Mic Button */}
      <View style={styles.inputBar}>
        <TextInput
          style={styles.textInput}
          placeholder="Ask about fishing, sea, or border..."
          placeholderTextColor="#94A3B8"
          value={inputQuery}
          onChangeText={setInputQuery}
          onSubmitEditing={() => handleSend(inputQuery)}
        />

        {inputQuery.trim().length > 0 ? (
          <TouchableOpacity
            style={styles.sendBtn}
            onPress={() => handleSend(inputQuery)}
          >
            <Ionicons name="send" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.micBtn, isListening && styles.micBtnListening]}
            onPress={startListeningSim}
          >
            <Ionicons name="mic" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>

      {/* Voice Listening Modal */}
      <Modal visible={isListening} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.listeningBox}>
            <View style={styles.pulseRing}>
              <Ionicons name="mic" size={44} color="#FFFFFF" />
            </View>
            <Text style={styles.listeningTitle}>Listening...</Text>
            <Text style={styles.listeningSub}>
              Speak in {lang === 'ta' ? 'தமிழ்' : 'English'} (e.g. "இன்று எங்கே மீன் பிடிக்கலாம்?")
            </Text>
            <TouchableOpacity
              style={styles.cancelListenBtn}
              onPress={() => setIsListening(false)}
            >
              <Text style={styles.cancelListenText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Voice Confirmation Modal */}
      <Modal visible={!!voiceCandidate} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.confirmBox}>
            <Text style={styles.confirmLabel}>Recognized Voice Command:</Text>
            <Text style={styles.confirmQuery}>"{voiceCandidate}"</Text>

            <View style={styles.confirmActionsRow}>
              <TouchableOpacity
                style={styles.confirmBtnPrimary}
                onPress={confirmVoiceCandidate}
              >
                <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
                <Text style={styles.confirmBtnPrimaryText}>Ask ORCA</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmBtnSecondary}
                onPress={() => {
                  setVoiceCandidate(null);
                  startListeningSim();
                }}
              >
                <Ionicons name="refresh" size={16} color={THEME.colors.primaryNavy} />
                <Text style={styles.confirmBtnSecondaryText}>Speak Again</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Explainable Evidence Modal */}
      <ExplainableEvidenceModal
        visible={!!selectedEvidence}
        onClose={() => setSelectedEvidence(null)}
        evidence={selectedEvidence}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  header: {
    backgroundColor: THEME.colors.primaryNavy,
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0D2240',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#38BDF8',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  headerSub: {
    fontSize: 11,
    color: '#94A3B8',
  },
  langPill: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: THEME.borderRadius.full,
  },
  langPillText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  chatScroll: {
    flex: 1,
  },
  chatContent: {
    padding: 16,
    gap: 14,
  },
  msgRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  msgRowUser: {
    justifyContent: 'flex-end',
  },
  msgRowOrca: {
    justifyContent: 'flex-start',
  },
  orcaAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: THEME.colors.primaryDeep,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  msgBubble: {
    maxWidth: '82%',
    padding: 14,
    borderRadius: 16,
    ...THEME.shadow.card,
  },
  bubbleUser: {
    backgroundColor: THEME.colors.primaryDeep,
    borderBottomRightRadius: 4,
  },
  bubbleOrca: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
  },
  msgText: {
    fontSize: 14,
    color: '#0F172A',
    lineHeight: 20,
  },
  msgTextUser: {
    color: '#FFFFFF',
  },
  msgFooter: {
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 6,
  },
  msgTime: {
    fontSize: 10,
    color: '#94A3B8',
  },
  msgTimeUser: {
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'right',
  },
  orcaActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  bubbleActionBtn: {
    padding: 4,
  },
  evidenceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  evidenceBtnText: {
    fontSize: 11,
    color: '#0284C7',
    fontWeight: '700',
  },
  mapActionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  mapActionPillText: {
    fontSize: 11,
    color: '#15803D',
    fontWeight: '700',
  },
  loadingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 14,
    alignSelf: 'flex-start',
  },
  loadingText: {
    fontSize: 12,
    color: '#64748B',
  },
  quickPromptContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  chipsScroll: {
    paddingHorizontal: 12,
  },
  promptChip: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: THEME.borderRadius.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  promptChipText: {
    fontSize: 12,
    color: THEME.colors.primaryNavy,
    fontWeight: '600',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    gap: 10,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: THEME.borderRadius.full,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
  },
  micBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: THEME.colors.primaryBlue,
    justifyContent: 'center',
    alignItems: 'center',
    ...THEME.shadow.card,
  },
  micBtnListening: {
    backgroundColor: '#DC2626',
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: THEME.colors.primaryDeep,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  listeningBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    maxWidth: 320,
    ...THEME.shadow.card,
  },
  pulseRing: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#0284C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 6,
    borderColor: '#BAE6FD',
  },
  listeningTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: THEME.colors.primaryNavy,
    marginBottom: 6,
  },
  listeningSub: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 20,
  },
  cancelListenBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  cancelListenText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#DC2626',
  },
  confirmBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    ...THEME.shadow.card,
  },
  confirmLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  confirmQuery: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.colors.primaryNavy,
    marginBottom: 20,
  },
  confirmActionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  confirmBtnPrimary: {
    flex: 1.3,
    backgroundColor: THEME.colors.primaryDeep,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: THEME.borderRadius.md,
  },
  confirmBtnPrimaryText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  confirmBtnSecondary: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 12,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  confirmBtnSecondaryText: {
    color: THEME.colors.primaryNavy,
    fontSize: 13,
    fontWeight: '600',
  },
});
