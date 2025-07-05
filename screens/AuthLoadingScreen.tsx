import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { StackActions, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage'; // For persisting token

import { RootState, AppDispatch } from '../store';
// import { setCredentials } from '../store/authSlice'; // If loading from AsyncStorage
import { colors } from '../theme/colors';

const AuthLoadingScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  useEffect(() => {
    const bootstrapAsync = async () => {
      // TODO: Implement token loading from AsyncStorage if needed
      // const userToken = await AsyncStorage.getItem('userToken');
      // if (userToken) {
      //   dispatch(setCredentials({ token: userToken, user: previouslyFetchedUser }));
      //   navigation.dispatch(StackActions.replace('MainAppFlow'));
      // } else {
      //   navigation.dispatch(StackActions.replace('AuthFlow'));
      // }

      // Simplified for now, directly checks Redux state
      if (isAuthenticated) {
        navigation.dispatch(StackActions.replace('MainAppFlow' as any));
      } else {
        navigation.dispatch(StackActions.replace('AuthFlow' as any));
      }
    };

    bootstrapAsync();
  }, [isAuthenticated, navigation, dispatch]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});

export default AuthLoadingScreen;