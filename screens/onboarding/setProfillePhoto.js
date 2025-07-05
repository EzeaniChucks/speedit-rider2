import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity } from 'react-native';
import UploadBottomSheet from './uploadSheet';
import Icons from '@react-native-vector-icons/ant-design';
import { Box, Progress } from 'native-base';

const DocumentCollectionScreen = ({navigation}) => {
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const toggle = () => {setIsBottomSheetOpen(!isBottomSheetOpen);
    console.log("Bottom sheet toggled:", isBottomSheetOpen);
  };
  const [progress, setProgress] = useState(20); 
  const handleNext = () => {
    // Increase progress by 20% with each button press (adjust as necessary)
    setProgress(prev => Math.min(prev + 20, 100));
    navigation.navigate('BankCollectionScreen',progress); // Navigate to the next screen
  };

  return (
    <View style={styles.container}>
        <Box safeArea padding={4}>
           <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
           <Icons name="arrow-left" size={30} color='teal' />
</TouchableOpacity>
      <Text style={styles.title}>Document collection</Text>
         </View>
         <Progress value={progress} colorScheme="teal" size="md" mb={4} />
      
         </Box>
          <View style={styles.content}>
      <Text style={styles.instruction}>
        Profile picture: upload your best photo (selfies are welcome).
        Take the photo in a bright area, avoiding reflections and blurry images.
      </Text>
      </View>
      <Button style={styles.button}
        title="Upload"
        onPress={() => toggle()}
        color="green"
      />
{      isBottomSheetOpen &&
     <UploadBottomSheet onChoose={()=>handleNext()} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
   alignContent:'center'
  },
button:{  backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',},
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  instruction: {
    marginVertical: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    width: '100%',
},
content: {
    flex: 1,
   
    marginVertical: 30,
},
});

export default DocumentCollectionScreen;