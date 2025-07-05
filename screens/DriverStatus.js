import React from 'react';
import {View, Text, StyleSheet, Button, Image} from 'react-native';
import MapView, {Marker, Polyline} from 'react-native-maps';
import Icon from '@react-native-vector-icons/ionicons';
import {Pressable} from 'native-base';

const RiderStatus = () => {
  return (
    <View style={styles.profileContainer}>
      <Image
        source={require('../assests/avatar.jpg')} // Placeholder for user image
        style={styles.profileImage}
      />
      <View style={styles.userInfo}>
        <Text style={styles.userName}>Ahmad F W</Text>
        <Text style={styles.userPhone}>+629 5371 7526 86</Text>
      </View>
      <Pressable
        p={3}
        borderRadius={'20'}
        bgColor={'green.500'}
        style={styles.onlineStatus}>
        <Icon name="radio-button-on" size={20} color="white" />
        <Text style={styles.onlineText}>Online</Text>
      </Pressable>
    </View>
  );
};
const styles = StyleSheet.create({
  profileContainer: {
    flexDirection: 'row',
    padding: 16,
    position: 'absolute',
    top: 10,
    width: '90%',
    left: 20,
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderRadius: 20,
    marginBottom: 20,
    alignItems: 'center',
    borderColor: 'teal',
    borderWidth: 1,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  userInfo: {
    marginLeft: 10,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  userPhone: {
    fontSize: 14,
    color: '#666',
  },
  onlineStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  onlineText: {
    marginLeft: 5,
    color: 'white',
  },
});
export default RiderStatus;
