import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/mainScreens/bottomTabs/homeScreen';
import Ionicons from '@react-native-vector-icons/ionicons'; // Fixed import name
import RiderAnalyticsScreen from '../screens/mainScreens/bottomTabs/analytics';
import RiderActiveOrders from '../screens/order/RiderActiveOrders';
import RiderProfileScreen from '../screens/mainScreens/bottomTabs/profileManagement/userProfileScreen';

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        tabBarIcon: ({focused, color, size}) => {
          let iconName;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;

            case 'Analytics':
              iconName = focused ? 'cash' : 'cash-outline';
              break;
            case 'Orders':
              iconName = focused ? 'chatbubble' : 'chatbubble-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: 'white',
        tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.6)',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#008A63', // Teal background
          height: 60,
          paddingBottom: 5,
          borderTopWidth: 0,
          elevation: 10, // Android shadow
          shadowColor: '#000', // iOS shadow
          shadowOffset: {width: 0, height: -2},
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginBottom: 4,
        },
      })}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{tabBarLabel: 'Home'}}
      />
      {/* <Tab.Screen
        name="Earnings"
        component={EarningsScreen}
        options={{tabBarLabel: 'Earnings'}}
      /> */}
      <Tab.Screen
        name="Analytics"
        component={RiderAnalyticsScreen}
        options={{tabBarLabel: 'Analytics'}}
      />

      {/* Unified Orders Screen */}
      <Tab.Screen
        name="RiderActiveOrders"
        component={RiderActiveOrders}
        options={{
          tabBarLabel: 'Orders',
          tabBarIcon: ({color, size}) => (
            <Ionicons name="list" size={size} color={color} />
          ),
        }}
      />
      {/* <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{tabBarLabel: 'Profile'}}
      /> */}
      <Tab.Screen
        name="Profile"
        component={RiderProfileScreen}
        options={{tabBarLabel: 'Profile', headerShown: false}}
        // options={{}}
      />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;
