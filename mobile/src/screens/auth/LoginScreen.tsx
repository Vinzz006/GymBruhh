import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AppColors from '../../constants/colors';
import { useAuth } from '../../context/AuthContext';
import AppButton from '../../components/common/AppButton';
import AppTextField from '../../components/common/AppTextField';
import { DEV_PC_IP } from '../../constants/api';

export const LoginScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { login, isLoading, apiUrl, setApiUrl } = useAuth();
  const [email, setEmail] = useState('demo@gymbruhh.com');
  const [password, setPassword] = useState('FitAI@2026');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showServerConfig, setShowServerConfig] = useState(false);
  const [serverUrlInput, setServerUrlInput] = useState(apiUrl || `http://${DEV_PC_IP}:8000/api`);
  const [isSavingUrl, setIsSavingUrl] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    // Automatically enforce the real PC Wi-Fi IP on physical device instead of dead 10.0.2.2
    if (!apiUrl || apiUrl.includes('10.0.2.2')) {
      const preferred = `http://${DEV_PC_IP}:8000/api`;
      setApiUrl(preferred);
      setServerUrlInput(preferred);
    } else {
      setServerUrlInput(apiUrl);
    }
  }, [apiUrl]);

  const handleSaveServerUrl = async (urlToSave?: string) => {
    const targetUrl = urlToSave !== undefined ? urlToSave : serverUrlInput;
    setIsSavingUrl(true);
    setSaveSuccessMsg(null);
    try {
      await setApiUrl(targetUrl);
      setSaveSuccessMsg('Server URL updated successfully!');
      setTimeout(() => setSaveSuccessMsg(null), 3500);
    } catch (e: any) {
      setErrorMessage('Failed to save server URL.');
    } finally {
      setIsSavingUrl(false);
    }
  };

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }
    setErrorMessage(null);
    try {
      await login(email, password);
      // Navigation will be automatically handled or can navigate directly
      navigation.replace('MainTabs');
    } catch (e: any) {
      const raw = e.message || 'Login failed. Please verify your credentials.';
      if (
        raw.includes('canceled') ||
        raw.includes('fetch failed') ||
        raw.includes('Network request failed') ||
        raw.includes('timed out')
      ) {
        setErrorMessage(
          `Cannot reach backend server at ${apiUrl}. Please verify the PC Wi-Fi IP below.`
        );
        setShowServerConfig(true);
      } else {
        setErrorMessage(raw.replace('Error: ', ''));
      }
    }
  };

  const handleFillDemo = async () => {
    const demoEmail = 'demo@gymbruhh.com';
    const demoPass = 'FitAI@2026';
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMessage(null);
    try {
      await login(demoEmail, demoPass);
      navigation.replace('MainTabs');
    } catch (e: any) {
      const raw = e.message || 'Login failed.';
      if (
        raw.includes('canceled') ||
        raw.includes('fetch failed') ||
        raw.includes('Network request failed') ||
        raw.includes('timed out')
      ) {
        setErrorMessage(
          `Cannot reach backend server. Please apply the PC Wi-Fi IP (${DEV_PC_IP}) below.`
        );
        setShowServerConfig(true);
      } else {
        setErrorMessage(raw.replace('Error: ', ''));
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <Ionicons name="barbell" size={36} color={AppColors.accent} />
            </View>
            <Text style={styles.title}>Welcome Back 👋</Text>
            <Text style={styles.subtitle}>
              Sign in to access your workouts, nutrition, and AI fitness coach.
            </Text>
          </View>

          {/* Quick Demo Pill */}
          <TouchableOpacity
            style={styles.demoBanner}
            onPress={handleFillDemo}
            activeOpacity={0.8}
          >
            <View style={styles.demoBadge}>
              <Ionicons name="flash" size={14} color={AppColors.black} />
            </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.demoTitle}>One-Tap Demo Login</Text>
            <Text style={styles.demoSub}>demo@gymbruhh.com • FitAI@2026</Text>
          </View>
          <Ionicons name="arrow-forward" size={16} color={AppColors.accent} />
        </TouchableOpacity>

        {errorMessage ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={18} color={AppColors.red} />
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        <View style={styles.form}>
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

          <TouchableOpacity
            style={styles.forgotBtn}
            onPress={() => navigation.navigate('ForgotPassword')}
          >
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>

          <AppButton
            text="SIGN IN"
            onPress={handleLogin}
            isLoading={isLoading}
            style={styles.loginBtn}
          />
        </View>

        {/* Server Connection Config Accordion */}
        <View style={styles.serverConfigContainer}>
          <TouchableOpacity
            style={styles.serverConfigToggle}
            onPress={() => setShowServerConfig(!showServerConfig)}
            activeOpacity={0.7}
          >
            <Ionicons name="hardware-chip-outline" size={15} color={AppColors.accent} />
            <Text style={styles.serverConfigToggleText} numberOfLines={1}>
              API Server: {apiUrl || 'Auto-detecting...'}
            </Text>
            <Ionicons
              name={showServerConfig ? 'chevron-up' : 'chevron-down'}
              size={14}
              color={AppColors.textMuted}
            />
          </TouchableOpacity>

          {showServerConfig && (
            <View style={styles.serverConfigBody}>
              <Text style={styles.serverConfigHelp}>
                If using Expo Go on your phone, select your computer's local Wi-Fi IP so the app can reach FastAPI:
              </Text>
              <TextInput
                style={styles.serverInput}
                value={serverUrlInput}
                onChangeText={setServerUrlInput}
                placeholder="http://10.231.192.29:8000/api"
                placeholderTextColor={AppColors.textMuted}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <View style={styles.quickPresetsRow}>
                <TouchableOpacity
                  style={styles.presetPill}
                  onPress={() => {
                    setServerUrlInput('http://10.231.192.29:8000/api');
                    handleSaveServerUrl('http://10.231.192.29:8000/api');
                  }}
                >
                  <Text style={styles.presetPillText}>PC Wi-Fi (10.231.192.29)</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.presetPill}
                  onPress={() => {
                    setServerUrlInput('http://10.0.2.2:8000/api');
                    handleSaveServerUrl('http://10.0.2.2:8000/api');
                  }}
                >
                  <Text style={styles.presetPillText}>Emulator (10.0.2.2)</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.presetPill}
                  onPress={() => {
                    setServerUrlInput('http://127.0.0.1:8000/api');
                    handleSaveServerUrl('http://127.0.0.1:8000/api');
                  }}
                >
                  <Text style={styles.presetPillText}>Local (127.0.0.1)</Text>
                </TouchableOpacity>
              </View>

              {saveSuccessMsg && (
                <Text style={styles.saveSuccessText}>{saveSuccessMsg}</Text>
              )}

              <TouchableOpacity
                style={styles.saveServerBtn}
                onPress={() => handleSaveServerUrl()}
                disabled={isSavingUrl}
              >
                <Text style={styles.saveServerBtnText}>
                  {isSavingUrl ? 'Saving...' : 'Apply Server URL'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.registerLink}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  scrollContent: {
    padding: 24,
    paddingTop: 16,
    flexGrow: 1,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 24,
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: AppColors.card,
    borderWidth: 1.5,
    borderColor: `${AppColors.accent}44`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
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
  demoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${AppColors.accent}14`,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: `${AppColors.accent}33`,
    padding: 12,
    marginBottom: 20,
    gap: 12,
  },
  demoBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: AppColors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  demoTitle: {
    color: AppColors.accent,
    fontSize: 12,
    fontWeight: '800',
  },
  demoSub: {
    color: AppColors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
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
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotText: {
    color: AppColors.accent,
    fontSize: 12,
    fontWeight: '700',
  },
  loginBtn: {
    marginTop: 8,
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
  registerLink: {
    color: AppColors.accent,
    fontSize: 13,
    fontWeight: '800',
  },
  serverConfigContainer: {
    backgroundColor: AppColors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: `${AppColors.accent}25`,
    marginBottom: 24,
    overflow: 'hidden',
  },
  serverConfigToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
  },
  serverConfigToggleText: {
    flex: 1,
    fontSize: 11,
    color: AppColors.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  serverConfigBody: {
    padding: 14,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: `${AppColors.border}30`,
  },
  serverConfigHelp: {
    fontSize: 11,
    color: AppColors.textMuted,
    marginBottom: 10,
    lineHeight: 16,
  },
  serverInput: {
    backgroundColor: AppColors.background,
    borderWidth: 1,
    borderColor: AppColors.border,
    borderRadius: 8,
    color: AppColors.white,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  quickPresetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  presetPill: {
    backgroundColor: `${AppColors.accent}15`,
    borderWidth: 1,
    borderColor: `${AppColors.accent}40`,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  presetPillText: {
    color: AppColors.accent,
    fontSize: 10,
    fontWeight: '700',
  },
  saveSuccessText: {
    color: AppColors.accent,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 8,
    textAlign: 'center',
  },
  saveServerBtn: {
    backgroundColor: AppColors.accent,
    borderRadius: 8,
    paddingVertical: 9,
    alignItems: 'center',
    marginTop: 10,
  },
  saveServerBtnText: {
    color: AppColors.black,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});

export default LoginScreen;
