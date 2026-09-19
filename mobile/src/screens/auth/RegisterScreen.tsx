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
import { useAuth } from '../../context/AuthContext';
import AppButton from '../../components/common/AppButton';
import AppTextField from '../../components/common/AppTextField';

export const RegisterScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { register, isLoading } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRegister = async () => {
    if (!fullName.trim() || !email.trim() || !password) {
      setErrorMessage('Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    setErrorMessage(null);
    try {
      await register(fullName, email, password);
      navigation.replace('Onboarding');
    } catch (e: any) {
      const msg = e.message || 'Registration failed. Please try again.';
      setErrorMessage(msg.replace('Error: ', ''));
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={20} color={AppColors.white} />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Join GYMBruhh ⚡</Text>
          <Text style={styles.subtitle}>
            Create your profile to unlock deterministic macro targets, workouts, and Gemini AI coaching.
          </Text>
        </View>

        {errorMessage ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={18} color={AppColors.red} />
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        <View style={styles.form}>
          <AppTextField
            label="Full Name"
            placeholder="Alex Walker"
            value={fullName}
            onChangeText={setFullName}
            prefixIcon={
              <Ionicons name="person-outline" size={18} color={AppColors.textMuted} />
            }
          />

          <AppTextField
            label="Email Address"
            placeholder="alex@domain.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            prefixIcon={
              <Ionicons name="mail-outline" size={18} color={AppColors.textMuted} />
            }
          />

          <AppTextField
            label="Password"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            prefixIcon={
              <Ionicons name="lock-closed-outline" size={18} color={AppColors.textMuted} />
            }
          />

          <AppTextField
            label="Confirm Password"
            placeholder="••••••••"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            prefixIcon={
              <Ionicons name="shield-checkmark-outline" size={18} color={AppColors.textMuted} />
            }
          />

          <AppButton
            text="CREATE ATHLETE ACCOUNT"
            onPress={handleRegister}
            isLoading={isLoading}
            style={styles.btn}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
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
  form: {
    marginBottom: 24,
  },
  btn: {
    marginTop: 10,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
    paddingBottom: 20,
  },
  footerText: {
    color: AppColors.textSecondary,
    fontSize: 13,
  },
  loginLink: {
    color: AppColors.accent,
    fontSize: 13,
    fontWeight: '800',
  },
});

export default RegisterScreen;
