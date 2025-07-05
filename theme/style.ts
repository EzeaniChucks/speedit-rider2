import { StyleSheet } from 'react-native';
import { colors } from './colors';

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: 30,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 10,
  },
  successText: {
    color: colors.success,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 10,
  },
  linkText: {
    color: colors.primary,
    textAlign: 'center',
    marginTop: 15,
    fontWeight: 'bold',
  }
});