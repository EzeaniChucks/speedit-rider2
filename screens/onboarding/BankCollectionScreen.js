import {Box, Progress} from 'native-base';
import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Icons from '@react-native-vector-icons/ant-design';
// import { Box, Progress } from 'native-base';

const BankCollectionScreen = ({route, navigation}) => {
  const [bankName, setBankName] = useState('');
  const [bankNumber, setBankNumber] = useState('');
  const [progress, setProgress] = useState(40);
  const handleNext = () => {
    // Handle the next action here (e.g., navigation)
    console.log('Bank Name Submitted:', bankName);
    setProgress(prev => Math.min(prev + 20, 100));
    navigation.navigate('DocumentUploadScreen', progress); // Navigate to the next screen
  };

  return (
    <View style={styles.container}>
      <Box safeArea padding={4}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icons name="arrow-left" size={30} color="teal" />
          </TouchableOpacity>
          <Text style={styles.title}>Document collection</Text>
        </View>
        <Progress value={progress} colorScheme="teal" size="md" mb={4} />
      </Box>
      <View style={styles.content}>
        <Box>
          <Text style={styles.subtitle}>
            Enter your Bank name (e.g UBA, GTB, First Bank)
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Opay"
            value={bankName}
            onChangeText={setBankName}
          />
        </Box>
        <Box>
          <Text style={styles.subtitle}>
            Enter your Bank account number: iban
          </Text>
          <TextInput
            style={styles.input}
            placeholder="1234567890"
            value={bankNumber}
            onChangeText={setBankNumber}
          />
        </Box>
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
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    width: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    marginVertical: 10,
    fontSize: 16,
    color: '#555',
  },
  content: {
    flex: 1,

    marginVertical: 30,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 10,
    marginBottom: 20,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 4,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default BankCollectionScreen;
