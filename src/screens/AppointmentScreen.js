import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Modal,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Navbar from '../navigations/navbar';
// Import Firebase functions
import { db, auth } from '../config/firebaseConfig'; // Correct path to your config folder
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const AppointmentScreen = ({ navigation }) => {
  // Use today's date for a live calendar
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date());

  // State for selected appointment details
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedServices, setSelectedServices] = useState([]);

  // State for expanded views
  const [isCalendarExpanded, setIsCalendarExpanded] = useState(false);
  const [isTimeExpanded, setIsTimeExpanded] = useState(false);

  // State for confirmation modal and loading
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Available time slots (12-hour format)
  const timeSlots = [
    '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM',
    '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM'
  ];

  // Available services
  const services = [
    'Dental Consultation',
    'Oral Prophylaxis (Cleaning)',
    'Dental Filling (Pasta)',
    'Flouride Varnish',
    'Pit and Fissure Sealant',
    'Root Canal Treatment',
    'Tooth Extraction /Odontectomy',
    'Orthodontic Braces',
    'Teeth Whitening',
    'Gingivectomy',
    'Frenectomy',
    'Dentures',
    'Dental Crown'
  ];

  // Function to save appointment to Firebase
  const saveAppointmentToFirebase = async (appointmentData) => {
    try {
      const appointmentsCollection = collection(db, 'appointments');
      const docRef = await addDoc(appointmentsCollection, appointmentData);
      console.log('Appointment saved with ID: ', docRef.id);
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('Error saving appointment: ', error);
      return { success: false, error: error.message };
    }
  };

  // Function to check if a given date is in the past (ignoring time)
  const isPastDate = (date) => {
    const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const dateToCheck = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    return dateToCheck < todayDateOnly;
  };

  // Check if a time slot is in the past for the selected date
  const isPastTimeSlot = (timeSlot) => {
    if (selectedDate?.toDateString() !== today.toDateString()) {
      return false;
    }

    const [time, period] = timeSlot.split(' ');
    const [hours, minutes] = time.split(':');
    let hour = parseInt(hours, 10);
    const minute = parseInt(minutes, 10);

    if (period === 'PM' && hour !== 12) {
      hour += 12;
    }
    if (period === 'AM' && hour === 12) {
      hour = 0;
    }

    const timeSlotDate = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
      hour,
      minute
    );

    return timeSlotDate < today;
  };

  // Function to get the number of days in a month
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Function to get the first day of the month
  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    const days = [];
    const adjustedFirstDay = (firstDay === 0) ? 6 : firstDay - 1;

    for (let i = 0; i < adjustedFirstDay; i++) {
      days.push(null);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  // Generate current week days
  const generateCurrentWeekDays = () => {
    const startOfWeek = new Date(selectedDate || today);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);

    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      weekDays.push(date);
    }
    return weekDays;
  };

  // Handle month navigation
  const goToPreviousMonth = () => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };

  const goToNextMonth = () => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };

  // Handle selections
  const handleDateClick = (date) => {
    if (!isPastDate(date)) {
      setSelectedDate(date);
    }
  };

  const handleTimeClick = (time) => {
    setSelectedTime(time);
  };

  const handleServiceClick = (service) => {
    setSelectedServices(prev => {
      if (prev.includes(service)) {
        return prev.filter(s => s !== service);
      } else {
        return [...prev, service];
      }
    });
  };

  // Handle confirmation with Firebase integration
  const handleConfirm = async () => {
    // Check if all required fields are selected
    if (!selectedDate || !selectedTime || selectedServices.length === 0) {
      Alert.alert(
        'Incomplete Information',
        'Please select a date, time, and at least one service to confirm your appointment.',
        [{ text: 'OK' }]
      );
      return;
    }

    setIsLoading(true);

    try {
      // Get current user
      const currentUser = auth.currentUser;
      if (!currentUser) {
        Alert.alert(
          'Authentication Required',
          'Please log in to book an appointment.',
          [{ text: 'OK' }]
        );
        setIsLoading(false);
        return;
      }

      // Create appointment data
      const appointmentData = {
        userId: currentUser.uid,
        userEmail: currentUser.email,
        date: selectedDate.toISOString(),
        time: selectedTime,
        services: selectedServices,
        doctor: 'Dr. Jessica Fano',
        status: 'confirmed',
        createdAt: serverTimestamp(),
        // Add formatted date for easier querying
        appointmentDate: selectedDate.toLocaleDateString('en-US'),
        // Add end time
        endTime: getEndTime(selectedTime)
      };

      // Save to Firebase
      const result = await saveAppointmentToFirebase(appointmentData);
      
      if (result.success) {
        setShowConfirmationModal(true);
      } else {
        Alert.alert(
          'Booking Failed',
          'There was an error booking your appointment. Please try again.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error in handleConfirm:', error);
      Alert.alert(
        'Booking Failed',
        'There was an error booking your appointment. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle return to home
  const handleReturnToHome = () => {
    setShowConfirmationModal(false);
    // Reset form
    setSelectedDate(null);
    setSelectedTime(null);
    setSelectedServices([]);
    navigation.navigate('Profile');
  };

  // Format date for display
  const formatDateForModal = (date) => {
    if (!date) return 'N/A';
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    return date.toLocaleDateString('en-US', options);
  };

  // Get end time (assuming 1-hour appointments)
  const getEndTime = (startTime) => {
    if (!startTime) return 'N/A';
    const [time, period] = startTime.split(' ');
    const [hours, minutes] = time.split(':');
    let hour = parseInt(hours);

    if (period === 'PM' && hour !== 12) hour += 12;
    if (period === 'AM' && hour === 12) hour = 0;

    hour += 1; // Add 1 hour

    const endMinutes = minutes.padStart(2, '0');
    if (hour === 0) return `12:${endMinutes} AM`;
    if (hour === 12) return `12:${endMinutes} PM`;
    if (hour > 12) return `${hour - 12}:${endMinutes} PM`;
    return `${hour}:${endMinutes} AM`;
  };

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
 
  // Check if the confirm button should be enabled
  const isConfirmButtonEnabled = selectedDate && selectedTime && selectedServices.length > 0 && !isLoading;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Book Appointment</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Calendar Section */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => setIsCalendarExpanded(!isCalendarExpanded)}
          >
            <Text style={styles.sectionTitle}>
              {selectedDate ? selectedDate.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              }) : 'Select Date'}
            </Text>
            <Ionicons
              name={isCalendarExpanded ? "chevron-up" : "chevron-down"}
              size={20}
              color="#6B7280"
            />
          </TouchableOpacity>

          {isCalendarExpanded ? (
            <>
              {/* Month Navigator */}
              <View style={styles.monthNavigator}>
                <TouchableOpacity onPress={goToPreviousMonth} style={styles.monthButton}>
                  <Ionicons name="chevron-back" size={20} color="#6B7280" />
                </TouchableOpacity>
                <Text style={styles.monthTitle}>
                  {currentDate.toLocaleString('en-US', { month: 'long', year: 'numeric' })}
                </Text>
                <TouchableOpacity onPress={goToNextMonth} style={styles.monthButton}>
                  <Ionicons name="chevron-forward" size={20} color="#6B7280" />
                </TouchableOpacity>
              </View>

              {/* Weekday Headers */}
              <View style={styles.weekdayHeaders}>
                {daysOfWeek.map(day => (
                  <View key={day} style={styles.weekdayHeader}>
                    <Text style={styles.weekdayText}>{day}</Text>
                  </View>
                ))}
              </View>

              {/* Calendar Grid */}
              <View style={styles.calendarGrid}>
                {generateCalendarDays().map((day, index) => (
                  <View key={index} style={styles.dayContainer}>
                    {day ? (
                      <TouchableOpacity
                        onPress={() => {
                          handleDateClick(day);
                          setIsCalendarExpanded(false);
                        }}
                        disabled={isPastDate(day)}
                        style={[
                          styles.dayButton,
                          selectedDate?.toDateString() === day.toDateString() && styles.selectedDay,
                          today.toDateString() === day.toDateString() &&
                          selectedDate?.toDateString() !== day.toDateString() && styles.todayDay,
                          isPastDate(day) && styles.disabledDay,
                        ]}
                      >
                        <Text style={[
                          styles.dayText,
                          selectedDate?.toDateString() === day.toDateString() && styles.selectedDayText,
                          isPastDate(day) && styles.disabledDayText,
                          day.getMonth() !== currentDate.getMonth() && styles.otherMonthDay
                        ]}>
                          {day.getDate()}
                        </Text>
                      </TouchableOpacity>
                    ) : (
                      <View style={styles.emptyDay} />
                    )}
                  </View>
                ))}
              </View>
            </>
          ) : (
            /* Week View */
            <View style={styles.weekView}>
              <View style={styles.weekDaysContainer}>
                {generateCurrentWeekDays().map((day, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleDateClick(day)}
                    disabled={isPastDate(day)}
                    style={[
                      styles.weekDayButton,
                      selectedDate?.toDateString() === day.toDateString() && styles.selectedWeekDay,
                      isPastDate(day) && styles.disabledDay
                    ]}
                  >
                    <Text style={[
                      styles.weekDayLabel,
                      selectedDate?.toDateString() === day.toDateString() && styles.selectedWeekDayLabel,
                      isPastDate(day) && styles.disabledDayText
                    ]}>
                      {daysOfWeek[index]}
                    </Text>
                    <Text style={[
                      styles.weekDayNumber,
                      selectedDate?.toDateString() === day.toDateString() && styles.selectedWeekDayNumber,
                      isPastDate(day) && styles.disabledDayText
                    ]}>
                      {day.getDate()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Select Time Section */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => setIsTimeExpanded(!isTimeExpanded)}
          >
            <Text style={styles.sectionTitle}>Select Time {selectedTime ? `- ${selectedTime}` : ''}</Text>
            <Ionicons
              name={isTimeExpanded ? "chevron-up" : "chevron-down"}
              size={20}
              color="#6B7280"
            />
          </TouchableOpacity>

          {isTimeExpanded ? (
            <View style={styles.timeGrid}>
              {timeSlots.map(time => (
                <TouchableOpacity
                  key={time}
                  onPress={() => {
                    handleTimeClick(time);
                    setIsTimeExpanded(false);
                  }}
                  disabled={isPastTimeSlot(time)}
                  style={[
                    styles.timeSlot,
                    selectedTime === time && styles.selectedTimeSlot,
                    isPastTimeSlot(time) && styles.disabledTimeSlot,
                  ]}
                >
                  <Text style={[
                    styles.timeSlotText,
                    selectedTime === time && styles.selectedTimeSlotText,
                    isPastTimeSlot(time) && styles.disabledTimeSlotText,
                  ]}>
                    {time}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.timeRowView}>
              <View style={styles.timeRow}>
                {timeSlots.slice(0, 4).map(time => (
                  <TouchableOpacity
                    key={time}
                    onPress={() => handleTimeClick(time)}
                    disabled={isPastTimeSlot(time)}
                    style={[
                      styles.timeSlotPreview,
                      selectedTime === time && styles.selectedTimeSlotPreview,
                      isPastTimeSlot(time) && styles.disabledTimeSlot,
                    ]}
                  >
                    <Text style={[
                      styles.timeSlotPreviewText,
                      selectedTime === time && styles.selectedTimeSlotPreviewText,
                      isPastTimeSlot(time) && styles.disabledTimeSlotText,
                    ]}>
                      {time}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Choose Services Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choose Services</Text>
          <View style={styles.servicesGrid}>
            {services.map((service) => (
              <TouchableOpacity
                key={service}
                onPress={() => handleServiceClick(service)}
                style={[
                  styles.serviceButton,
                  selectedServices.includes(service) && styles.selectedServiceButton
                ]}
              >
                <Text style={[
                  styles.serviceButtonText,
                  selectedServices.includes(service) && styles.selectedServiceButtonText
                ]}>
                  {service}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Add some bottom padding for the confirm button */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Confirm Button */}
      <View style={styles.confirmContainer}>
        <TouchableOpacity
          onPress={handleConfirm}
          disabled={!isConfirmButtonEnabled}
          style={[
            styles.confirmButton,
            !isConfirmButtonEnabled && styles.disabledConfirmButton
          ]}
        >
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.confirmButtonText}>Booking...</Text>
            </View>
          ) : (
            <Text style={styles.confirmButtonText}>Confirm</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Confirmation Modal */}
      <Modal
        visible={showConfirmationModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowConfirmationModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Success Icon */}
            <View style={styles.successIcon}>
              <Ionicons name="checkmark" size={32} color="#FFFFFF" />
            </View>

            {/* Success Message */}
            <Text style={styles.successTitle}>Appointment booked Successfully!</Text>

            {/* Appointment Details */}
            <Text style={styles.appointmentDetails}>
              Appointment booked <Text style={styles.doctorName}>Dr. Jessica Fano</Text>
            </Text>
            <Text style={styles.appointmentDetails}>
              on {formatDateForModal(selectedDate)} {selectedTime} to {getEndTime(selectedTime)}
            </Text>

            {/* Return to Home Button */}
            <TouchableOpacity
              onPress={handleReturnToHome}
              style={styles.returnButton}
            >
              <Text style={styles.returnButtonText}>Return to <Text style={styles.homeLink}>Home</Text></Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Bottom Navigation */}
      <Navbar navigation={navigation} activeTab="Appointment" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  section: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  monthNavigator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  monthButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F9FAFB',
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  weekdayHeaders: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekdayHeader: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  weekdayText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayContainer: {
    width: '14.28%',
    aspectRatio: 1,
    padding: 2,
  },
  dayButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  selectedDay: {
    backgroundColor: '#2563EB',
  },
  todayDay: {
    borderWidth: 2,
    borderColor: '#60A5FA',
  },
  disabledDay: {
    opacity: 0.4,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  disabledDayText: {
    color: '#9CA3AF',
  },
  selectedDayText: {
    color: '#FFFFFF',
  },
  otherMonthDay: {
    color: '#9CA3AF',
  },
  emptyDay: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  // Week view styles
  weekView: {
    marginTop: 8,
  },
  weekDaysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  weekDayButton: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    minWidth: 40,
  },
  selectedWeekDay: {
    backgroundColor: '#2563EB',
  },
  weekDayLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 4,
  },
  selectedWeekDayLabel: {
    color: '#FFFFFF',
  },
  weekDayNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  selectedWeekDayNumber: {
    color: '#FFFFFF',
  },
  // Time row preview styles
  timeRowView: {
    marginTop: 8,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeSlotPreview: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  selectedTimeSlotPreview: {
    backgroundColor: '#2563EB',
  },
  timeSlotPreviewText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
  },
  selectedTimeSlotPreviewText: {
    color: '#FFFFFF',
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeSlot: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    minWidth: 70,
    alignItems: 'center',
    marginRight: 8,
    marginBottom: 8,
  },
  selectedTimeSlot: {
    backgroundColor: '#2563EB',
  },
  timeSlotText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  selectedTimeSlotText: {
    color: '#FFFFFF',
  },
  disabledTimeSlot: {
    opacity: 0.4,
    backgroundColor: '#E5E7EB',
  },
  disabledTimeSlotText: {
    color: '#9CA3AF',
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  serviceButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#DBEAFE',
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedServiceButton: {
    backgroundColor: '#2563EB',
  },
  serviceButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1E40AF',
    textAlign: 'left',
  },
  selectedServiceButtonText: {
    color: '#FFFFFF',
  },
  confirmContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  confirmButton: {
    backgroundColor: '#16A34A',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  disabledConfirmButton: {
    backgroundColor: '#9CA3AF',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    maxWidth: 360,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  successIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 16,
  },
  appointmentDetails: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  doctorName: {
    fontWeight: '600',
    color: '#111827',
  },
  returnButton: {
    marginTop: 32,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  returnButtonText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  homeLink: {
    color: '#2563EB',
    fontWeight: '600',
  },
});

export default AppointmentScreen;