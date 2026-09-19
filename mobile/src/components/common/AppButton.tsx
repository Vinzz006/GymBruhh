import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import AppColors from '../../constants/colors';

interface AppButtonProps {
  text: string;
  onPressed?: () => void;
  onPress?: () => void;
  isLoading?: boolean;
  variant?: 'primary' | 'secondary' | 'purple' | 'danger' | 'outline';
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export const AppButton: React.FC<AppButtonProps> = ({
  text,
  onPressed,
  onPress,
  isLoading = false,
  variant = 'primary',
  style,
  textStyle,
  disabled = false,
  icon,
}) => {
  const handlePress = onPress || onPressed;

  const getBackgroundColor = () => {
    if (disabled) return AppColors.surface;
    switch (variant) {
      case 'primary':
        return AppColors.accent;
      case 'secondary':
        return AppColors.surface;
      case 'purple':
        return AppColors.purple;
      case 'danger':
        return AppColors.red;
      case 'outline':
        return 'transparent';
      default:
        return AppColors.accent;
    }
  };

  const getTextColor = () => {
    if (disabled) return AppColors.textMuted;
    switch (variant) {
      case 'primary':
        return AppColors.black;
      case 'secondary':
      case 'purple':
      case 'danger':
        return AppColors.white;
      case 'outline':
        return AppColors.accent;
      default:
        return AppColors.black;
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handlePress}
      disabled={disabled || isLoading}
      style={[
        styles.button,
        { backgroundColor: getBackgroundColor() },
        variant === 'outline' && styles.outlineBorder,
        style,
      ]}
    >
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? AppColors.black : AppColors.white}
        />
      ) : (
        <>
          {icon ? <>{icon}</> : null}
          <Text style={[styles.text, { color: getTextColor() }, textStyle]}>
            {text}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 52,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    shadowColor: AppColors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  outlineBorder: {
    borderWidth: 1.5,
    borderColor: AppColors.accent,
  },
  text: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});

export default AppButton;
