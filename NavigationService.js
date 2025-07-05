// NavigationService.js
import { NavigationContainer } from '@react-navigation/native';
import { createRef } from 'react';

// Create a navigation reference
const navigatorRef = createRef();

export function setNavigator(n) {
  navigatorRef.current = n;
}

export function navigate(name, params) {
  if (navigatorRef.current) {
    navigatorRef.current.navigate(name, params);
  }
}

export default navigatorRef;