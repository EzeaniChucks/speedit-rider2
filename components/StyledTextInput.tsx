import React from 'react';
import { TextInput, StyleSheet, View, Text, TextInputProps } from 'react-native';
import { colors } from '../theme/colors';
// If using icons: import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface StyledTextInputProps extends TextInputProps {
  label?: string;
  error?: string;
  iconName?: string; // for icon
}

const StyledTextInput: React.FC<StyledTextInputProps> = ({ label, error, iconName, ...props }) => {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputContainer, error ? styles.inputError : null]}>
        {/* {iconName && <Icon name={iconName} size={22} color={colors.placeholder} style={styles.icon} />} */}
        <TextInput
          style={styles.input}
          placeholderTextColor={colors.placeholder}
          {...props}
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lightPurple, // Light background for input
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    height: 50,
    paddingHorizontal: 10,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    marginTop: 4,
  },
});

export default StyledTextInput;