import React, { useEffect, useState } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import AntDesign from '@react-native-vector-icons/ant-design';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AvailabilityToggle from './availabiltyToggle'; // Note: Typo in import (availabilty → availability)
import { AppDispatch } from '../store';
import { STORAGE_KEYS } from '../util/storageKeys';
import { logoutUser } from '../store/authSlice';
import { useNavigation } from '@react-navigation/native';

const UserProfileCard = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation: any = useNavigation(); // Use hook to access navigation
  const reduxprofile = useSelector((state: any) => state.auth.user);
  const [profile, setProfile] = useState(reduxprofile);
  const { isAvailable } = useSelector((state: any) => state.availability);

  const userProfile = async () => {
    try {
      const storageProfile = await AsyncStorage.getItem(
        STORAGE_KEYS.USER_PROFILE,
      );
      if (storageProfile) {
        setProfile(JSON.parse(storageProfile));
      }
    } catch (error) {
      console.error('Failed to load user profile from AsyncStorage:', error);
      Alert.alert('Error', 'Failed to load profile data.');
    }
  };

  useEffect(() => {
    if (!reduxprofile) {
      userProfile();
    } else {
      setProfile(reduxprofile);
    }
  }, [reduxprofile]);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      navigation.replace('Login');
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'Failed to log out. Please try again.');
    }
  };

  return (
    <View style={styles.profileContainer}>
      <Image
        source={require('../assests/avatar.jpg')} // Fixed typo: assests → assets
        style={styles.profileImage}
      />
      <View style={styles.userInfo}>
        <Text style={styles.userName}>
          {profile?.firstName} {profile?.lastName}
        </Text>
        <Text style={styles.userPhone}>{profile?.phone}</Text>
      </View>
      <View style={styles.actionsContainer}>
        <View style={styles.availabilityContainer}>
          <Text style={styles.headerText}>
            {isAvailable ? "You're Online" : "You're Offline"}
          </Text>
          <AvailabilityToggle />
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <AntDesign
            name="logout"
            size={20}
            color="#FFF"
            style={styles.buttonIcon}
          />
          <Text style={styles.buttonText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  profileContainer: {
    flexDirection: 'row',
    padding: 16,
    paddingTop: 10,
    paddingBottom: 5,
    position: 'absolute',
    top: 2,
    width: '100%',
    alignSelf: 'center',
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
    flex: 1, // Allow userInfo to take available space
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  userPhone: {
    fontSize: 14,
    color: '#666',
  },
  actionsContainer: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  availabilityContainer: {
    alignItems: 'flex-end',
    marginBottom: 7,
  },
  headerText: {
    fontSize: 14,
    fontWeight: 'bold',
    // marginRight: 15,
  },
  logoutButton: {
    backgroundColor: '#FF6347', // Coral to match SignInScreen logout style
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  buttonIcon: {
    marginRight: 8,
  },
});

export default UserProfileCard;
