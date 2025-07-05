import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

const ProfileScreen = () => {
  return (
    <View style={styles.container}>
      <Text>Profile Information</Text>
      {/* Add profile details here */}
      <Button title="Edit Profile" onPress={() => { /* Handle edit profile */ }} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

export default ProfileScreen;