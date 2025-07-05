import React, { useState } from 'react';
import { 
  View, 
  Text, 
  Alert, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform 
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { TextInput } from 'react-native-paper';
import { useCompletePasswordResetMutation } from '../../../store/authApi';
import AntDesign from '@react-native-vector-icons/ant-design';

const ForgotPasswordCompleteScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { verificationId, email } = route.params;
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [completeReset, { isLoading }] = useCompletePasswordResetMutation();

  const handleGoBack = () => navigation.goBack();

  const handleSubmit = async () => {
    try {
      const response = await completeReset({ 
        verificationId,
        code, 
        newPassword 
      }).unwrap();

      if (response.success) {
        Alert.alert('Success', 'Password updated successfully!');
        navigation.navigate('Login');
      }
    } catch (error) {78
      Alert.alert('Error', error.data?.error || 'Reset failed');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <AntDesign name="left-circle" size={24} color="#008080" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reset Password</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          <View style={styles.illustrationContainer}>
            <AntDesign name="lock" size={72} color="#008080" style={styles.icon} />
            <Text style={styles.subtitle}>
              Code sent to phone linked with {email}
            </Text>
          </View>

          <View style={styles.formContainer}>
            <TextInput
              label="Verification Code"
              value={code}
              onChangeText={setCode}
              keyboardType="number-pad"
              mode="outlined"
              style={styles.input}
              theme={{
                colors: {
                  primary: '#008080',
                  placeholder: '#999',
                },
              }}
              left={
                <TextInput.Icon
                  name="numeric"
                  color="#999"
                />
              }
            />

            <TextInput
              label="New Password"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              mode="outlined"
              style={styles.input}
              theme={{
                colors: {
                  primary: '#008080',
                  placeholder: '#999',
                },
              }}
              left={
                <TextInput.Icon
                  name="lock"
                  color="#999"
                />
              }
            />

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.buttonText}>Reset Password</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F8FF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0F2F1',
    backgroundColor: '#E0F2F1',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#008080',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  illustrationContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  icon: {
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#5F9EA0',
    textAlign: 'center',
    marginTop: 8,
  },
  formContainer: {
    marginBottom: 24,
  },
  input: {
    backgroundColor: '#FFF',
    marginBottom: 20,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#008080',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
export default ForgotPasswordCompleteScreen;