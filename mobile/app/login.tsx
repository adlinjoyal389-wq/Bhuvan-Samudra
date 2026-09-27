import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { THEME } from '../constants/theme';
import { ApiService } from '../services/api';

export default function LoginScreen() {
  const router = useRouter();
  const [mobileNumber, setMobileNumber] = useState('9876543210');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOTP = async () => {
    if (!mobileNumber || mobileNumber.length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const fullNumber = `+91${mobileNumber.replace(/\D/g, '').slice(-10)}`;
      await ApiService.sendOTP(fullNumber);
      router.push({
        pathname: '/otp',
        params: { mobileNumber: fullNumber },
      });
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <View style={styles.topCard}>
        {/* Brand Header */}
        <View style={styles.headerIcon}>
          <MaterialCommunityIcons name="sail-boat" size={38} color="#38BDF8" />
        </View>
        <Text style={styles.brandTitle}>BHUVAN-SAMUDRA</Text>
        <Text style={styles.brandSub}>Marine Ecosystem Reasoning with Collaborative Agents</Text>
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.title}>Sign in to Bhuvan-Samudra</Text>
        <Text style={styles.subtitle}>Use your mobile number to continue</Text>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {/* Mobile Input Group */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Mobile Number</Text>
          <View style={styles.phoneInputRow}>
            <View style={styles.countryBox}>
              <Text style={styles.countryCode}>🇮🇳 +91</Text>
            </View>
            <TextInput
              style={styles.textInput}
              placeholder="98765 43210"
              placeholderTextColor="#94A3B8"
              keyboardType="phone-pad"
              maxLength={10}
              value={mobileNumber}
              onChangeText={setMobileNumber}
            />
          </View>
        </View>

        {/* Demo Fast-Fill helper */}
        <TouchableOpacity
          style={styles.demoFillBtn}
          onPress={() => setMobileNumber('9876543210')}
        >
          <Ionicons name="sparkles" size={14} color="#0284C7" />
          <Text style={styles.demoFillText}>
            Use SIH Demo Account: 98765 43210
          </Text>
        </TouchableOpacity>

        {/* Send OTP button */}
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={handleSendOTP}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.primaryBtnText}>Send OTP</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
            </>
          )}
        </TouchableOpacity>

        {/* Demo OTP Notice */}
        <View style={styles.demoNoticeBox}>
          <Ionicons name="information-circle-outline" size={16} color="#0369A1" />
          <Text style={styles.demoNoticeText}>
            Demo verification OTP for Smart India Hackathon is <Text style={{ fontWeight: '700' }}>123456</Text>
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          By continuing, you agree to use Bhuvan-Samudra for marine information and safety assistance.
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    justifyContent: 'space-between',
  },
  topCard: {
    backgroundColor: THEME.colors.primaryNavy,
    paddingTop: 60,
    paddingBottom: 36,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerIcon: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#0D2240',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: '#38BDF8',
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1.5,
  },
  brandSub: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 4,
  },
  formContainer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: THEME.colors.primaryNavy,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 24,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 13,
    marginBottom: 12,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
  },
  phoneInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  countryBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: THEME.borderRadius.md,
    paddingHorizontal: 12,
    paddingVertical: 14,
    justifyContent: 'center',
  },
  countryCode: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: THEME.borderRadius.md,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
  demoFillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 24,
    alignSelf: 'flex-start',
  },
  demoFillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0284C7',
  },
  primaryBtn: {
    backgroundColor: THEME.colors.primaryDeep,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: THEME.borderRadius.md,
    ...THEME.shadow.card,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  demoNoticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#E0F2FE',
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  demoNoticeText: {
    fontSize: 12,
    color: '#0369A1',
    flex: 1,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  footerText: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 16,
  },
});
