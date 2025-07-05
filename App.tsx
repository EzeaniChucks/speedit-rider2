/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect } from 'react';
import RootNavigation from './rootNavigator';
import {setupNotificationChannel} from './firbaseSetup';

function App(): React.JSX.Element {
  useEffect(() => {
    setupNotificationChannel(); // Only once on mount
  }, []);

  return <RootNavigation />;
}

export default App;