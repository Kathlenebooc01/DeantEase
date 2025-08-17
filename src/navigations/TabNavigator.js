import { useState } from 'react'
import { View, SafeAreaView, StyleSheet, Text } from 'react-native'
import Navbar from './navbar' // ✅ Correct - same folder

// Fix these import paths:
import Profile from '../screens/Profile'           // ✅ Go up one folder, then into screens
import SettingsScreen from '../screens/SettingScreen'  // ✅ Go up one folder, then into screens

// Temporary screens until you create the real ones
const AppointmentScreen = () => (
  <View style={styles.screenContainer}>
    <Text style={styles.screenTitle}>Appointments</Text>
  </View>
)

const MessageScreen = () => (
  <View style={styles.screenContainer}>
    <Text style={styles.screenTitle}>Messages</Text>
  </View>
)

export default function TabNavigator() {
  const [activeTab, setActiveTab] = useState("Home")

  const renderScreen = () => {
    switch (activeTab) {
      case "Home":
        return <Profile />
      case "Appointment":
        return <AppointmentScreen />
      case "Message":
        return <MessageScreen />
      case "Settings":
        return <SettingsScreen />
      default:
        return <Profile />
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contentContainer}>
        {renderScreen()}
      </View>

      <Navbar 
        activeTab={activeTab} 
        onTabPress={setActiveTab} 
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  contentContainer: {
    flex: 1,
    paddingBottom: 90,
  },
  screenContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
  },
})