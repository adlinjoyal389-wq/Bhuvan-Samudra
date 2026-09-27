import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { THEME } from '../../constants/theme';
import { MarineTodayData } from '../../types';
import { ApiService } from '../../services/api';
import { StorageService } from '../../services/storage';
import { SpeechService } from '../../services/speech';
import { getTranslation } from '../../constants/translations';
import { ExplainableEvidenceModal } from '../../components/ExplainableEvidenceModal';

export default function HomeScreen() {
  const router = useRouter();
  const [data, setData] = useState<MarineTodayData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isOffline, setIsOffline] = useState(StorageService.isOffline());
  const [evidenceOpen, setEvidenceOpen] = useState(false);

  const profile = StorageService.getUserProfile();
  const lang = profile.preferred_language || 'en';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await ApiService.getTodayMarine();
      setData(res);
    } catch (e) {
      console.warn("Failed to load today marine data", e);
    } finally {
      setLoading(false);
    }
  };

  const toggleAudio = async () => {
    if (isPlayingAudio) {
      await SpeechService.stop();
      setIsPlayingAudio(false);
    } else {
      if (!data) return;
      setIsPlayingAudio(true);
      const isTa = lang === 'ta';
      const textToSpeak = isTa
        ? `வணக்கம் ${profile.name}. இன்றைய கடல் நிலைமை மிதமான நிலையில் உள்ளது. அலை உயரம் ஒன்று புள்ளி நான்கு மீட்டர். காற்றின் வேகம் பன்னிரண்டு கிலோமீட்டர். அருகிலுள்ள மீன்பிடி மண்டலம் வடகிழக்கே பதினெட்டு கிலோமீட்டர் தொலைவில் உள்ளது. எல்லை தூரம் எட்டு புள்ளி நான்கு கிலோமீட்டர். கடல் பாதுகாப்பு நிலை பாதுகாப்பானது.`
        : `Good morning, ${profile.name}. Today's sea condition is moderate. Wave height is 1.4 meters. Wind speed is 12 kilometers per hour. Nearby potential fishing zone is 18 kilometers northeast. Maritime boundary clearance is 8.4 kilometers. Current safety status is safe.`;

      await SpeechService.speak(textToSpeak, {
        language: lang,
        rate: 0.88,
        onDone: () => setIsPlayingAudio(false),
        onStopped: () => setIsPlayingAudio(false),
        onError: () => setIsPlayingAudio(false),
      });
    }
  };

  const toggleOffline = () => {
    const nextState = !isOffline;
    setIsOffline(nextState);
    StorageService.setOffline(nextState);
  };

  if (loading || !data) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={THEME.colors.primaryBlue} />
        <Text style={styles.loadingText}>Fetching satellite telemetry &amp; PFZ...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>
            {getTranslation('goodMorning', lang)}, {profile.name}
          </Text>
          <Text style={styles.subGreeting}>
            {getTranslation('conditionsToday', lang)} • {profile.home_harbour}
          </Text>
        </View>

        {/* Online / Offline status badge */}
        <TouchableOpacity
          style={[styles.statusBadge, isOffline ? styles.badgeOffline : styles.badgeOnline]}
          onPress={toggleOffline}
        >
          <View
            style={[
              styles.statusDot,
              { backgroundColor: isOffline ? '#EA580C' : '#16A34A' },
            ]}
          />
          <Text
            style={[
              styles.statusText,
              { color: isOffline ? '#EA580C' : '#16A34A' },
            ]}
          >
            {isOffline ? 'OFFLINE' : 'ONLINE'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollContent}
        contentContainerStyle={styles.scrollPadding}
        showsVerticalScrollIndicator={false}
      >
        {/* Audio Advisory Bar */}
        <TouchableOpacity style={styles.audioBar} onPress={toggleAudio}>
          <View style={styles.audioIconBox}>
            <Ionicons
              name={isPlayingAudio ? 'volume-high' : 'volume-medium-outline'}
              size={22}
              color="#FFFFFF"
            />
          </View>
          <View style={styles.audioTextBox}>
            <Text style={styles.audioTitle}>
              {isPlayingAudio
                ? getTranslation('playingAudio', lang)
                : getTranslation('listenToday', lang)}
            </Text>
            <Text style={styles.audioSub}>
              Tap to hear voice advisory in {lang === 'ta' ? 'தமிழ்' : 'English'}
            </Text>
          </View>
          <View style={styles.audioPlayBtn}>
            <Ionicons
              name={isPlayingAudio ? 'pause' : 'play'}
              size={18}
              color={THEME.colors.primaryNavy}
            />
          </View>
        </TouchableOpacity>

        {/* CARD 1: Sea Condition */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <MaterialCommunityIcons name="wave" size={20} color={THEME.colors.primaryBlue} />
              <Text style={styles.cardTitle}>{getTranslation('seaCondition', lang)}</Text>
            </View>
            <View style={styles.stateTag}>
              <Text style={styles.stateTagText}>{data.sea_condition.condition}</Text>
            </View>
          </View>

          <View style={styles.metricsGrid}>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>{getTranslation('seaState', lang)}</Text>
              <Text style={styles.metricVal}>{data.sea_condition.sea_state}</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>{getTranslation('waveHeight', lang)}</Text>
              <Text style={styles.metricVal}>{data.sea_condition.wave_height} m</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>{getTranslation('windSpeed', lang)}</Text>
              <Text style={styles.metricVal}>{data.sea_condition.wind_speed} km/h</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>{getTranslation('generalCondition', lang)}</Text>
              <Text style={styles.metricVal}>{data.sea_condition.condition}</Text>
            </View>
          </View>
        </View>

        {/* CARD 2: Potential Fishing Zone (PFZ) */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <FontAwesome5 name="fish" size={18} color="#0284C7" />
              <Text style={styles.cardTitle}>{getTranslation('potentialFishingZone', lang)}</Text>
            </View>
            <View style={styles.confidenceBadge}>
              <Text style={styles.confidenceText}>{data.nearby_pfz.confidence}% Conf.</Text>
            </View>
          </View>

          <Text style={styles.pfzAlertText}>
            🐟 {getTranslation('nearbyPFZDetected', lang)} ({data.nearby_pfz.name})
          </Text>

          <View style={styles.metricsGrid}>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>{getTranslation('distance', lang)}</Text>
              <Text style={styles.metricVal}>{data.nearby_pfz.distance_km} km</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>{getTranslation('direction', lang)}</Text>
              <Text style={styles.metricVal}>{data.nearby_pfz.direction}</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>{getTranslation('sst', lang)}</Text>
              <Text style={styles.metricVal}>{data.nearby_pfz.sst}°C</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>{getTranslation('chlorophyll', lang)}</Text>
              <Text style={styles.metricVal}>{data.nearby_pfz.chlorophyll} mg/m³</Text>
            </View>
          </View>

          <View style={styles.cardActionsRow}>
            <TouchableOpacity
              style={styles.cardActionPrimary}
              onPress={() => router.push('/(tabs)/map')}
            >
              <Ionicons name="map" size={16} color="#FFFFFF" />
              <Text style={styles.cardActionPrimaryText}>
                {getTranslation('viewOnMap', lang)}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cardActionSecondary}
              onPress={() => setEvidenceOpen(true)}
            >
              <Ionicons name="stats-chart" size={16} color={THEME.colors.primaryNavy} />
              <Text style={styles.cardActionSecondaryText}>
                {getTranslation('details', lang)}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* CARD 3: Marine Safety */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <Ionicons name="shield-checkmark" size={20} color={THEME.colors.safeGreen} />
              <Text style={styles.cardTitle}>{getTranslation('marineSafety', lang)}</Text>
            </View>
            <View style={styles.safetyTag}>
              <Text style={styles.safetyTagText}>{data.safety_status.status}</Text>
            </View>
          </View>

          <View style={styles.metricsGrid}>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>{getTranslation('imblDistance', lang)}</Text>
              <Text style={[styles.metricVal, { color: THEME.colors.warningRed }]}>
                {data.safety_status.imbl_distance_km} km
              </Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>{getTranslation('waveHeight', lang)}</Text>
              <Text style={styles.metricVal}>{data.safety_status.wave_height} m</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>{getTranslation('generalCondition', lang)}</Text>
              <Text style={styles.metricVal}>{data.safety_status.weather}</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>{getTranslation('currentAlert', lang)}</Text>
              <Text style={styles.metricValSmall}>{data.safety_status.current_alert}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.safetyActionBtn}
            onPress={() => router.push('/(tabs)/alerts')}
          >
            <Text style={styles.safetyActionText}>
              {getTranslation('viewSafetyDetails', lang)}
            </Text>
            <Ionicons name="chevron-forward" size={16} color={THEME.colors.primaryNavy} />
          </TouchableOpacity>
        </View>

        {/* CARD 4: Today's ORCA Recommendation */}
        <View style={[styles.card, styles.orcaCard]}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <MaterialCommunityIcons name="robot" size={20} color="#0369A1" />
              <Text style={[styles.cardTitle, { color: '#0369A1' }]}>
                {getTranslation('todaysOrcaRec', lang)}
              </Text>
            </View>
          </View>

          <Text style={styles.orcaText}>"{data.orca_recommendation}"</Text>

          <TouchableOpacity
            style={styles.whyBtn}
            onPress={() => setEvidenceOpen(true)}
          >
            <Ionicons name="help-circle-outline" size={16} color="#0284C7" />
            <Text style={styles.whyBtnText}>{getTranslation('whyRec', lang)}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Explainable Evidence Modal */}
      <ExplainableEvidenceModal
        visible={evidenceOpen}
        onClose={() => setEvidenceOpen(false)}
        evidence={data.orca_evidence}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
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
  greeting: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  subGreeting: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: THEME.borderRadius.full,
  },
  badgeOnline: {
    backgroundColor: '#DCFCE7',
  },
  badgeOffline: {
    backgroundColor: '#FFEDD5',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  scrollContent: {
    flex: 1,
  },
  scrollPadding: {
    padding: 16,
    paddingBottom: 32,
    gap: 14,
  },
  audioBar: {
    backgroundColor: THEME.colors.primaryDeep,
    borderRadius: THEME.borderRadius.lg,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    ...THEME.shadow.card,
  },
  audioIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  audioTextBox: {
    flex: 1,
  },
  audioTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  audioSub: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  audioPlayBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: THEME.borderRadius.lg,
    padding: 16,
    ...THEME.shadow.card,
  },
  orcaCard: {
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.colors.primaryNavy,
  },
  stateTag: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  stateTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0369A1',
  },
  confidenceBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  confidenceText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803D',
  },
  safetyTag: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  safetyTagText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#16A34A',
  },
  pfzAlertText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 12,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  metricItem: {
    width: '48%',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  metricLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  metricVal: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.colors.primaryNavy,
    marginTop: 2,
  },
  metricValSmall: {
    fontSize: 13,
    fontWeight: '600',
    color: '#16A34A',
    marginTop: 2,
  },
  cardActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  cardActionPrimary: {
    flex: 1.5,
    backgroundColor: THEME.colors.primaryDeep,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: THEME.borderRadius.md,
  },
  cardActionPrimaryText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  cardActionSecondary: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  cardActionSecondaryText: {
    color: THEME.colors.primaryNavy,
    fontSize: 13,
    fontWeight: '600',
  },
  safetyActionBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 4,
  },
  safetyActionText: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.colors.primaryNavy,
  },
  orcaText: {
    fontSize: 13,
    color: '#0F172A',
    lineHeight: 19,
    marginBottom: 12,
  },
  whyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
  },
  whyBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0284C7',
  },
});
