"use client"

import { useState, useCallback, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Image, Dimensions, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useFocusEffect } from '@react-navigation/native';
import Navbar from "../navigations/navbar";
import { db, auth } from '../config/firebaseConfig';
import { collection, query, where, orderBy, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { uploadToCloudinary } from '../config/cloudinaryConfig';

const { width } = Dimensions.get("window");

export default function Profile({ navigation }) {
  const [selectedService, setSelectedService] = useState(null);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState({
    displayName: '',
    photoURL: null,
    isLoading: true
  });

  useFocusEffect(
    useCallback(() => {
      navigation.setOptions({
        headerShown: false,
      });
    }, [navigation])
  );

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(user => {
      setCurrentUser(user);
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!currentUser) {
      setUserProfile(prev => ({ ...prev, isLoading: false }));
      return;
    }

    const fetchUserProfile = async () => {
      try {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserProfile({
            displayName: userData.displayName || userData.name || currentUser.displayName || 'User',
            photoURL: userData.photoURL || userData.profilePicture || currentUser.photoURL,
            isLoading: false
          });
        } else {
          setUserProfile({
            displayName: currentUser.displayName || 'User',
            photoURL: currentUser.photoURL,
            isLoading: false
          });
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        setUserProfile({
          displayName: currentUser.displayName || 'User',
          photoURL: currentUser.photoURL,
          isLoading: false
        });
      }
    };

    fetchUserProfile();
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;

    const userDocRef = doc(db, 'users', currentUser.uid);
    const unsubscribeUser = onSnapshot(userDocRef, (doc) => {
      if (doc.exists()) {
        const userData = doc.data();
        setUserProfile(prev => ({
          ...prev,
          displayName: userData.displayName || userData.name || currentUser.displayName || 'User',
          photoURL: userData.photoURL || userData.profilePicture || currentUser.photoURL,
          isLoading: false
        }));
      }
    }, (error) => {
      console.error("Error listening to user profile changes:", error);
    });

    return () => unsubscribeUser();
  }, [currentUser]);

  useFocusEffect(
    useCallback(() => {
      if (currentUser) {
        const refreshUserProfile = async () => {
          try {
            const userDocRef = doc(db, 'users', currentUser.uid);
            const userDoc = await getDoc(userDocRef);
            
            if (userDoc.exists()) {
              const userData = userDoc.data();
              setUserProfile(prev => ({
                ...prev,
                displayName: userData.displayName || userData.name || currentUser.displayName || 'User',
                photoURL: userData.photoURL || userData.profilePicture || currentUser.photoURL,
              }));
            }
          } catch (error) {
            console.error("Error refreshing user profile:", error);
          }
        };

        refreshUserProfile();
      }
    }, [currentUser])
  );

  // FIXED: Updated appointments fetching logic to handle admin confirmation
  useEffect(() => {
    if (!currentUser) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const appointmentsRef = collection(db, 'appointments');
    
    // First, let's fetch all appointments for this user to debug
    const q = query(
      appointmentsRef,
      where('userId', '==', currentUser.uid)
      // Temporarily remove status and orderBy filters to see all appointments
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const appointments = [];
      const now = new Date();

      console.log("=== DEBUGGING APPOINTMENTS ===");
      console.log("Total appointments found:", querySnapshot.docs.length);

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        console.log("Appointment:", {
          id: doc.id,
          status: data.status,
          date: data.date,
          doctor: data.doctor,
          services: data.services,
          time: data.time
        });

        // Check for multiple possible status values that indicate confirmed appointments
        const confirmedStatuses = [
          'confirmed', 
          'approved', 
          'accepted', 
          'booked',
          'Confirmed', // Check for capitalized versions too
          'Approved',
          'Accepted',
          'Booked'
        ];

        if (data.date && confirmedStatuses.includes(data.status)) {
          const appointmentDate = new Date(data.date);
          
          // Only show future appointments or appointments from today
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          appointmentDate.setHours(0, 0, 0, 0);
          
          if (appointmentDate >= today) {
            const appointmentData = {
              id: doc.id,
              ...data,
              date: new Date(data.date), // Ensure it's a proper Date object
            };
            appointments.push(appointmentData);
            console.log("Added to upcoming:", appointmentData);
          } else {
            console.log("Appointment is in the past:", appointmentDate);
          }
        } else {
          console.log("Appointment not confirmed or missing date:", {
            status: data.status,
            hasDate: !!data.date
          });
        }
      });

      // Sort by appointment date (ascending - nearest first)
      appointments.sort((a, b) => a.date - b.date);
      
      console.log("Final upcoming appointments:", appointments.length);
      console.log("=== END DEBUGGING ===");
      
      setUpcomingAppointments(appointments);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching appointments:", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

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

  const handleBookNow = () => {
    navigation.navigate("AppointmentScreen");
  };

  const handleServicePress = (serviceId) => {
    setSelectedService(serviceId);
  };

  const handleSeeAllPress = () => {
    navigation.navigate("ServicesScreen");
  };

  const handleNotificationPress = () => {
    navigation.navigate("NotificationScreen");
  };

  const handleViewAppointment = () => {
    navigation.navigate("ViewAppointmentScreen");
  };

  const renderUpcomingAppointment = () => {
    if (isLoading) {
      return <ActivityIndicator size="large" color="#4A90E2" style={styles.loadingIndicator} />;
    }

    if (upcomingAppointments.length === 0) {
      return (
        <View style={styles.noAppointmentsContainer}>
          <Text style={styles.noAppointmentsText}>You have no upcoming appointments.</Text>
        </View>
      );
    }
   
    const appointment = upcomingAppointments[0];
    const appointmentDate = appointment.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

    return (
      <View style={styles.appointmentCard}>
        <View style={styles.appointmentContent}>
          <View style={styles.appointmentHeader}>
            <View style={styles.doctorInfo}>
              <Text style={styles.doctorName}>{appointment.doctor}</Text>
              <Text style={styles.specialtyText}>Dentist</Text>
            </View>
            <View style={styles.procedureInfo}>
              <Text style={styles.procedureText}>Procedure</Text>
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
              <Text style={styles.detailText}>{appointmentDate}</Text>
            </View>
            <View style={styles.detailRow}>
              <View style={styles.iconContainer}>
                <Ionicons name="time-outline" size={18} color="#666" />
              </View>
              <Text style={styles.detailText}>{appointment.time} - {getEndTime(appointment.time)}</Text>
            </View>
          </View>
          <View style={styles.finishButtonContainer}>
            <TouchableOpacity style={styles.viewButton} onPress={handleViewAppointment}>
              <Text style={styles.viewButtonText}>View</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.userInfo}>
            {userProfile.photoURL ? (
              <Image 
                source={{ uri: userProfile.photoURL }} 
                style={styles.profileImage}
              />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <Ionicons name="person" size={30} color="#fff" />
              </View>
            )}
            <View style={styles.userText}>
              <Text style={styles.greeting}>Hello</Text>
              <Text style={styles.userName}>
                {userProfile.isLoading ? 'Loading...' : userProfile.displayName}
              </Text>
            </View>
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.iconButton}>
              
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={handleNotificationPress}>
              <Ionicons name="notifications-outline" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          bounces={true}
          scrollEventThrottle={16}
        >
          {/* Main Card */}
          <View style={styles.mainCard}>
            <View style={styles.cardContent}>
              <View style={styles.doctorImageContainer}>
                <Image source={require("../../assets/profile/doctor.png")} style={styles.doctorImage} />
              </View>
              <View style={styles.bookingSection}>
                <View style={styles.bookingTextContainer}>
                  <Text style={styles.bookingTitle}>Dental Care You Can Trust</Text>
                  <Text style={styles.bookingSubtitle}>Instant services and visible results all in one visit.</Text>
                </View>
                <TouchableOpacity style={styles.bookButton} onPress={handleBookNow}>
                  <Text style={styles.bookButtonText}>Book Now</Text>
                </TouchableOpacity>
              </View>
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

          {/* Upcoming Appointment Section - Now dynamic */}
          <View style={styles.appointmentSection}>
            <Text style={styles.sectionTitle}>Upcoming Appointment</Text>
            {renderUpcomingAppointment()}
          </View>
        </ScrollView>

        <Navbar navigation={navigation} activeTab="Home" />
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
    paddingHorizontal: 25,
    paddingTop: 20,
    paddingBottom: 20,
    height: 125,
    backgroundColor: "#1290D5",
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
  },
  profileImagePlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    backgroundColor: "rgba(255,255,255,0.3)",
    justifyContent: 'center',
    alignItems: 'center',
  },
  userText: {
    justifyContent: "center",
  },
  greeting: {
    color: "#fff",
    fontSize: 14,
    opacity: 0.9,
    marginBottom: 0,
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
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -18,
  },
  scrollContent: {
    paddingTop: 20,
    paddingBottom: 20,
  },
  mainCard: {
    backgroundColor: "#E8F4FD",
    marginHorizontal: 15,
    borderRadius: 20,
    padding: 20,
    marginBottom: 10,
    alignItems: "center",
    minHeight: 180,
  },
  cardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    flex: 1,
  },
  doctorImageContainer: {
    flex: 1,
    alignItems: "flex-start",
    justifyContent: "center",
    paddingLeft: 0,
    marginLeft: -10,
  },
  doctorImage: {
    width: 230,
    height: 190,
    resizeMode: "contain",
    marginLeft: -50,
    marginBottom: -10,
    marginTop: -20,
  },
  bookingSection: {
    flex: 1,
    alignItems: "flex-start",
    justifyContent: "center",
    paddingLeft: 0,
    marginLeft: 10,
  },
  bookingTextContainer: {
    alignItems: "flex-start",
    marginBottom: 15,
    maxWidth: 180,
  },
  bookingTitle: {
    marginLeft: -57,
    fontSize: 20,
    fontWeight: "700",
    color: "#000000ff",
    textAlign: "center",
    marginBottom: 8,
  },
  bookingSubtitle: {
    fontSize: 12,
    marginLeft: -50,
    fontWeight: "400",
    color: "#000000ff",
    textAlign: "center",
    marginBottom: 5,
    lineHeight: 16,
  },
  bookingDescription: {
    fontSize: 12,
    color: "#666",
    textAlign: "left",
    lineHeight: 16,
    maxWidth: 120,
  },
  bookButton: {
    backgroundColor: "#4A90E2",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: "#4A90E2",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
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
    color: "#4A90E2",
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
  finishButtonContainer: {
    alignItems: "flex-end",
    marginTop: 15,
  },
  viewButton: {
    backgroundColor: "#4A90E2",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: "#4A90E2",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  viewButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  loadingIndicator: {
    marginTop: 20,
  },
  noAppointmentsContainer: {
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
    alignItems: 'center',
  },
  noAppointmentsText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
});