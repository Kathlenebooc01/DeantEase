import { useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Image, Dimensions } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { SafeAreaProvider } from "react-native-safe-area-context"
import Navbar from "../navigations/navbar"

const { width } = Dimensions.get("window")

export default function HomeScreen({ navigation }) {
  const [selectedService, setSelectedService] = useState(null)

  const handleBookNow = () => {
    if (navigation) {
      navigation.navigate("Booking")
    } else {
      console.log("Navigate to Booking screen")
    }
  }

  const handleServicePress = (serviceId) => {
    setSelectedService(serviceId)
    console.log("Service selected:", serviceId)
  }

  const handleAppointmentPress = () => {
    if (navigation) {
      navigation.navigate("AppointmentDetails")
    } else {
      console.log("Navigate to Appointment Details")
    }
  }

  const handleSeeAllPress = () => {
    console.log("See All clicked")
    // navigation.navigate("AllServices") // replace with your target screen
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <Image source={require("../../assets/profile/photo.png")} style={styles.profileImage} />
            <View style={styles.userText}>
              <Text style={styles.greeting}>Hello</Text>
              <Text style={styles.userName}>Clara Lauren</Text>
            </View>
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="search-outline" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="notifications-outline" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Main Card */}
          <View style={styles.mainCard}>
            <View style={styles.cardContent}>
              <View style={styles.doctorImageContainer}>
                <Image source={require("../../assets/profile/doctor.png")} style={styles.doctorImage} />
              </View>
              <TouchableOpacity style={styles.bookButton} onPress={handleBookNow}>
                <Text style={styles.bookButtonText}>Book Now</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Services Section */}
          <View style={styles.servicesSection}>
            <View style={styles.servicesHeader}>
              <Text style={styles.sectionTitle}>Services</Text>
              <TouchableOpacity style={styles.seeAllButton} onPress={handleSeeAllPress}>
                <Text style={styles.seeAllText}>See All</Text>
                <Ionicons name="chevron-forward-outline" size={16} color="#4A90E2" style={{ marginLeft: 3 }} />
              </TouchableOpacity>
            </View>

            <View style={styles.servicesGrid}>
              {/* Service 1 */}
              <TouchableOpacity
                style={[styles.serviceCard, selectedService === "dental" && styles.serviceCardActive]}
                onPress={() => handleServicePress("dental")}
              >
                <View style={styles.serviceIconContainer}>
                  <Image
                    source={require("../../assets/profile/image 45.png")}
                    style={{ width: 25, height: 25 }}
                    resizeMode="contain"
                  />
                  <Text style={styles.serviceText}>Teeth Whitening</Text>
                </View>
              </TouchableOpacity>

              {/* Service 2 */}
              <TouchableOpacity
                style={[styles.serviceCard, selectedService === "cleaning" && styles.serviceCardActive]}
                onPress={() => handleServicePress("cleaning")}
              >
                <View style={styles.serviceIconContainer}>
                  <Image
                    source={require("../../assets/profile/image 53.png")}
                    style={{ width: 25, height: 25 }}
                    resizeMode="contain"
                  />
                  <Text style={styles.serviceText}>Root Canal Treatment</Text>
                </View>
              </TouchableOpacity>

              {/* Service 3 */}
              <TouchableOpacity
                style={[styles.serviceCard, selectedService === "orthodontics" && styles.serviceCardActive]}
                onPress={() => handleServicePress("orthodontics")}
              >
                <View style={styles.serviceIconContainer}>
                  <Image
                    source={require("../../assets/profile/image 46.png")}
                    style={{ width: 25, height: 25 }}
                    resizeMode="contain"
                  />
                  <Text style={styles.serviceText}>Orthodontics</Text>
                </View>
              </TouchableOpacity>

              {/* Service 4 */}
              <TouchableOpacity
                style={[styles.serviceCard, selectedService === "cleaning2" && styles.serviceCardActive]}
                onPress={() => handleServicePress("cleaning2")}
              >
                <View style={styles.serviceIconContainer}>
                  <Image
                    source={require("../../assets/profile/image 54.png")}
                    style={{ width: 25, height: 25 }}
                    resizeMode="contain"
                  />
                  <Text style={styles.serviceText}>Cleaning</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Upcoming Appointment Section */}
          <View style={styles.appointmentSection}>
            <Text style={styles.sectionTitle}>Upcoming Appointment</Text>
            <TouchableOpacity style={styles.appointmentCard} onPress={handleAppointmentPress}>
              <View style={styles.appointmentContent}>
                <View style={styles.appointmentHeader}>
                  <View style={styles.doctorInfo}>
                    <Text style={styles.doctorName}>Dr. Jessica Fano</Text>
                    <Text style={styles.specialtyText}>Dentist</Text>
                  </View>
                </View>
                
                <View style={styles.appointmentDetails}>
                  <View style={styles.detailRow}>
                    <View style={styles.iconContainer}>
                      <Ionicons name="calendar-outline" size={18} color="#666" />
                    </View>
                    <Text style={styles.detailText}>Monday, Dec 23</Text>
                    <View style={styles.procedureInfo}>
                      <Text style={styles.procedureText}>Procedure</Text>
                    </View>
                  </View>
                  <View style={styles.detailRow}>
                    <View style={styles.iconContainer}>
                      <Ionicons name="time-outline" size={18} color="#666" />
                    </View>
                    <Text style={styles.detailText}>11:00 - 12:00 AM</Text>
                    <View style={styles.procedureInfo}>
                      <Text style={styles.procedureDetailText}>• Teeth Whitening</Text>
                    </View>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <Navbar navigation={navigation} activeTab="Home" />
      </SafeAreaView>
    </SafeAreaProvider>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1290D5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 25,
    paddingTop: 10,
    paddingBottom: 20,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    backgroundColor: "#fff",
    marginBottom: 0,
    marginTop: 60,
  },
  userText: {
    justifyContent: "center",
  },
  greeting: {
    color: "#fff",
    fontSize: 14,
    opacity: 0.9,
    marginBottom: 0,
    marginTop: 60,
  },
  userName: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    marginLeft: 15,
    padding: 5,
    marginBottom: 0,
    marginTop: 50,
  },
  content: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
  },
  mainCard: {
    backgroundColor: "#E8F4FD",
    marginHorizontal: 15,
    borderRadius: 20,
    padding: 20,
    marginBottom: 10,
    alignItems: "center",
    minHeight: 100,
  },
  cardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: -10,
    marginTop: -20,
    flex: 1,
  },
  doctorImageContainer: {
    flex: 1,
    alignItems: "flex-start",
    justifyContent: "flex-start",
    paddingTop: 0,
  },
  doctorImage: {
    width: 170,
    height: 180,
    marginBottom: 0,
    marginTop: 0,
    resizeMode: "cover",
  },
  bookButton: {
    backgroundColor: "#4A90E2",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    position: "absolute",
    right: 10,
    top: 75,
  },
  bookButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  servicesSection: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  servicesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  seeAllButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  seeAllText: {
    color: "#4A90E2",
    fontWeight: "600",
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
  },
  servicesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    gap: 5,
  },
  serviceCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    width: 75,
    height: 75,
    marginBottom: 5,
    shadowColor: "#bdb9b9ff",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  serviceCardActive: {
    borderWidth: 2,
    borderColor: "#4A90E2",
  },
  serviceIconContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  serviceText: {
    marginTop: 5,
    fontSize: 8,
    color: "#333",
    textAlign: "center",
    fontWeight: "700",
  },
  appointmentSection: {
    paddingHorizontal: 20,
    marginBottom: 100,
  },
  appointmentCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.0,
    shadowRadius: 4,
    elevation: 3,
    marginTop: 15,
  },
  appointmentContent: {
    flex: 1,
  },
  appointmentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 15,
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  specialtyText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "400",
  },
  procedureInfo: {
    alignItems: "flex-end",
  },
  procedureText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  appointmentDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 30,
    alignItems: "flex-start",
  },
  detailText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 5,
  },
})