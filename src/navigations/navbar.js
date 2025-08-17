import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { Ionicons } from "@expo/vector-icons"

export default function Navbar({ navigation, activeTab = "Home" }) {
  const handleNavigation = (screen) => {
    if (navigation) {
      // Navigate to Profile when Home is clicked
      if (screen === "Home") {
        navigation.navigate("Profile")
      } else {
        navigation.navigate(screen)
      }
    } else {
      console.log("Navigate to:", screen === "Home" ? "Profile" : screen)
    }
  }

  return (
    <View style={styles.bottomNavigation}>
      <TouchableOpacity
        style={[styles.navItem, activeTab === "Home" && styles.activeNavItem]}
        onPress={() => handleNavigation("Home")}
      >
        <Ionicons
          name={activeTab === "Home" ? "home" : "home-outline"}
          size={24}
          color={activeTab === "Home" ? "#4A90E2" : "#9CA3AF"}
        />
        {activeTab === "Home" && <Text style={styles.activeNavText}>Home</Text>}
        {activeTab === "Home" && <View style={styles.activeIndicator} />}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.navItem, activeTab === "Appointment" && styles.activeNavItem]}
        onPress={() => handleNavigation("Appointment")}
      >
        <Ionicons 
          name={activeTab === "Appointment" ? "calendar" : "calendar-outline"} 
          size={24} 
          color={activeTab === "Appointment" ? "#4A90E2" : "#9CA3AF"} 
        />
        {activeTab === "Appointment" && <Text style={styles.activeNavText}>Appointment</Text>}
        {activeTab === "Appointment" && <View style={styles.activeIndicator} />}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.navItem, activeTab === "Message" && styles.activeNavItem]}
        onPress={() => handleNavigation("Message")}
      >
        <Ionicons 
          name={activeTab === "Message" ? "chatbubble" : "chatbubble-outline"} 
          size={24} 
          color={activeTab === "Message" ? "#4A90E2" : "#9CA3AF"} 
        />
        {activeTab === "Message" && <Text style={styles.activeNavText}>Message</Text>}
        {activeTab === "Message" && <View style={styles.activeIndicator} />}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.navItem, activeTab === "Settings" && styles.activeNavItem]}
        onPress={() => handleNavigation("SettingsScreen")}
      >
        <Ionicons 
          name={activeTab === "Settings" ? "person" : "person-outline"} 
          size={24} 
          color={activeTab === "Settings" ? "#4A90E2" : "#9CA3AF"} 
        />
        {activeTab === "Settings" && <Text style={styles.activeNavText}>Settings</Text>}
        {activeTab === "Settings" && <View style={styles.activeIndicator} />}
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  bottomNavigation: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  navItem: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    minWidth: 60,
    position: "relative",
  },
  activeNavItem: {
    backgroundColor: "transparent",
  },
  activeNavText: {
    color: "#4A90E2",
    fontSize: 11,
    marginTop: 2,
    fontWeight: "600",
  },
  activeIndicator: {
    position: "absolute",
    bottom: -2,
    width: 4,
    height: 4,
    backgroundColor: "#4A90E2",
    borderRadius: 2,
  },
})