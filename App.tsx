import React from 'react';
import { ActivityIndicator, Platform, StatusBar, useColorScheme, View } from 'react-native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import {
  initialWindowMetrics,
  SafeAreaProvider,
} from 'react-native-safe-area-context';
import { getSafeAreaInitialMetrics } from './src/Functions/safeArea';
import { AppNavigator } from './src/Navigation';
import { persistor, store } from './src/Redux';
import { Colors } from './src/Constant/Colors';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <Provider store={store}>
      <PersistGate
        loading={
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        }
        persistor={persistor}
      >
        <SafeAreaProvider
          initialMetrics={getSafeAreaInitialMetrics(initialWindowMetrics)}
        >
          <StatusBar
            barStyle={isDarkMode ? 'light-content' : 'dark-content'}
            translucent={Platform.OS === 'android'}
            backgroundColor="transparent"
          />
          <AppNavigator />
        </SafeAreaProvider>
      </PersistGate>
    </Provider>
  );
}

export default App;
