import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { THEME } from '../constants/theme';
import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/login');
    }, 2400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.centerBox}>
        {/* Emblem / Ocean Icon */}
        <View style={styles.iconCircle}>
          <MaterialCommunityIcons name="sail-boat" size={54} color="#38BDF8" />
        </View>

        <Text style={styles.title}>BHUVAN-SAMUDRA</Text>
        <View style={styles.badgeOrca}>
          <Text style={styles.badgeOrcaText}>ORCA</Text>
        </View>

        <Text style={styles.subtitle}>
          Marine Ecosystem Reasoning with Collaborative Agents
        </Text>

        <View style={styles.divider} />

        <View style={styles.sihBlock}>
          <Text style={styles.sihText}>SMART INDIA HACKATHON 2026</Text>
          <Text style={styles.psText}>Problem Statement: SIH26176 | Space Technology</Text>
          <Text style={styles.teamText}>Team: REPHOENIX</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <ActivityIndicator size="small" color="#38BDF8" />
        <Text style={styles.loadingText}>Initializing Marine Spatial Engine...</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A192F',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 50,
    paddingHorizontal: 24,
  },
  centerBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#0D2240',
    borderWidth: 2,
    borderColor: '#38BDF8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    ...THEME.shadow.card,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 2,
    textAlign: 'center',
  },
  badgeOrca: {
    backgroundColor: '#0284C7',
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 12,
  },
  badgeOrcaText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1.5,
  },
  subtitle: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 18,
  },
  divider: {
    width: 60,
    height: 2,
    backgroundColor: '#1E293B',
    marginVertical: 24,
  },
  sihBlock: {
    alignItems: 'center',
    gap: 4,
  },
  sihText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#38BDF8',
    letterSpacing: 1,
  },
  psText: {
    fontSize: 11,
    color: '#64748B',
  },
  teamText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#CBD5E1',
  },
  footer: {
    alignItems: 'center',
    gap: 10,
  },
  loadingText: {
    fontSize: 12,
    color: '#64748B',
  },
});
