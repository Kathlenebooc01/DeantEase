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
        <Ionicons name="home" size={24} color="#3F8FBA" />
        {activeTab === "Home" && <Text style={styles.activeNavText}>Home</Text>}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.navItem, activeTab === "Calendar" && styles.activeNavItem]}
        onPress={() => handleNavigation("Calendar")}
      >
        <Ionicons name="calendar-outline" size={24} color="#3F8FBA" />
        {activeTab === "Calendar" && <Text style={styles.activeNavText}>Calendar</Text>}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.navItem, activeTab === "Chat" && styles.activeNavItem]}
        onPress={() => handleNavigation("Chat")}
      >
        <Ionicons name="chatbubble-outline" size={24} color="#3F8FBA" />
        {activeTab === "Chat" && <Text style={styles.activeNavText}>Chat</Text>}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.navItem, activeTab === "Settings" && styles.activeNavItem]}
        onPress={() => handleNavigation("Settings")}
      >
        <Ionicons name="settings-outline" size={24} color="#3F8FBA" />
        {activeTab === "Settings" && <Text style={styles.activeNavText}>Settings</Text>}
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  bottomNavigation: {
    position: "absolute",
    bottom: 15,
    left: 0,
    right: 0,
    backgroundColor: "#4A90E2",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 15,
    paddingBottom: 12,
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
  },
  navItem: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 5,
  },
  activeNavItem: {
    backgroundColor: "rgba(255, 255, 255, 1)",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  activeNavText: {
    color: "#3F8FBA",
    fontSize: 12,
    marginTop: 2,
    fontWeight: "500",
  },
})
