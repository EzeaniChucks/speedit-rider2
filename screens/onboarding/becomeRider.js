import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import Icons from '@react-native-vector-icons/ant-design';


const BecomeRiderScreen = ({ navigation }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const handleNext = () => {
    if (!firstName || !lastName) {
      Alert.alert('Error', 'Please fill in both fields');
      return;
    }
 //BecomeRiderTwoScreen
    // navigation.navigate('DocumentCollectionScreen');
    navigation.navigate('BecomeRiderTwoScreen');
  };

  return (
    <View style={styles.container}>
         <View style={styles.header}>
         <Icons name="arrow-left" size={30} color='teal' />
      <Text style={styles.title}>Become a rider</Text>
      </View>
      <View style={styles.content}>
      <Text style={styles.subtitle}>What should we call you?</Text>

      <TextInput 
        style={styles.input}
        placeholder="First Name" placeholderTextColor={'#4CAF50'}
        value={firstName}
        onChangeText={setFirstName}
      />
      <TextInput 
        style={styles.input}
        placeholder="Last Name"
        value={lastName}  placeholderTextColor={'#4CAF50'}
        onChangeText={setLastName}
      />
</View>
      <TouchableOpacity style={styles.button} onPress={handleNext}>
        <Text style={styles.buttonText}>Next</Text>
      </TouchableOpacity>
      
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  content: {
    flex: 1,
   
    marginVertical: 30,
},
  header: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    width: '100%',
},
  subtitle: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderColor: '#28a745',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default BecomeRiderScreen;