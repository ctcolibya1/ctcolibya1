import React, { useEffect } from 'react';
import { I18nManager, StatusBar } from 'react-native';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { VaultProvider, useVault } from './src/context/VaultContext';
import { RootStackParamList } from './src/types';
import { colors } from './src/theme';
import { Loading } from './src/components/ui';
import { SetupScreen } from './src/screens/SetupScreen';
import { LockScreen } from './src/screens/LockScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { CategoryScreen } from './src/screens/CategoryScreen';
import { DetailScreen } from './src/screens/DetailScreen';
import { FormScreen } from './src/screens/FormScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';

try {
  I18nManager.allowRTL(true);
  I18nManager.forceRTL(true);
} catch {
  // web / unsupported
}

const Stack = createNativeStackNavigator<RootStackParamList>();

const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.bg,
    card: colors.bgElevated,
    text: colors.text,
    border: colors.border,
    primary: colors.accent,
  },
};

function RootNavigator() {
  const { ready, hasVault, unlocked } = useVault();

  if (!ready) return <Loading />;

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        contentStyle: { backgroundColor: colors.bg },
      }}
    >
      {!hasVault ? (
        <Stack.Screen name="Setup" component={SetupScreen} />
      ) : !unlocked ? (
        <Stack.Screen name="Lock" component={LockScreen} />
      ) : (
        <>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Category" component={CategoryScreen} />
          <Stack.Screen name="Detail" component={DetailScreen} />
          <Stack.Screen name="Form" component={FormScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  useEffect(() => {
    StatusBar.setBarStyle('light-content');
  }, []);

  return (
    <SafeAreaProvider>
      <VaultProvider>
        <NavigationContainer theme={navTheme}>
          <RootNavigator />
        </NavigationContainer>
      </VaultProvider>
    </SafeAreaProvider>
  );
}
