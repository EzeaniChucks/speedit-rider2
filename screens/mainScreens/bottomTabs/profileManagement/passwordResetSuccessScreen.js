import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import AntIcons from '@react-native-vector-icons/ant-design';
import {useNavigation} from '@react-navigation/native';

const PasswordResetSuccessScreen = () => {
  const navigation = useNavigation();

  const handleContinue = () => {
    navigation.reset({
      index: 0,
      routes: [{name: 'MainApp', screen:"Home"}],
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <AntIcons name="check-circle" size={80} color="teal" />
        </View>

        <Text style={styles.title}>Password Changed!</Text>

        <Text style={styles.message}>
          Your password has been successfully changed. Please log in with your
          new password.
        </Text>

        <TouchableOpacity style={styles.button} onPress={handleContinue}>
          <Text style={styles.buttonText}>Continue to Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  content: {
    padding: 30,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  button: {
    backgroundColor: 'teal',
    padding: 16,
    borderRadius: 4,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default PasswordResetSuccessScreen;
