import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import AntIcons from '@react-native-vector-icons/ant-design';
import {useNavigation} from '@react-navigation/native';
import {useInitiatePasswordResetMutation} from '../../../../store/profileApi';
import {TextInput} from 'react-native-paper';
import { useSelector } from 'react-redux';

const InitiatePasswordResetScreen = () => {
  const navigation = useNavigation();
  const [initiateReset, {isLoading}] = useInitiatePasswordResetMutation();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const user = useSelector(state => state.profile.user);

  const handleGoBack = () => navigation.goBack();

  const handleSubmit = async () => {
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    try {
      const response = await initiateReset({newPassword: password}).unwrap();

      if (response.success) {
        navigation.navigate('VerifyPasswordReset', {
          verificationId: response.verificationId,
        });
      }
    } catch (error) {
      Alert.alert(
        'Error',
        error.data?.error || 'Failed to initiate password reset',
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <AntIcons name="left" size={24} color="teal" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Change Password</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.illustration}>
          <AntIcons name="lock" size={60} color="teal" />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Create New Password</Text>
          <Text style={styles.instructions}>
            Your new password must be different from previous passwords
          </Text>

          <TextInput
            label="New Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            mode="outlined"
            style={styles.input}
            theme={{colors: {primary: 'teal'}}}
          />

          <TextInput
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            mode="outlined"
            style={styles.input}
            theme={{colors: {primary: 'teal'}}}
          />
        </View>

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Send Verification Code</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.note}>
          A verification code will be sent to your registered phone number
          ending with ••••{user?.phone?.slice(-4)}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  illustration: {
    alignItems: 'center',
    marginVertical: 30,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  instructions: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#fff',
    marginBottom: 15,
  },
  button: {
    backgroundColor: 'teal',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  note: {
    marginTop: 20,
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default InitiatePasswordResetScreen;
