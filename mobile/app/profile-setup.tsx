import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { THEME } from '../constants/theme';
import { SupportedLanguage } from '../types';
import { ApiService } from '../services/api';
import { StorageService } from '../services/storage';

const LANGUAGES: Array<{ code: SupportedLanguage; label: string; native: string }> = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు' },
  { code: 'ml', label: 'Malayalam', native: 'മലയാളം' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { code: 'gu', label: 'Gujarati', native: 'ગુજરાતી' },
];

export default function ProfileSetupScreen() {
  const router = useRouter();
  const [name, setName] = useState('Amogh');
  const [boatName, setBoatName] = useState('Sea Star');
  const [homeHarbour, setHomeHarbour] = useState('Kanyakumari');
  const [registration, setRegistration] = useState('IND-TN-06-MM-4421');
  const [emergencyContact, setEmergencyContact] = useState('+91 94431 22890');
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>('en');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await ApiService.updateProfile({
        name,
        boat_name: boatName,
        home_harbour: homeHarbour,
        boat_registration: registration,
        emergency_contact: emergencyContact,
        preferred_language: selectedLanguage,
        profile_completed: true,
      });

      StorageService.setUserProfile({
        name,
        boat_name: boatName,
        home_harbour: homeHarbour,
        boat_registration: registration,
        emergency_contact: emergencyContact,
        preferred_language: selectedLanguage,
        profile_completed: true,
      });

      router.replace('/(tabs)/home');
    } catch (e) {
      console.warn("Error saving profile", e);
      router.replace('/(tabs)/home');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.iconCircle}>
          <FontAwesome5 name="ship" size={24} color="#38BDF8" />
        </View>
        <Text style={styles.title}>Set up your profile</Text>
        <Text style={styles.subtitle}>
          Enter boat details to receive localized marine &amp; safety intelligence
        </Text>
      </View>

      {/* Language Selector */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Preferred Language (மொழியைத் தேர்ந்தெடுக்கவும்)</Text>
        <View style={styles.langGrid}>
          {LANGUAGES.map((lang) => (
            <TouchableOpacity
              key={lang.code}
              style={[
                styles.langChip,
                selectedLanguage === lang.code && styles.langChipSelected,
              ]}
              onPress={() => setSelectedLanguage(lang.code)}
            >
              <Text
                style={[
                  styles.langNative,
                  selectedLanguage === lang.code && styles.langTextSelected,
                ]}
              >
                {lang.native}
              </Text>
              <Text
                style={[
                  styles.langLabel,
                  selectedLanguage === lang.code && styles.langTextSelected,
                ]}
              >
                {lang.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Personal Info */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Fisherman &amp; Vessel Details</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.fieldLabel}>Your Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="e.g. Amogh"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.fieldLabel}>Boat Name</Text>
          <TextInput
            style={styles.input}
            value={boatName}
            onChangeText={setBoatName}
            placeholder="e.g. Sea Star"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.fieldLabel}>Home Harbour</Text>
          <TextInput
            style={styles.input}
            value={homeHarbour}
            onChangeText={setHomeHarbour}
            placeholder="e.g. Kanyakumari / Colachel"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.fieldLabel}>Boat Registration Number (Optional)</Text>
          <TextInput
            style={styles.input}
            value={registration}
            onChangeText={setRegistration}
            placeholder="IND-TN-06-MM-4421"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.fieldLabel}>Emergency SOS Contact</Text>
          <TextInput
            style={styles.input}
            value={emergencyContact}
            onChangeText={setEmergencyContact}
            placeholder="+91 94431 22890"
            keyboardType="phone-pad"
          />
        </View>
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        style={styles.saveBtn}
        onPress={handleSave}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <>
            <Text style={styles.saveBtnText}>Save &amp; Continue</Text>
            <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
          </>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: 24,
    paddingTop: 50,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: THEME.colors.primaryNavy,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: THEME.colors.primaryNavy,
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
  },
  section: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  langGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  langChip: {
    width: '31%',
    backgroundColor: '#FFFFFF',
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
  inputGroup: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: THEME.borderRadius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },
  saveBtn: {
    backgroundColor: THEME.colors.primaryDeep,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: THEME.borderRadius.md,
    marginTop: 10,
    ...THEME.shadow.card,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
