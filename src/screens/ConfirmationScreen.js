import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ConfirmationScreen = ({ navigation, route }) => {
  // Get appointment details from navigation params
  const { appointmentDetails } = route.params || {};
  
  const {
    selectedDate = new Date(),
    selectedTime = '10:00 AM',
    selectedServices = ['Dental Consultation']
  } = appointmentDetails || {};

  // Calculate end time (assuming 1-hour appointments)
  const calculateEndTime = (startTime) => {
    const [time, period] = startTime.split(' ');
    const [hours, minutes] = time.split(':');
    let hour = parseInt(hours);
    
    if (period === 'PM' && hour !== 12) hour += 12;
    if (period === 'AM' && hour === 12) hour = 0;
    
    const endHour = hour + 1;
    const endTime12 = endHour > 12 ? `${endHour - 12}:${minutes}` : `${endHour}:${minutes}`;
    const endPeriod = endHour >= 12 ? 'PM' : 'AM';
    
    return `${endTime12} ${endPeriod}`;
  };

  const endTime = calculateEndTime(selectedTime);

  const handleReturnHome = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Profile' }],
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#E5E5E5" />
      
      <View style={styles.content}>
        <View style={styles.confirmationCard}>
          {/* Success Icon */}
          <View style={styles.successIcon}>
            <Ionicons name="checkmark" size={32} color="#FFFFFF" />
          </View>
          
          {/* Success Message */}
          <Text style={styles.successTitle}>Appointment booked Successfully!</Text>
          
          {/* Appointment Details */}
          <View style={styles.detailsContainer}>
            <Text style={styles.detailsText}>Appointment booked Dr. Jessica Fano</Text>
            <Text style={styles.detailsText}>
              on {selectedDate.toLocaleDateString('en-US', { 
                month: 'long', 
                day: 'numeric', 
                year: 'numeric' 
              })} {selectedTime} to {endTime}
            </Text>
          </View>
          
          {/* Return Home Button */}
          <TouchableOpacity onPress={handleReturnHome} style={styles.homeButton}>
            <Text style={styles.homeButtonText}>Return to Home</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E5E5E5',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  confirmationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    width: '90%',
    maxWidth: 350,
  },
  successIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#27B139',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000ff',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 32,
  },
  detailsContainer: {
    marginBottom: 40,
    alignItems: 'center',
  },
  detailsText: {
    fontSize: 16,
    color: '#000000ff',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 5,
  },
  homeButton: {
    paddingVertical: 4,
  },
  homeButtonText: {
    fontSize: 16,
    color: '#2563EB',
    fontWeight: '500',
  },
});

export default ConfirmationScreen;