import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppColors from '../../constants/colors';

interface RestTimerModalProps {
  seconds: number;
  isActive: boolean;
  onSkip: () => void;
  onAdjust: (delta: number) => void;
}

export const RestTimerModal: React.FC<RestTimerModalProps> = ({
  seconds,
  isActive,
  onSkip,
  onAdjust,
}) => {
  if (!isActive || seconds <= 0) return null;

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  const timeFormatted = `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;

  return (
    <View style={styles.floatingBanner}>
      <View style={styles.timerRow}>
        <View style={styles.iconBadge}>
          <Ionicons name="timer-outline" size={18} color={AppColors.accent} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.label}>REST INTERVAL</Text>
          <Text style={styles.timerText}>{timeFormatted}</Text>
        </View>
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.adjustBtn}
          onPress={() => onAdjust(-30)}
          activeOpacity={0.7}
        >
          <Text style={styles.adjustText}>-30s</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.adjustBtn}
          onPress={() => onAdjust(30)}
          activeOpacity={0.7}
        >
          <Text style={styles.adjustText}>+30s</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.skipBtn}
          onPress={onSkip}
          activeOpacity={0.7}
        >
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  floatingBanner: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    backgroundColor: AppColors.card,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: AppColors.accent,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: AppColors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
    zIndex: 999,
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: `${AppColors.accent}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  textContainer: {},
  label: {
    color: AppColors.accent,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  timerText: {
    color: AppColors.white,
    fontSize: 18,
    fontWeight: '900',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  adjustBtn: {
    backgroundColor: AppColors.surface,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  adjustText: {
    color: AppColors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
  },
  skipBtn: {
    backgroundColor: AppColors.accent,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  skipText: {
    color: AppColors.black,
    fontSize: 11,
    fontWeight: '800',
  },
});

export default RestTimerModal;
