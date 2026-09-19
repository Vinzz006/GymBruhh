import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppColors from '../../constants/colors';
import api from '../../services/api';
import { API_ENDPOINTS } from '../../constants/api';
import AppButton from '../../components/common/AppButton';
import AppTextField from '../../components/common/AppTextField';

export const ForgotPasswordScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleReset = async () => {
    if (!email.trim()) {
      setError('Please enter your email.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await api.post(API_ENDPOINTS.forgotPassword, { email: email.trim() });
      setSent(true);
    } catch (e: any) {
      setError(e.message || 'Could not send reset link. Please check your email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={20} color={AppColors.white} />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Reset Password 🔑</Text>
          <Text style={styles.subtitle}>
            Enter your account email and we will send you password reset instructions.
          </Text>
        </View>

        {sent ? (
          <View style={styles.successBox}>
            <Ionicons name="checkmark-circle" size={40} color={AppColors.accent} />
            <Text style={styles.successTitle}>Check Your Inbox</Text>
            <Text style={styles.successSub}>
              We've dispatched recovery instructions to {email}.
            </Text>
            <AppButton
              text="Back to Sign In"
              onPress={() => navigation.navigate('Login')}
              style={{ marginTop: 20, width: '100%' }}
            />
          </View>
        ) : (
          <View style={styles.form}>
            {error ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={18} color={AppColors.red} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <AppTextField
              label="Email Address"
              placeholder="athlete@domain.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              prefixIcon={
                <Ionicons name="mail-outline" size={18} color={AppColors.textMuted} />
              }
            />

            <AppButton
              text="SEND RECOVERY LINK"
              onPress={handleReset}
              isLoading={loading}
              style={{ marginTop: 12 }}
            />
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  scrollContent: {
    padding: 24,
    paddingTop: 50,
    flexGrow: 1,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: AppColors.card,
    borderWidth: 1,
    borderColor: AppColors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    color: AppColors.white,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  subtitle: {
    color: AppColors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  form: {
    marginTop: 10,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${AppColors.red}20`,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: `${AppColors.red}40`,
    padding: 12,
    marginBottom: 16,
    gap: 10,
  },
  errorText: {
    color: AppColors.red,
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  successBox: {
    backgroundColor: AppColors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: AppColors.border,
    padding: 24,
    alignItems: 'center',
    marginTop: 20,
  },
  successTitle: {
    color: AppColors.white,
    fontSize: 18,
    fontWeight: '900',
    marginTop: 12,
    marginBottom: 6,
  },
  successSub: {
    color: AppColors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default ForgotPasswordScreen;
