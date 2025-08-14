"use client"

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
            {/* Page indicators */}
            <View style={styles.pageIndicators}>
              <View style={[styles.indicator, styles.activeIndicator]} />
              <View style={styles.indicator} />
              <View style={styles.indicator} />
            </View>
          </View>

          {/* Services Section */}
          <View style={styles.servicesSection}>
            <Text style={styles.sectionTitle}>Services</Text>
            <View style={styles.servicesGrid}>
              <TouchableOpacity
                style={[styles.serviceCard, selectedService === "dental" && styles.serviceCardActive]}
                onPress={() => handleServicePress("dental")}
              >
                <View style={styles.serviceIconContainer}>
                  <Text style={styles.toothIcon}>🦷</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.serviceCard, selectedService === "cleaning" && styles.serviceCardActive]}
                onPress={() => handleServicePress("cleaning")}
              >
                <View style={styles.serviceIconContainer}>
                  <Text style={styles.toothIcon}>🦷</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Upcoming Appointment Section */}
          <View style={styles.appointmentSection}>
            <Text style={styles.sectionTitle}>Upcoming Appointment</Text>
            <TouchableOpacity style={styles.appointmentCard} onPress={handleAppointmentPress}>
              <Text style={styles.doctorName}>Dr. Jessica Fano</Text>
              <View style={styles.appointmentIcons}>
                <View style={styles.iconRow}>
                  <Ionicons name="calendar-outline" size={20} color="#666" />
                </View>
                <View style={styles.iconRow}>
                  <Ionicons name="time-outline" size={20} color="#666" />
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
    backgroundColor: "#4A90E2",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
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
    marginBottom: 50,
  },
  userText: {
    justifyContent: "center",
  },
  greeting: {
    color: "#fff",
    fontSize: 14,
    opacity: 0.9,
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
  },
  content: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
  },
  mainCard: {
    backgroundColor: "#E8F4FD",
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 20,
    marginBottom: 25,
    alignItems: "center",
    minHeight: 200,
  },
  cardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 20,
    flex: 1,
  },
  doctorImageContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  doctorImage: {
    width: 140,
    height: 180,
    resizeMode: "contain",
  },
  bookButton: {
    backgroundColor: "#4A90E2",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    position: "absolute",
    right: 20,
    top: 60,
  },
  bookButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  pageIndicators: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ccc",
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: "#4A90E2",
  },
  servicesSection: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginBottom: 15,
  },
  servicesGrid: {
    flexDirection: "row",
    justifyContent: "flex-start",
    gap: 15,
  },
  serviceCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    width: 80,
    height: 80,
    shadowColor: "#000",
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
  toothIcon: {
    fontSize: 32,
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
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  doctorName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    flex: 1,
  },
  appointmentIcons: {
    flexDirection: "column",
    gap: 8,
  },
  iconRow: {
    alignItems: "center",
  },
})
