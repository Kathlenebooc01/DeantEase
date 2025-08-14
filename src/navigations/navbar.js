import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { Ionicons } from "@expo/vector-icons"

export default function Navbar({ navigation, activeTab = "Home" }) {
  const handleNavigation = (screen) => {
    if (navigation) {
      navigation.navigate(screen)
    } else {
      console.log("Navigate to:", screen)
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
          size={25}
          color={activeTab === "Home" ? "#4A90E2" : "#7A9CC6"}
        />
        {activeTab === "Home" && <Text style={styles.activeNavText}>Home</Text>}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.navItem, activeTab === "Calendar" && styles.activeNavItem]}
        onPress={() => handleNavigation("Calendar")}
      >
        <Ionicons name="calendar-outline" size={24} color={activeTab === "Calendar" ? "#4A90E2" : "#7A9CC6"} />
        {activeTab === "Calendar" && <Text style={styles.activeNavText}>Calendar</Text>}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.navItem, activeTab === "Chat" && styles.activeNavItem]}
        onPress={() => handleNavigation("Chat")}
      >
        <Ionicons name="chatbubble-outline" size={24} color={activeTab === "Chat" ? "#4A90E2" : "#7A9CC6"} />
        {activeTab === "Chat" && <Text style={styles.activeNavText}>Chat</Text>}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.navItem, activeTab === "Settings" && styles.activeNavItem]}
        onPress={() => handleNavigation("Settings")}
      >
        <Ionicons name="settings-outline" size={24} color={activeTab === "Settings" ? "#4A90E2" : "#7A9CC6"} />
        {activeTab === "Settings" && <Text style={styles.activeNavText}>Settings</Text>}
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  bottomNavigation: {
    position: "absolute",
    bottom: 10,
    left: 10,
    right: 10,
    backgroundColor: "#4A90E2",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 1,
    paddingHorizontal: 10,
    borderRadius: 100,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  navItem: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 75,
    minWidth: 75,
    marginTop: 10,
    marginBottom: 10,
  },
  activeNavItem: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
  },
  activeNavText: {
    color: "#4A90E2",
    fontSize: 12,
    marginTop: 4,
    fontWeight: "500",
  },
})
