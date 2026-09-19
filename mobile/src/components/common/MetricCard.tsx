import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import AppColors from '../../constants/colors';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon?: React.ReactNode;
  accentColor?: string;
  style?: ViewStyle;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  icon,
  accentColor = AppColors.accent,
  style,
}) => {
  return (
    <View style={[styles.card, style]}>
      <View style={styles.topRow}>
        <Text style={styles.title}>{title}</Text>
        {icon ? (
          <View style={[styles.iconBg, { backgroundColor: `${accentColor}1A` }]}>
            {icon}
          </View>
        ) : null}
      </View>
      <View style={styles.valueRow}>
        <Text style={[styles.value, { color: accentColor }]}>{value}</Text>
        {unit ? <Text style={styles.unit}>{unit}</Text> : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: AppColors.card,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: AppColors.border,
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    color: AppColors.textSecondary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  iconBg: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  value: {
    fontSize: 22,
    fontWeight: '900',
  },
  unit: {
    fontSize: 12,
    color: AppColors.textMuted,
    fontWeight: '700',
    marginLeft: 4,
  },
});

export default MetricCard;
