import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Navbar from "../navigations/navbar"; // Assuming you have a Navbar component

export default function ViewAppointmentScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState("future"); // 'future' or 'past'

  const handleBackPress = () => {
    if (navigation) {
      navigation.goBack();
    } else {
      console.log("Navigate back");
    }
  };

  const handleFinishAppointment = () => {
    console.log("Finish appointment pressed");
    if (navigation) {
      // You can add logic here to mark the appointment as 'finished' before navigating
      navigation.navigate("FeedbackScreen");
    }
  };

  // Mock data for appointments
  const futureAppointments = [
    {
      id: "1",
      doctorName: "Dr. Jessica Fano",
      specialty: "Dentist",
      date: "Monday, Dec 23",
      time: "11:00 - 12:00 AM",
      procedure: "Teeth Whitening",
    },
 
  ];

  const pastAppointments = [
    {
      id: "6",
      doctorName: "Dr. Alex Garcia",
      specialty: "Orthodontist",
      date: "Wednesday, Nov 15  ",
      time: "09:30 - 10:30 AM",
      procedure: "Braces Adjustment",
    },
   
  ];

  const renderAppointments = (appointments) => {
    if (appointments.length === 0) {
      return <Text style={styles.noAppointmentsText}>No appointments to show.</Text>;
    }

    return appointments.map((appointment) => (
      <View key={appointment.id} style={styles.appointmentCard}>
        <View style={styles.appointmentContent}>
          <Text style={styles.doctorName}>{appointment.doctorName}</Text>
          <Text style={styles.specialtyText}>{appointment.specialty}</Text>
          <View style={styles.appointmentDetails}>
            <View style={styles.detailRow}>
              <View style={styles.iconContainer}>
                <Ionicons name="calendar-outline" size={18} color="#666" />
              </View>
              <Text style={styles.detailText}>{appointment.date}</Text>
              <Text style={[styles.detailText, { marginLeft: 'auto' }]}>Procedure/Service</Text>
            </View>
            <View style={styles.detailRow}>
              <View style={styles.iconContainer}>
                <Ionicons name="time-outline" size={18} color="#666" />
              </View>
              <Text style={styles.detailText}>{appointment.time}</Text>
              <Text style={[styles.detailText, { marginLeft: 'auto', fontWeight: 'bold' }]}>
                {appointment.procedure}
              </Text>
            </View>
          </View>
          {activeTab === 'future' && (
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.finishButton}
                onPress={handleFinishAppointment}
              >
                <Text style={styles.finishButtonText}>Finish</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    ));
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
            <Ionicons name="chevron-back-outline" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Your Appointments</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.content}>
          {/* Tab Navigation */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === "future" && styles.activeTabButton,
              ]}
              onPress={() => setActiveTab("future")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "future" && styles.activeTabText,
                ]}
              >
                Future Appointments
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === "past" && styles.activeTabButton,
              ]}
              onPress={() => setActiveTab("past")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "past" && styles.activeTabText,
                ]}
              >
                Past Appointments
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollView}>
            {activeTab === "future"
              ? renderAppointments(futureAppointments)
              : renderAppointments(pastAppointments)}
          </ScrollView>
        </View>
        <Navbar navigation={navigation} activeTab="Calendar" />
      </SafeAreaView>
    </SafeAreaProvider>
  );
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
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#fff",
  },
  placeholder: {
    width: 34,
  },
  content: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 20,
    marginBottom: 20,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 25,
    backgroundColor: "#e0e0e0",
    marginHorizontal: 5,
  },
  activeTabButton: {
    backgroundColor: "#1290D5",
  },
  tabText: {
    color: "#666",
    fontWeight: "600",
  },
  activeTabText: {
    color: "#fff",
  },
  scrollView: {
    paddingHorizontal: 15,
  },
  appointmentCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 20,
  },
  appointmentContent: {
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
  appointmentDetails: {
    marginTop: 15,
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
  buttonContainer: {
    alignItems: "flex-end",
    marginTop: 15,
  },
  finishButton: {
    backgroundColor: "#1290D5",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: "#4A90E2",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  finishButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  noAppointmentsText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#666",
  },
});
