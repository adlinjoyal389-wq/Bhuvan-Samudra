import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../constants/theme';
import { ApiService } from '../services/api';
import { StorageService } from '../services/storage';

export default function OTPVerificationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const mobileNumber = (params.mobileNumber as string) || '+91 98765 43210';

  const [otp, setOtp] = useState('123456');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = async () => {
    if (otp.length !== 6) {
      setError('Please enter the 6-digit verification OTP');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await ApiService.verifyOTP(mobileNumber, otp);
      StorageService.setUserProfile({
        id: res.user_id,
        mobile_number: mobileNumber,
      });

      if (res.profile_completed) {
        router.replace('/(tabs)/home');
      } else {
        router.replace('/profile-setup');
      }
    } catch (err: any) {
      setError(err.message || 'Verification failed. Try demo OTP: 123456');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={THEME.colors.primaryNavy} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Verification</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Verify Mobile Number</Text>
        <Text style={styles.subtitle}>
          Enter the 6-digit OTP sent to{' '}
          <Text style={{ fontWeight: '700', color: THEME.colors.primaryNavy }}>
            {mobileNumber}
          </Text>
        </Text>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {/* 6 Digit Input Row */}
        <View style={styles.otpInputBox}>
          <TextInput
            style={styles.otpInput}
            value={otp}
            onChangeText={setOtp}
            keyboardType="number-pad"
            maxLength={6}
            placeholder="123456"
            placeholderTextColor="#94A3B8"
          />
        </View>

        {/* Demo OTP fill */}
        <TouchableOpacity
          style={styles.demoFillBtn}
          onPress={() => setOtp('123456')}
        >
          <Ionicons name="key-outline" size={14} color="#0284C7" />
          <Text style={styles.demoFillText}>Auto-fill SIH Demo OTP: 123456</Text>
        </TouchableOpacity>

        {/* Verify Button */}
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={handleVerify}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.primaryBtnText}>Verify OTP</Text>
          )}
        </TouchableOpacity>

        {/* Options */}
        <View style={styles.optionsRow}>
          <TouchableOpacity onPress={() => setOtp('123456')}>
            <Text style={styles.resendText}>Resend OTP</Text>
          </TouchableOpacity>
          <Text style={{ color: '#CBD5E1' }}>•</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.changeNumText}>Change Number</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingBottom: 16,
  },
  backBtn: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.colors.primaryNavy,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: THEME.colors.primaryNavy,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 24,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 13,
    marginBottom: 12,
  },
  otpInputBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: THEME.colors.primaryBlue,
    borderRadius: THEME.borderRadius.lg,
    paddingVertical: 14,
    marginBottom: 14,
    ...THEME.shadow.card,
  },
  otpInput: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 12,
    color: THEME.colors.primaryNavy,
  },
  demoFillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 24,
  },
  demoFillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0284C7',
  },
  primaryBtn: {
    backgroundColor: THEME.colors.primaryDeep,
    paddingVertical: 16,
    borderRadius: THEME.borderRadius.md,
    alignItems: 'center',
    ...THEME.shadow.card,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    marginTop: 24,
  },
  resendText: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.colors.primaryBlue,
  },
  changeNumText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },
});
