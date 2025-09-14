import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Image, ActivityIndicator, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Navbar from "../navigations/navbar";

// Firebase imports
import { db, auth } from '../config/firebaseConfig';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';

export default function ViewAppointmentScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState("future");
  const [futureAppointments, setFutureAppointments] = useState([]);
  const [pastAppointments, setPastAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  // Auth state listener
  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(user => {
      setCurrentUser(user);
    });
    return () => unsubscribeAuth();
  }, []);

  // Fetch appointments from Firebase
  useEffect(() => {
    if (!currentUser) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const appointmentsRef = collection(db, 'appointments');
    const q = query(
      appointmentsRef,
      where('userId', '==', currentUser.uid),
      orderBy('createdAt', 'desc') // Sorts by booking creation date, newest first
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const future = [];
      const past = [];
      const now = new Date();

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.date) {
          const appointmentDate = new Date(data.date);
          const appointmentData = {
            id: doc.id,
            ...data,
            date: appointmentDate,
          };

          // Updated Logic: 
          // Past appointments: status is 'finished'
          // Future appointments: status is 'approved' (confirmed by admin) or 'pending' (waiting for admin approval)
          if (data.status === 'finished') {
            past.push(appointmentData);
          } else if (data.status === 'approved' || data.status === 'pending') {
            future.push(appointmentData);
          }
          // Note: 'declined' appointments are excluded from both lists
        }
      });

      // Sort future appointments by date (ascending - oldest first)
      future.sort((a, b) => a.date - b.date);

      // Sort past appointments by finishedAt date (descending - most recent first)
      past.sort((a, b) => new Date(b.finishedAt) - new Date(a.finishedAt));

      setFutureAppointments(future);
      setPastAppointments(past);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching appointments:", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleBackPress = () => {
    if (navigation) {
      navigation.goBack();
    } else {
      console.log("Navigate back");
    }
  };

  // Function to handle finishing the appointment without navigation
  const handleFinishOnly = async (appointmentId) => {
    try {
      const appointmentRef = doc(db, 'appointments', appointmentId);
      await updateDoc(appointmentRef, {
        status: 'finished',
        finishedAt: new Date().toISOString()
      });
      console.log("Appointment marked as finished without feedback.");
    } catch (error) {
      console.error("Error finishing appointment:", error);
    }
  };

  // Function to handle finishing the appointment and navigating
  const handleFinishAndNavigate = async (appointmentId) => {
    try {
      const appointmentRef = doc(db, 'appointments', appointmentId);
      await updateDoc(appointmentRef, {
        status: 'finished',
        finishedAt: new Date().toISOString()
      });
      console.log("Appointment marked as finished, navigating to feedback screen.");
      if (navigation) {
        navigation.navigate("FeedbackScreen", { appointmentId });
      }
    } catch (error) {
      console.error("Error finishing appointment:", error);
    }
  };

  // Function to show the confirmation pop-up
  const confirmFinish = (appointmentId) => {
    Alert.alert(
      "Confirm Finish",
      "Do you want to provide feedback?",
      [
        {
          text: "No",
          onPress: () => handleFinishOnly(appointmentId),
          style: "cancel",
        },
        {
          text: "Yes",
          onPress: () => handleFinishAndNavigate(appointmentId),
        },
      ],
      { cancelable: false }
    );
  };

  // Helper function to format date
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric'
    });
  };

  // Helper function to calculate end time
  const getEndTime = (startTime) => {
    if (!startTime) return 'N/A';
    const [time, period] = startTime.split(' ');
    const [hours, minutes] = time.split(':');
    let hour = parseInt(hours);

    if (period === 'PM' && hour !== 12) hour += 12;
    if (period === 'AM' && hour === 12) hour = 0;

    hour += 1;
    const endMinutes = minutes.padStart(2, '0');
    if (hour === 0) return `12:${endMinutes} AM`;
    if (hour === 12) return `12:${endMinutes} PM`;
    if (hour > 12) return `${hour - 12}:${endMinutes} PM`;
    return `${hour}:${endMinutes} AM`;
  };

  const renderAppointments = (appointments) => {
    if (isLoading) {
      return <ActivityIndicator size="large" color="#1290D5" style={styles.loadingIndicator} />;
    }

    if (appointments.length === 0) {
      return (
        <View style={styles.noAppointmentsContainer}>
          <Text style={styles.noAppointmentsText}>
            {activeTab === 'future' ? 'No upcoming appointments.' : 'No past appointments.'}
          </Text>
        </View>
      );
    }

    return appointments.map((appointment) => {
      // Format services list
      const servicesList = appointment.services ? appointment.services.join(', ') : 'General Consultation';
      
      // Get the current date and time
      const now = new Date();
      
      // Parse the appointment time and set it to the appointment date
      const [time, period] = appointment.time.split(' ');
      let [hours, minutes] = time.split(':');
      hours = parseInt(hours);
      minutes = parseInt(minutes);

      if (period === 'PM' && hours !== 12) {
          hours += 12;
      } else if (period === 'AM' && hours === 12) {
          hours = 0;
      }
      
      const appointmentDateTime = new Date(appointment.date);
      appointmentDateTime.setHours(hours, minutes, 0, 0);

      // Check if the current time is after the appointment's scheduled time
      const isAppointmentInThePast = now > appointmentDateTime;

      return (
        <View key={appointment.id} style={styles.appointmentCard}>
          <View style={styles.appointmentContent}>
            <View style={styles.appointmentHeader}>
              <View style={styles.doctorInfo}>
                <Text style={styles.doctorName}>{appointment.doctor || 'Dr. Not Assigned'}</Text>
                <Text style={styles.specialtyText}>Dentist</Text>
              </View>
              <View style={styles.procedureInfo}>
                <Text style={styles.procedureText}>Procedure/Service</Text>
                <View style={styles.servicesContainer}>
                  {appointment.services && appointment.services.map((service, index) => (
                    <View key={index} style={styles.serviceTag}>
                      <Text style={styles.serviceTagText}>{service}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>

            <View style={styles.appointmentDetails}>
              <View style={styles.detailRow}>
                <View style={styles.iconContainer}>
                  <Ionicons name="calendar-outline" size={18} color="#666" />
                </View>
                <Text style={styles.detailText}>{formatDate(appointment.date)}</Text>
              </View>
              <View style={styles.detailRow}>
                <View style={styles.iconContainer}>
                  <Ionicons name="time-outline" size={18} color="#666" />
                </View>
                <Text style={styles.detailText}>
                  {appointment.time} - {getEndTime(appointment.time)}
                </Text>
              </View>
            </View>

            {activeTab === 'future' && (
              <View style={styles.buttonContainer}>
                {appointment.status === 'pending' ? (
                  <View style={styles.pendingBadge}>
                    <Text style={styles.pendingText}>Waiting for Approval</Text>
                  </View>
                ) : appointment.status === 'approved' ? (
                  <TouchableOpacity
                    style={[styles.finishButton, !isAppointmentInThePast && styles.disabledButton]}
                    onPress={() => confirmFinish(appointment.id)}
                    disabled={!isAppointmentInThePast}
                  >
                    <Text style={styles.finishButtonText}>Finish</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            )}

            {activeTab === 'past' && (
              <View style={styles.statusContainer}>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>
                    {appointment.status === 'finished' ? 'Completed' : 'Finished'}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>
      );
    });
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

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollViewContent}
            showsVerticalScrollIndicator={false}
          >
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
    paddingTop: 20,
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
  scrollViewContent: {
    paddingBottom: 120,
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
    flex: 1,
  },
  procedureText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
    marginBottom: 8,
  },
  servicesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-end",
    alignItems: "center",
    maxWidth: 180,
    gap: 4,
  },
  serviceTag: {
    backgroundColor: "#E8F4FD",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 2,
  },
  serviceTagText: {
    fontSize: 10,
    color: "#1290D5",
    fontWeight: "600",
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
  disabledButton: {
    backgroundColor: "#a0a0a0",
  },
  statusContainer: {
    alignItems: "flex-end",
    marginTop: 15,
  },
  statusBadge: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  statusText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 12,
  },
  pendingBadge: {
    backgroundColor: "#FFC107", // Yellow/orange for pending approval
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  pendingText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 12,
  },
  loadingIndicator: {
    marginTop: 50,
  },
  noAppointmentsContainer: {
    alignItems: 'center',
    marginTop: 50,
    paddingHorizontal: 20,
  },
  noAppointmentsText: {
    textAlign: "center",
    fontSize: 16,
    color: "#666",
  },
});