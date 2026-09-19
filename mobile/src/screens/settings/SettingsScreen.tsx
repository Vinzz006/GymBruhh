import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppColors from '../../constants/colors';
import { useAuth } from '../../context/AuthContext';
import AppButton from '../../components/common/AppButton';

export const SettingsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const {
    user,
    profile,
    targets,
    unitSystem,
    setUnitSystem,
    apiUrl,
    setApiUrl,
    logout,
  } = useAuth();
  const [customUrlInput, setCustomUrlInput] = useState(apiUrl);
  const [isSavingUrl, setIsSavingUrl] = useState(false);

  const handleSaveApiUrl = async () => {
    setIsSavingUrl(true);
    await setApiUrl(customUrlInput);
    setIsSavingUrl(false);
    Alert.alert('Settings Updated', 'Backend API URL updated successfully.');
  };

  const handleLogout = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          navigation.replace('Login');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topHeader}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={22} color={AppColors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile & Settings ⚙️</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* User Card */}
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={24} color={AppColors.accent} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.userName}>{user?.fullName || 'Athlete'}</Text>
            <Text style={styles.userEmail}>{user?.email || ''}</Text>
          </View>
        </View>

        {/* Targets & Stats Summary */}
        <Text style={styles.sectionLabel}>FITNESS TARGETS & STATS</Text>
        <View style={styles.statsCard}>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Current Weight</Text>
            <Text style={styles.statVal}>
              {profile?.currentWeightKg || 75.0} {unitSystem === 'metric' ? 'kg' : 'lbs'}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Primary Goal</Text>
            <Text style={styles.statVal}>
              {(profile?.primaryGoal || 'muscle_gain').replace('_', ' ').toUpperCase()}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Daily Target Calories</Text>
            <Text style={[styles.statVal, { color: AppColors.accent }]}>
              {Math.round(targets?.targetCalories || 2400)} kcal
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Protein Target</Text>
            <Text style={[styles.statVal, { color: AppColors.cyan }]}>
              {Math.round(targets?.targetProteinGrams || 160)}g
            </Text>
          </View>
        </View>

        {/* Preferences */}
        <Text style={styles.sectionLabel}>APP PREFERENCES</Text>
        <View style={styles.statsCard}>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Unit System</Text>
            <View style={styles.unitToggle}>
              <TouchableOpacity
                style={[
                  styles.unitBtn,
                  unitSystem === 'metric' && styles.unitBtnActive,
                ]}
                onPress={() => setUnitSystem('metric')}
              >
                <Text
                  style={[
                    styles.unitText,
                    unitSystem === 'metric' && styles.unitTextActive,
                  ]}
                >
                  Metric
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.unitBtn,
                  unitSystem === 'imperial' && styles.unitBtnActive,
                ]}
                onPress={() => setUnitSystem('imperial')}
              >
                <Text
                  style={[
                    styles.unitText,
                    unitSystem === 'imperial' && styles.unitTextActive,
                  ]}
                >
                  Imperial
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Backend API Configuration (Essential for Expo Go physical device testing) */}
        <Text style={styles.sectionLabel}>BACKEND API CONFIGURATION (EXPO GO)</Text>
        <View style={styles.statsCard}>
          <Text style={styles.apiInfoText}>
            When using Expo Go on a physical phone, replace localhost with your computer's local IP address (e.g. http://192.168.1.50:8000/api).
          </Text>
          <TextInput
            style={styles.apiInput}
            value={customUrlInput}
            onChangeText={setCustomUrlInput}
            placeholder="http://10.0.2.2:8000/api"
            placeholderTextColor={AppColors.textMuted}
            autoCapitalize="none"
          />
          <View style={styles.quickSelectRow}>
            <TouchableOpacity
              style={styles.quickPill}
              onPress={() => setCustomUrlInput('http://10.0.2.2:8000/api')}
            >
              <Text style={styles.quickPillText}>Android Emulator (10.0.2.2)</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickPill}
              onPress={() => setCustomUrlInput('http://127.0.0.1:8000/api')}
            >
              <Text style={styles.quickPillText}>Localhost / Web</Text>
            </TouchableOpacity>
          </View>

          <AppButton
            text="SAVE API URL"
            onPress={handleSaveApiUrl}
            isLoading={isSavingUrl}
            variant="secondary"
            style={{ marginTop: 12 }}
          />
        </View>

        {/* Sign Out */}
        <AppButton
          text="SIGN OUT"
          onPress={handleLogout}
          variant="danger"
          style={{ marginTop: 24, marginBottom: 40 }}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: AppColors.white,
    fontSize: 18,
    fontWeight: '900',
  },
  scrollContent: {
    padding: 20,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.card,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: AppColors.border,
    marginBottom: 20,
    gap: 14,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: AppColors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    color: AppColors.white,
    fontSize: 16,
    fontWeight: '900',
  },
  userEmail: {
    color: AppColors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  sectionLabel: {
    color: AppColors.textMuted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  statsCard: {
    backgroundColor: AppColors.card,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: AppColors.border,
    marginBottom: 20,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  statLabel: {
    color: AppColors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  statVal: {
    color: AppColors.white,
    fontSize: 13,
    fontWeight: '800',
  },
  divider: {
    height: 1,
    backgroundColor: AppColors.border,
    marginVertical: 6,
  },
  unitToggle: {
    flexDirection: 'row',
    backgroundColor: AppColors.surface,
    borderRadius: 10,
    padding: 3,
  },
  unitBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  unitBtnActive: {
    backgroundColor: AppColors.accent,
  },
  unitText: {
    color: AppColors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
  },
  unitTextActive: {
    color: AppColors.black,
    fontWeight: '800',
  },
  apiInfoText: {
    color: AppColors.textSecondary,
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 10,
  },
  apiInput: {
    backgroundColor: AppColors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: AppColors.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: AppColors.white,
    fontSize: 13,
    marginBottom: 10,
  },
  quickSelectRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 4,
  },
  quickPill: {
    backgroundColor: AppColors.surface,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  quickPillText: {
    color: AppColors.accent,
    fontSize: 10,
    fontWeight: '700',
  },
});

export default SettingsScreen;
