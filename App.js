import React, { useState } from 'react';
import { NavigationContainer, ThemeContext } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"

// Import the UserProvider from your context file
import { UserProvider } from "./src/context/UserContext"
import { ThemeProvider } from "./src/context/ThemeContext"

// Import the GlobalChatbot component
import GlobalChatbot from "./src/components/GlobalChatbot"

import Opening from "./src/screens/Opening"
import GetStartedScreen from "./src/screens/Getstartedscreen"
import LoginScreen from "./src/screens/Login"
import SignUpScreen from "./src/screens/Signupscreen"
import ForgotScreen from "./src/screens/Forgotscreen"
import Profile from "./src/screens/Profile"
import ServicesScreen from "./src/screens/ServicesScreen"
import SettingsScreen from "./src/screens/SettingScreen"
import AppointmentScreen from "./src/screens/AppointmentScreen"
import NotificationScreen from "./src/screens/NotificationScreen"
import FeedbackScreen from "./src/screens/FeedbackScreen"
import SurveyScreen from "./src/screens/Surveyscreen"
import Nextsurvey from "./src/screens/Nextsurvery"
import AccountSettingsScreen from "./src/screens/AccountSettings"
import ViewAppointmentScreen from "./src/screens/ViewAppointmentScreen"
import ChangePasswordScreen from "./src/screens/ChangePasswordScreen"
import MessagesScreen from "./src/screens/MessagesScreen"
import ChatMessages from "./src/screens/ChatMessages"
import ContactUs from "./src/screens/ContactUs" // Add this import

const Stack = createStackNavigator()

// Component that handles navigation and conditional chatbot rendering
const AppNavigator = () => {
  const [currentRoute, setCurrentRoute] = useState('Opening');
  
  // Screens where chatbot should NOT appear (authentication screens)
  const excludedScreens = [
    'Opening',
    'GetStarted', 
    'Login', 
    'SignUp', 
    'ForgotPassword'
  ];
  
  // Check if chatbot should be shown on current screen
  const shouldShowChatbot = !excludedScreens.includes(currentRoute);
  
  return (
    <>
      <Stack.Navigator 
        initialRouteName="Opening" 
        screenOptions={{ headerShown: false }}
        screenListeners={{
          state: (e) => {
            // Track current route name
            const state = e.data?.state;
            if (state) {
              const routes = state.routes;
              if (routes && routes.length > 0) {
                const currentRouteName = routes[state.index]?.name;
                if (currentRouteName && currentRouteName !== currentRoute) {
                  setCurrentRoute(currentRouteName);
                }
              }
            }
          }
        }}
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
        <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
        <Stack.Screen name="MessagesScreen" component={MessagesScreen} />
        <Stack.Screen name="ChatMessages" component={ChatMessages} />
        <Stack.Screen name="ContactUs" component={ContactUs} />
        <Stack.Screen name="ThemeContext" component={ThemeContext} />
      </Stack.Navigator>
      
      {/* Conditionally render GlobalChatbot - only appears on authenticated screens */}
      {shouldShowChatbot && <GlobalChatbot />}
    </>
  );
};

export default function App() {
  return (
    <UserProvider>
      <ThemeProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </ThemeProvider>
    </UserProvider>
  )
}