import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { THEME } from '../../constants/theme';
import { AlertItem } from '../../types';
import { ApiService } from '../../services/api';
import { StorageService } from '../../services/storage';
import { SpeechService } from '../../services/speech';

export default function AlertsScreen() {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSpeakingId, setActiveSpeakingId] = useState<number | null>(null);

  const lang = StorageService.getLanguage();

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    setLoading(true);
    try {
      const data = await ApiService.getAlerts();
      setAlerts(data);
    } catch (e) {
      console.warn("Failed to load alerts", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSpeakAlert = async (alert: AlertItem) => {
    if (activeSpeakingId === alert.id) {
      await SpeechService.stop();
      setActiveSpeakingId(null);
      return;
    }

    setActiveSpeakingId(alert.id);
    const isTa = lang === 'ta';
    const textToSpeak = isTa
      ? `எச்சரிக்கை: ${alert.title}. ${alert.message}. பரிந்துரைக்கப்பட்ட நடவடிக்கை: ${alert.action_recommended}`
      : `Alert: ${alert.title}. ${alert.message}. Recommended action: ${alert.action_recommended}`;

    await SpeechService.speak(textToSpeak, {
      language: lang,
      rate: 0.88,
      onDone: () => setActiveSpeakingId(null),
      onStopped: () => setActiveSpeakingId(null),
      onError: () => setActiveSpeakingId(null),
    });
  };

  const toggleReadStatus = (id: number) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, read_status: !a.read_status } : a))
    );
  };

  const getSeverityStyle = (sev: string) => {
    switch (sev) {
      case 'WARNING':
      case 'CRITICAL':
        return {
          bg: '#FEE2E2',
          text: '#DC2626',
          border: '#F87171',
          icon: 'alert-circle',
        };
      case 'CAUTION':
        return {
          bg: '#FEF3C7',
          text: '#D97706',
          border: '#FCD34D',
          icon: 'warning',
        };
      case 'SAFE':
      default:
        return {
          bg: '#DCFCE7',
          text: '#15803D',
          border: '#86EFAC',
          icon: 'shield-checkmark',
        };
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Marine Safety Advisories</Text>
          <Text style={styles.subtitle}>
            Official warnings from INCOIS, MOSDAC, &amp; Coast Guard
          </Text>
        </View>
        <TouchableOpacity style={styles.refreshBtn} onPress={loadAlerts}>
          <Ionicons name="refresh" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={THEME.colors.primaryBlue} />
          <Text style={styles.loadingText}>Fetching active maritime warnings...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollList}
          contentContainerStyle={styles.scrollPadding}
          showsVerticalScrollIndicator={false}
        >
          {alerts.map((item) => {
            const sev = getSeverityStyle(item.severity);
            const isSpeaking = activeSpeakingId === item.id;

            return (
              <View
                key={item.id}
                style={[
                  styles.alertCard,
                  !item.read_status && styles.alertCardUnread,
                  { borderLeftColor: sev.text },
                ]}
              >
                {/* Header Row */}
                <View style={styles.alertHeader}>
                  <View style={styles.titleRow}>
                    <Ionicons name={sev.icon as any} size={18} color={sev.text} />
                    <Text style={styles.alertTitle}>{item.title}</Text>
                  </View>
                  <View style={styles.headerRight}>
                    <Text style={styles.timeText}>{item.time}</Text>
                    <View style={[styles.sevBadge, { backgroundColor: sev.bg }]}>
                      <Text style={[styles.sevBadgeText, { color: sev.text }]}>
                        {item.severity}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Message */}
                <Text style={styles.messageText}>{item.message}</Text>

                {/* Recommended Action */}
                <View style={styles.actionBox}>
                  <Text style={styles.actionLabel}>RECOMMENDED ACTION:</Text>
                  <Text style={styles.actionText}>{item.action_recommended}</Text>
                </View>

                {/* Card Footer / Audio Player */}
                <View style={styles.cardFooter}>
                  <TouchableOpacity
                    style={[styles.audioBtn, isSpeaking && styles.audioBtnSpeaking]}
                    onPress={() => handleSpeakAlert(item)}
                  >
                    <Ionicons
                      name={isSpeaking ? 'pause' : 'volume-high'}
                      size={16}
                      color={isSpeaking ? '#FFFFFF' : THEME.colors.primaryNavy}
                    />
                    <Text
                      style={[
                        styles.audioBtnText,
                        isSpeaking && { color: '#FFFFFF' },
                      ]}
                    >
                      {isSpeaking ? 'Pause Audio' : 'Listen Alert'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.readToggleBtn}
                    onPress={() => toggleReadStatus(item.id)}
                  >
                    <Ionicons
                      name={item.read_status ? 'checkmark-done' : 'ellipse-outline'}
                      size={16}
                      color="#64748B"
                    />
                    <Text style={styles.readToggleText}>
                      {item.read_status ? 'Read' : 'Mark Read'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}
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
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  refreshBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#64748B',
  },
  scrollList: {
    flex: 1,
  },
  scrollPadding: {
    padding: 16,
    paddingBottom: 32,
    gap: 12,
  },
  alertCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: THEME.borderRadius.lg,
    padding: 16,
    borderLeftWidth: 5,
    ...THEME.shadow.card,
  },
  alertCardUnread: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.colors.primaryNavy,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  sevBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  sevBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  messageText: {
    fontSize: 13,
    color: '#1E293B',
    lineHeight: 18,
    marginBottom: 10,
  },
  actionBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  actionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.colors.primaryNavy,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  audioBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: THEME.borderRadius.md,
  },
  audioBtnSpeaking: {
    backgroundColor: THEME.colors.primaryDeep,
  },
  audioBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.primaryNavy,
  },
  readToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  readToggleText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
});
