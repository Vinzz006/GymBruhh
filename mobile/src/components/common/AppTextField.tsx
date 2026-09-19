import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardTypeOptions,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppColors from '../../constants/colors';

interface AppTextFieldProps {
  label?: string;
  placeholder?: string;
  hintText?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  multiline?: boolean;
  numberOfLines?: number;
  prefixIcon?: React.ReactNode;
  errorText?: string;
  style?: ViewStyle;
}

export const AppTextField: React.FC<AppTextFieldProps> = ({
  label,
  placeholder,
  hintText,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = 'default',
  multiline = false,
  numberOfLines = 1,
  prefixIcon,
  errorText,
  style,
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.container, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View
        style={[
          styles.inputWrapper,
          isFocused && styles.focusedBorder,
          errorText ? styles.errorBorder : null,
          multiline && { minHeight: 90, alignItems: 'flex-start' },
        ]}
      >
        {prefixIcon ? <View style={styles.prefix}>{prefixIcon}</View> : null}
        <TextInput
          style={[
            styles.input,
            multiline && { minHeight: 70, textAlignVertical: 'top' },
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder || hintText}
          placeholderTextColor={AppColors.textMuted}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={numberOfLines}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        {secureTextEntry ? (
          <TouchableOpacity
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            style={styles.eyeBtn}
          >
            <Ionicons
              name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={AppColors.textSecondary}
            />
          </TouchableOpacity>
        ) : null}
      </View>
      {errorText ? <Text style={styles.errorText}>{errorText}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    color: AppColors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: AppColors.border,
    paddingHorizontal: 14,
  },
  focusedBorder: {
    borderColor: AppColors.accent,
  },
  errorBorder: {
    borderColor: AppColors.red,
  },
  prefix: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: AppColors.textPrimary,
    fontSize: 14,
    paddingVertical: 14,
    fontWeight: '600',
  },
  eyeBtn: {
    padding: 6,
  },
  errorText: {
    color: AppColors.red,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
    marginLeft: 4,
  },
});

export default AppTextField;
