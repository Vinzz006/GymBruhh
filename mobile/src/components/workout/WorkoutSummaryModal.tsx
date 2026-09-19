import React from 'react';
import { View, Text, StyleSheet, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppColors from '../../constants/colors';
import AppButton from '../common/AppButton';

interface WorkoutSummaryModalProps {
  visible: boolean;
  summary: any | null;
  onDismiss: () => void;
}

export const WorkoutSummaryModal: React.FC<WorkoutSummaryModalProps> = ({
  visible,
  summary,
  onDismiss,
}) => {
  if (!summary) return null;

  const durationSec = summary.duration_seconds || 0;
  const minutes = Math.floor(durationSec / 60);
  const totalVolume = Math.round(summary.total_volume_kg || 0);
  const setsCount = summary.total_sets || 0;
  const prsCount = summary.prs_achieved?.length || 0;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.trophyCircle}>
            <Ionicons name="trophy" size={40} color={AppColors.gold} />
          </View>

          <Text style={styles.title}>WORKOUT COMPLETED! 🔥</Text>
          <Text style={styles.subtitle}>
            Outstanding intensity! Your session has been recorded into the fitness engine.
          </Text>

          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>DURATION</Text>
              <Text style={styles.statVal}>{minutes} min</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>VOLUME</Text>
              <Text style={[styles.statVal, { color: AppColors.cyan }]}>{totalVolume} kg</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>SETS LOGGED</Text>
              <Text style={styles.statVal}>{setsCount}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>NEW PRS</Text>
              <Text style={[styles.statVal, { color: AppColors.gold }]}>{prsCount}</Text>
            </View>
          </View>

          <AppButton
            text="Continue to Dashboard"
            onPress={onDismiss}
            style={styles.btn}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 6, 8, 0.85)',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: AppColors.card,
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: AppColors.border,
    padding: 24,
    alignItems: 'center',
  },
  trophyCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${AppColors.gold}20`,
    borderWidth: 2,
    borderColor: AppColors.gold,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    color: AppColors.white,
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  subtitle: {
    color: AppColors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
    width: '100%',
  },
  statBox: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: AppColors.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: AppColors.border,
    alignItems: 'center',
  },
  statLabel: {
    color: AppColors.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  statVal: {
    color: AppColors.accent,
    fontSize: 18,
    fontWeight: '900',
  },
  btn: {
    width: '100%',
  },
});

export default WorkoutSummaryModal;
