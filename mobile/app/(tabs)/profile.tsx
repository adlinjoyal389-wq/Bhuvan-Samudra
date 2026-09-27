import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { THEME } from '../../constants/theme';
import { SupportedLanguage } from '../../types';
import { StorageService } from '../../services/storage';
import { ApiService } from '../../services/api';
import { BLEMeshModal } from '../../components/BLEMeshModal';

const LANGUAGES: Array<{ code: SupportedLanguage; label: string; native: string }> = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు' },
  { code: 'ml', label: 'Malayalam', native: 'മലയാളം' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { code: 'gu', label: 'Gujarati', native: 'ગુજરાતી' },
];

export default function ProfileScreen() {
  const router = useRouter();
  const profile = StorageService.getUserProfile();
  const [currentLang, setCurrentLang] = useState<SupportedLanguage>(
    profile.preferred_language || 'en'
  );
  const [meshModalOpen, setMeshModalOpen] = useState(false);

  // WhatsApp toggles
  const [waDaily, setWaDaily] = useState(true);
  const [waSafety, setWaSafety] = useState(true);
  const [waPfz, setWaPfz] = useState(true);

  // Audio toggles
  const [voiceOutput, setVoiceOutput] = useState(true);
  const [autoReadAlerts, setAutoReadAlerts] = useState(true);

  const handleLanguageChange = (lang: SupportedLanguage) => {
    setCurrentLang(lang);
    StorageService.setLanguage(lang);
    Alert.alert('Language Updated', `Application language set to ${lang.toUpperCase()}`);
  };

  const handleSendTestWhatsApp = async () => {
    try {
      await ApiService.simulateWhatsApp('TODAY', profile.mobile_number);
      Alert.alert(
        'WhatsApp Dispatched',
        `A daily marine update has been delivered to ${profile.mobile_number}.\n\nYou can also review it inside the WhatsApp Bot simulator tab.`
      );
    } catch (e) {
      console.warn("Failed to send WhatsApp message", e);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: () => router.replace('/login') },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.userRow}>
          <View style={styles.avatar}>
            <FontAwesome5 name="user-alt" size={24} color="#FFFFFF" />
          </View>
          <View>
            <Text style={styles.userName}>{profile.name}</Text>
            <Text style={styles.userPhone}>{profile.mobile_number}</Text>
          </View>
        </View>

        <View style={styles.harbourBadge}>
          <Text style={styles.harbourText}>{profile.home_harbour} Harbour</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollContent}
        contentContainerStyle={styles.scrollPadding}
        showsVerticalScrollIndicator={false}
      >
        {/* Boat Details Card */}
        <View style={styles.sectionCard}>
          <View style={styles.cardHeader}>
            <FontAwesome5 name="ship" size={16} color={THEME.colors.primaryNavy} />
            <Text style={styles.cardTitle}>Vessel Information</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Boat Name</Text>
            <Text style={styles.infoVal}>{profile.boat_name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Registration No.</Text>
            <Text style={styles.infoVal}>{profile.boat_registration}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Home Port</Text>
            <Text style={styles.infoVal}>{profile.home_harbour}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Emergency SOS Contact</Text>
            <Text style={styles.infoVal}>{profile.emergency_contact}</Text>
          </View>
        </View>

        {/* Offline Boat-to-Boat Mesh Simulation Card */}
        <View style={[styles.sectionCard, styles.meshCard]}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="access-point-network" size={20} color="#0D2240" />
            <Text style={styles.cardTitle}>Offline BLE Mesh Sync</Text>
          </View>
          <Text style={styles.meshDesc}>
            Exchange peer-to-peer hazard warnings and fishing shoal markers with nearby boats offshore without internet.
          </Text>
          <TouchableOpacity
            style={styles.meshSyncBtn}
            onPress={() => setMeshModalOpen(true)}
          >
            <MaterialCommunityIcons name="broadcast" size={18} color="#FFFFFF" />
            <Text style={styles.meshSyncBtnText}>Sync Nearby Boats</Text>
          </TouchableOpacity>
        </View>

        {/* Multilingual Selector */}
        <View style={styles.sectionCard}>
          <View style={styles.cardHeader}>
            <Ionicons name="language" size={18} color={THEME.colors.primaryNavy} />
            <Text style={styles.cardTitle}>Choose Language (மொழி)</Text>
          </View>

          <View style={styles.langGrid}>
            {LANGUAGES.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={[
                  styles.langChip,
                  currentLang === lang.code && styles.langChipSelected,
                ]}
                onPress={() => handleLanguageChange(lang.code)}
              >
                <Text
                  style={[
                    styles.langNative,
                    currentLang === lang.code && styles.langTextSelected,
                  ]}
                >
                  {lang.native}
                </Text>
                <Text
                  style={[
                    styles.langLabel,
                    currentLang === lang.code && styles.langTextSelected,
                  ]}
                >
                  {lang.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* WhatsApp Notification Integration */}
        <View style={styles.sectionCard}>
          <View style={styles.cardHeader}>
            <Ionicons name="logo-whatsapp" size={18} color="#15803D" />
            <Text style={styles.cardTitle}>WhatsApp Notifications</Text>
          </View>

          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Daily Marine Morning Update</Text>
            <Switch
              value={waDaily}
              onValueChange={setWaDaily}
              trackColor={{ true: '#15803D' }}
            />
          </View>
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>High Wave &amp; IMBL Safety Alerts</Text>
            <Switch
              value={waSafety}
              onValueChange={setWaSafety}
              trackColor={{ true: '#15803D' }}
            />
          </View>
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>New Potential Fishing Zone (PFZ)</Text>
            <Switch
              value={waPfz}
              onValueChange={setWaPfz}
              trackColor={{ true: '#15803D' }}
            />
          </View>

          <TouchableOpacity
            style={styles.testWhatsAppBtn}
            onPress={handleSendTestWhatsApp}
          >
            <Ionicons name="paper-plane" size={16} color="#FFFFFF" />
            <Text style={styles.testWhatsAppText}>Send Test Daily Update to WhatsApp</Text>
          </TouchableOpacity>
        </View>

        {/* Audio & Voice Assistance Settings */}
        <View style={styles.sectionCard}>
          <View style={styles.cardHeader}>
            <Ionicons name="volume-high" size={18} color={THEME.colors.primaryNavy} />
            <Text style={styles.cardTitle}>Voice &amp; Audio Settings</Text>
          </View>

          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Voice Output (Sarvam / TTS)</Text>
            <Switch
              value={voiceOutput}
              onValueChange={setVoiceOutput}
              trackColor={{ true: THEME.colors.primaryBlue }}
            />
          </View>
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Read Safety Alerts Automatically</Text>
            <Switch
              value={autoReadAlerts}
              onValueChange={setAutoReadAlerts}
              trackColor={{ true: THEME.colors.primaryBlue }}
            />
          </View>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={18} color="#DC2626" />
          <Text style={styles.logoutText}>Sign Out of Bhuvan-Samudra</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* BLE Mesh Modal */}
      <BLEMeshModal visible={meshModalOpen} onClose={() => setMeshModalOpen(false)} />
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
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#0D2240',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#38BDF8',
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  userPhone: {
    fontSize: 12,
    color: '#94A3B8',
  },
  harbourBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: THEME.borderRadius.full,
  },
  harbourText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  scrollContent: {
    flex: 1,
  },
  scrollPadding: {
    padding: 16,
    paddingBottom: 36,
    gap: 14,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: THEME.borderRadius.lg,
    padding: 16,
    ...THEME.shadow.card,
  },
  meshCard: {
    backgroundColor: '#E0F2FE',
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: THEME.colors.primaryNavy,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  infoLabel: {
    fontSize: 13,
    color: '#64748B',
  },
  infoVal: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.colors.primaryNavy,
  },
  meshDesc: {
    fontSize: 12,
    color: '#0369A1',
    lineHeight: 16,
    marginBottom: 12,
  },
  meshSyncBtn: {
    backgroundColor: THEME.colors.primaryDeep,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: THEME.borderRadius.md,
  },
  meshSyncBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  langGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  langChip: {
    width: '31%',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: THEME.borderRadius.md,
    paddingVertical: 10,
    alignItems: 'center',
  },
  langChipSelected: {
    backgroundColor: THEME.colors.primaryDeep,
    borderColor: THEME.colors.primaryBlue,
  },
  langNative: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.colors.primaryNavy,
  },
  langLabel: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
  langTextSelected: {
    color: '#FFFFFF',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  toggleLabel: {
    fontSize: 13,
    color: '#1E293B',
    fontWeight: '500',
  },
  testWhatsAppBtn: {
    backgroundColor: '#15803D',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: THEME.borderRadius.md,
    marginTop: 12,
  },
  testWhatsAppText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  logoutBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 14,
    backgroundColor: '#FEE2E2',
    borderRadius: THEME.borderRadius.md,
    marginTop: 4,
  },
  logoutText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '700',
  },
});
