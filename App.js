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
import AppointmentScreen from './src/screens/AppointmentScreen';
import NotificationScreen from './src/screens/NotificationScreen';
import FeedbackScreen from './src/screens/FeedbackScreen';
import SurveyScreen from './src/screens/Surveyscreen';
import Nextsurvey from './src/screens/Nextsurvery';
import AccountSettingsScreen from './src/screens/AccountSettings';
import ViewAppointmentScreen from './src/screens/ViewAppointmentScreen';

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
        <Stack.Screen name="AppointmentScreen" component={AppointmentScreen} />
        <Stack.Screen name="NotificationScreen" component={NotificationScreen} />
        <Stack.Screen name="FeedbackScreen" component={FeedbackScreen} />
        <Stack.Screen name="SurveyScreen" component={SurveyScreen} />
        <Stack.Screen name="Nextsurvey" component={Nextsurvey} />
        <Stack.Screen name="AccountSettings" component={AccountSettingsScreen} />
        <Stack.Screen name="ViewAppointmentScreen" component={ViewAppointmentScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
