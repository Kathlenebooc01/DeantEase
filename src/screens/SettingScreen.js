import React from "react"
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Image, ScrollView } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { SafeAreaProvider } from "react-native-safe-area-context"
import Navbar from "../navigations/navbar"

export default function SettingsScreen({ navigation }) {
  const handleMenuPress = (menuItem) => {
    console.log("Menu pressed:", menuItem)
    // Add navigation logic here based on menuItem
    // Example: navigation.navigate(menuItem)
  }

  const handleLogout = () => {
    console.log("Logout pressed")
    // Add logout logic here
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={true}
          bounces={true}
          scrollEventThrottle={16}
          contentContainerStyle={styles.scrollContainer}
        >
          
          {/* Profile Section */}
          <View style={styles.profileSection}>
            <View style={styles.profileImageContainer}>
              <Image 
                source={require("../../assets/profile/photo.png")} 
                style={styles.profileImage} 
              />
            </View>
            <Text style={styles.profileName}>Clara Lauren</Text>
            <Text style={styles.profileEmail}>claralaurent@gmail.com</Text>
          </View>

          {/* Settings Title */}
          <Text style={styles.sectionTitle}>Settings</Text>
          
          {/* Account */}
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => handleMenuPress("Account")}
          >
            <View style={styles.menuLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="person-outline" size={20} color="#666" />
              </View>
              <Text style={styles.menuText}>Account</Text>
            </View>
            <Ionicons name="chevron-forward-outline" size={20} color="#999" />
          </TouchableOpacity>

          {/* Notifications */}
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => handleMenuPress("Notifications")}
          >
            <View style={styles.menuLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="notifications-outline" size={20} color="#666" />
              </View>
              <Text style={styles.menuText}>Notifications</Text>
            </View>
            <Ionicons name="chevron-forward-outline" size={20} color="#999" />
          </TouchableOpacity>

          {/* Dental History */}
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => handleMenuPress("DentalHistory")}
          >
            <View style={styles.menuLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="time-outline" size={20} color="#666" />
              </View>
              <Text style={styles.menuText}>Dental History</Text>
            </View>
            <Ionicons name="chevron-forward-outline" size={20} color="#999" />
          </TouchableOpacity>

          {/* Terms and Policies */}
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => handleMenuPress("TermsAndPolicies")}
          >
            <View style={styles.menuLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="document-text-outline" size={20} color="#666" />
              </View>
              <Text style={styles.menuText}>Terms and Policies</Text>
            </View>
            <Ionicons name="chevron-forward-outline" size={20} color="#999" />
          </TouchableOpacity>

          {/* Contact Support */}
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => handleMenuPress("ContactSupport")}
          >
            <View style={styles.menuLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="help-circle-outline" size={20} color="#666" />
              </View>
              <Text style={styles.menuText}>Contact support</Text>
            </View>
            <Ionicons name="chevron-forward-outline" size={20} color="#999" />
          </TouchableOpacity>

          {/* Logout */}
          <TouchableOpacity 
            style={[styles.menuItem, styles.logoutItem]}
            onPress={handleLogout}
          >
            <View style={styles.menuLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="log-out-outline" size={20} color="#666" />
              </View>
              <Text style={styles.menuText}>Logout</Text>
            </View>
          </TouchableOpacity>

          {/* Extra space at bottom for better scrolling */}
          <View style={styles.bottomSpacer} />

        </ScrollView>

        <Navbar navigation={navigation} activeTab="Settings" />
      </SafeAreaView>
    </SafeAreaProvider>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingBottom: 120, // Increased bottom padding for navbar clearance
    flexGrow: 1,
  },
  profileSection: {
    alignItems: "center",
    paddingVertical: 90,
  },
  profileImageContainer: {
    marginBottom: 15,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#e0e0e0",
  },
  profileName: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: "#666",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 20,
    marginTop: -20,
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e0e0e0",
  },
  logoutItem: {
    borderBottomWidth: 0,
  },
  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 24,
    alignItems: "center",
    marginRight: 16,
  },
  menuText: {
    fontSize: 16,
    color: "#333",
  },
  bottomSpacer: {
    height: 20,
  },
})