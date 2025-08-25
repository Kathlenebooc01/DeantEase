import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import Opening from './src/screens/Opening';
import GetStartedScreen from './src/screens/Getstartedscreen';
import LoginScreen from './src/screens/Login';
import SignUpScreen from './src/screens/Signupscreen';
import ForgotScreen from './src/screens/Forgotscreen';
import Profile from './src/screens/Profile';
import ServicesScreen from './src/screens/ServicesScreen';
import SettingsScreen from './src/screens/SettingScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Opening"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Opening" component={Opening} />
        <Stack.Screen name="GetStarted" component={GetStartedScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotScreen} />
        <Stack.Screen name="Profile" component={Profile} />
        <Stack.Screen name="ServicesScreen" component={ServicesScreen} />
        <Stack.Screen name="SettingsScreen" component={SettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}