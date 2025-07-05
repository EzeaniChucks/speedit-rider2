import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Image} from 'react-native';
import Icons from '@react-native-vector-icons/ant-design';
import {CommonActions} from '@react-navigation/native';

const AccountCreatedScreen = ({navigation}) => {
  const handleLogin = () => {
    // Reset stack to Login to prevent going back to registration flow
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{name: 'Login'}],
      }),
    );
  };
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Account Created</Text>
        <TouchableOpacity>
          <Icons name="close" size={24} color="black" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Image
          source={require('../../assests/onboarding5.jpg')} // Replace with your image path
          style={styles.image}
        />
        <Text style={styles.successMessage}>
          You successfully created your account
        </Text>
        <Text style={styles.subMessage}>
          Sign in to start your application journey.
        </Text>
      </View>

      <TouchableOpacity onPress={handleLogin} style={styles.signInButton}>
        <Text style={styles.signInText}>Sign In</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 30,
  },
  image: {
    width: 150,
    height: 150,
    marginBottom: 20,
    // Adapt according to your asset
  },
  successMessage: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  subMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  passwordSaved: {
    fontSize: 14,
    color: 'grey',
    marginBottom: 20,
  },
  signInButton: {
    backgroundColor: 'teal', // Modify color as per your theme
    padding: 15,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
  },
  signInText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default AccountCreatedScreen;
