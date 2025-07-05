import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, StyleProp, TextStyle } from 'react-native';
import { colors } from '../theme/colors';

interface StyledButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

const StyledButton: React.FC<StyledButtonProps> = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  style,
  textStyle,
}) => {
  const getButtonStyles = () => {
    switch (variant) {
      case 'secondary':
        return {
          button: styles.buttonSecondary,
          text: styles.textSecondary,
        };
      case 'outline':
        return {
          button: styles.buttonOutline,
          text: styles.textOutline,
        };
      default: // primary
        return {
          button: styles.buttonPrimary,
          text: styles.textPrimary,
        };
    }
  };

  const currentStyles = getButtonStyles();
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[styles.buttonBase, currentStyles.button, isDisabled && styles.buttonDisabled, style]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? colors.onPrimary : colors.primary} size="small" />
      ) : (
        <Text style={[styles.textBase, currentStyles.text, textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  buttonBase: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 25, // Rounded buttons
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    minHeight: 50,
  },
  textBase: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
  },
  textPrimary: {
    color: colors.onPrimary,
  },
  buttonSecondary: {
    backgroundColor: colors.secondary,
  },
  textSecondary: {
    color: colors.onSecondary,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  textOutline: {
    color: colors.primary,
  },
  buttonDisabled: {
    backgroundColor: colors.disabled,
    borderColor: colors.disabled, // for outline
  },
});

export default StyledButton;