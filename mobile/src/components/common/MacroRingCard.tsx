import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import AppColors from '../../constants/colors';

interface MacroRingCardProps {
  targetCalories: number;
  consumedCalories: number;
  proteinG: number;
  targetProteinG: number;
  carbsG: number;
  targetCarbsG: number;
  fatG: number;
  targetFatG: number;
}

export const MacroRingCard: React.FC<MacroRingCardProps> = ({
  targetCalories = 2400,
  consumedCalories = 0,
  proteinG = 0,
  targetProteinG = 160,
  carbsG = 0,
  targetCarbsG = 220,
  fatG = 0,
  targetFatG = 70,
}) => {
  const safeTargetCal = Math.max(1, targetCalories);
  const remainingCal = Math.max(0, safeTargetCal - consumedCalories);
  const calProgress = Math.min(1.0, consumedCalories / safeTargetCal);

  const radius = 42;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - calProgress * circumference;

  const renderMacroBar = (
    label: string,
    current: number,
    target: number,
    color: string
  ) => {
    const safeTarget = Math.max(1, target);
    const progress = Math.min(1.0, current / safeTarget);
    return (
      <View style={styles.macroRow}>
        <View style={styles.macroHeader}>
          <Text style={styles.macroLabel}>{label}</Text>
          <Text style={styles.macroValue}>
            {Math.round(current)}
            <Text style={styles.macroTarget}>/{Math.round(target)}g</Text>
          </Text>
        </View>
        <View style={styles.progressBarBg}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${Math.round(progress * 100)}%`, backgroundColor: color },
            ]}
          />
        </View>
      </View>
    );
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>NUTRITION TARGETS</Text>
        <Text style={styles.status}>
          {consumedCalories > safeTargetCal ? 'Calorie Goal Exceeded' : 'On Track'}
        </Text>
      </View>

      <View style={styles.content}>
        {/* Calorie Circle */}
        <View style={styles.circleContainer}>
          <Svg width={100} height={100} viewBox="0 0 100 100">
            <Circle
              cx="50"
              cy="50"
              r={radius}
              stroke={AppColors.surface}
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            <Circle
              cx="50"
              cy="50"
              r={radius}
              stroke={AppColors.accent}
              strokeWidth={strokeWidth}
              strokeDasharray={`${circumference} ${circumference}`}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              transform="rotate(-90 50 50)"
            />
          </Svg>
          <View style={styles.circleTextContainer}>
            <Text style={styles.remainingValue}>{Math.round(remainingCal)}</Text>
            <Text style={styles.remainingLabel}>kcal left</Text>
          </View>
        </View>

        {/* Macro Bars */}
        <View style={styles.macrosContainer}>
          {renderMacroBar('Protein', proteinG, targetProteinG, AppColors.accent)}
          {renderMacroBar('Carbs', carbsG, targetCarbsG, AppColors.cyan)}
          {renderMacroBar('Fat', fatG, targetFatG, AppColors.orange)}
        </View>
      </View>

      <View style={styles.footerRow}>
        <View style={styles.footerStat}>
          <Text style={styles.footerStatLabel}>Budget</Text>
          <Text style={styles.footerStatValue}>{Math.round(safeTargetCal)} kcal</Text>
        </View>
        <View style={styles.footerDivider} />
        <View style={styles.footerStat}>
          <Text style={styles.footerStatLabel}>Consumed</Text>
          <Text style={[styles.footerStatValue, { color: AppColors.accent }]}>
            {Math.round(consumedCalories)} kcal
          </Text>
        </View>
        <View style={styles.footerDivider} />
        <View style={styles.footerStat}>
          <Text style={styles.footerStatLabel}>Remaining</Text>
          <Text style={styles.footerStatValue}>{Math.round(remainingCal)} kcal</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: AppColors.card,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    color: AppColors.textMuted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  status: {
    color: AppColors.accent,
    fontSize: 11,
    fontWeight: '800',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  circleContainer: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  circleTextContainer: {
    position: 'absolute',
    alignItems: 'center',
  },
  remainingValue: {
    color: AppColors.white,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  remainingLabel: {
    color: AppColors.textMuted,
    fontSize: 10,
    fontWeight: '700',
  },
  macrosContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  macroRow: {
    marginBottom: 8,
  },
  macroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  macroLabel: {
    color: AppColors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
  },
  macroValue: {
    color: AppColors.white,
    fontSize: 11,
    fontWeight: '800',
  },
  macroTarget: {
    color: AppColors.textMuted,
    fontSize: 10,
    fontWeight: '600',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: AppColors.surface,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: AppColors.border,
    paddingTop: 14,
  },
  footerStat: {
    alignItems: 'center',
  },
  footerStatLabel: {
    color: AppColors.textMuted,
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  footerStatValue: {
    color: AppColors.textPrimary,
    fontSize: 13,
    fontWeight: '800',
  },
  footerDivider: {
    width: 1,
    height: 20,
    backgroundColor: AppColors.border,
  },
});

export default MacroRingCard;
