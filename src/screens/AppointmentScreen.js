import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Alert,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Navbar from '../navigations/navbar';

const AppointmentScreen = ({ navigation }) => {
  // Current date for calendar display
  const [currentDate, setCurrentDate] = useState(new Date(2025, 6, 10)); // July 2025
  
  // State for selected appointment details
  const [selectedDate, setSelectedDate] = useState(new Date(2025, 6, 10));
  const [selectedTime, setSelectedTime] = useState('10:00 AM');
  const [selectedServices, setSelectedServices] = useState(['Dental Consultation']);
  
  // State for expanded views
  const [isCalendarExpanded, setIsCalendarExpanded] = useState(false);
  const [isTimeExpanded, setIsTimeExpanded] = useState(false);

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
    const today = selectedDate;
    const startOfWeek = new Date(today);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is Sunday
    startOfWeek.setDate(diff);

    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      weekDays.push(date);
    }
    return weekDays;
  };

  const calendarDays = generateCalendarDays();

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
    setSelectedDate(date);
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

  // Handle confirmation
  const handleConfirm = () => {
    const appointmentDetails = {
      selectedDate,
      selectedTime,
      selectedServices
    };
    
    navigation.navigate('ConfirmationScreen', { appointmentDetails });
  };

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

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
              {selectedDate.toLocaleDateString('en-US', { 
                weekday: 'short', 
                month: 'long', 
                day: 'numeric',
                year: 'numeric'
              })}
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
                        style={[
                          styles.dayButton,
                          day.toDateString() === selectedDate.toDateString() && styles.selectedDay,
                          new Date().toDateString() === day.toDateString() && 
                          day.toDateString() !== selectedDate.toDateString() && styles.todayDay
                        ]}
                      >
                        <Text style={[
                          styles.dayText,
                          day.toDateString() === selectedDate.toDateString() && styles.selectedDayText,
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
                    style={[
                      styles.weekDayButton,
                      day.toDateString() === selectedDate.toDateString() && styles.selectedWeekDay
                    ]}
                  >
                    <Text style={[
                      styles.weekDayLabel,
                      day.toDateString() === selectedDate.toDateString() && styles.selectedWeekDayLabel
                    ]}>
                      {daysOfWeek[index]}
                    </Text>
                    <Text style={[
                      styles.weekDayNumber,
                      day.toDateString() === selectedDate.toDateString() && styles.selectedWeekDayNumber
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
            <Text style={styles.sectionTitle}>Select Time - {selectedTime}</Text>
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
                  style={[
                    styles.timeSlot,
                    selectedTime === time && styles.selectedTimeSlot
                  ]}
                >
                  <Text style={[
                    styles.timeSlotText,
                    selectedTime === time && styles.selectedTimeSlotText
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
                    style={[
                      styles.timeSlotPreview,
                      selectedTime === time && styles.selectedTimeSlotPreview
                    ]}
                  >
                    <Text style={[
                      styles.timeSlotPreviewText,
                      selectedTime === time && styles.selectedTimeSlotPreviewText
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
          style={styles.confirmButton}
        >
          <Text style={styles.confirmButtonText}>Confirm</Text>
        </TouchableOpacity>
      </View>

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
  dayText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
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
  // Time row preview styles - FIXED
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
    paddingBottom: 80, // Account for navbar height
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
});

export default AppointmentScreen;