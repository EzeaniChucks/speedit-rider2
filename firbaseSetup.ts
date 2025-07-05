import {Alert} from 'react-native';
import {PermissionsAndroid, Platform} from 'react-native';
import {Notifications} from 'react-native-notifications';
import {setFcmToken} from './store/authSlice';
import messaging, {firebase} from '@react-native-firebase/messaging';
import {firebaseConfig} from './firebaseCon';
import {Dispatch} from '@reduxjs/toolkit';

export const setupNotificationChannel = () => {
  if (Platform.OS === 'android') {
    Notifications.setNotificationChannel({
      channelId: 'default_channel_id',
      name: 'Default Channel',
      importance: 5,
      soundFile: 'default',
    });
  }
};

// Internal function to get the token
export const getFcmTokenInternal = async (dispatch?: Dispatch<any>) => {
  try {
    const token = await messaging().getToken();
    if (token) {
      // console.log('FCM Token:', token);
      // Send to backend here if needed
      dispatch?.(setFcmToken(token));
      return token;
    } else {
      Alert.alert('FCM Error', 'Could not retrieve FCM token.');
    }
  } catch (error: any) {
    Alert.alert('FCM Error', `Error: ${error.message}`);
  }
  return null;
};

export async function requestUserPermissionAndGetToken(dispatch: Dispatch<any>) {
  // Pass dispatch if storing in Redux
  let fcmToken = null;
  // console.log('Requesting user permission for FCM...');

  // TODO: Uncomment the following iOS block when upgrading to a paid Apple Developer account to enable push notifications
  /*
  if (Platform.OS === 'ios') {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      // console.log('Authorization status (iOS):', authStatus);
      fcmToken = await getFcmTokenInternal(dispatch);
    } else {
      Alert.alert(
        'Permission Denied',
        'You will not receive notifications unless you enable them in settings.',
      );
    }
  } else 
  */
  if (Platform.OS === 'android') {
    if (Platform.Version >= 33) {
      // Android 13+
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          {
            title: 'Notification Permission',
            message: 'This app needs permission to send you notifications.',
            buttonPositive: 'OK',
            buttonNegative: 'Cancel',
          },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          // console.log('Notification permission granted (Android 13+).');
          fcmToken = await getFcmTokenInternal(dispatch);
        } else {
          // console.log('Notification permission denied (Android 13+).');
          Alert.alert(
            'Permission Denied',
            'You will not receive notifications.',
          );
        }
      } catch (err) {
        console.log('Error requesting POST_NOTIFICATIONS permission:', err);
      }
    } else {
      // Android 12 and below (permission usually granted by default)
      // console.log('Android version < 13, attempting to get token directly.');
      fcmToken = await getFcmTokenInternal(dispatch);
    }
  }
  return fcmToken;
}