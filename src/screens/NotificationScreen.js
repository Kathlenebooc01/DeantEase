import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  Linking,
  Switch,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, db } from '../config/firebaseConfig'; // Adjust path as needed
import { doc, updateDoc, onSnapshot, collection, query, where, orderBy } from 'firebase/firestore';

// Email Service for backend communication
const API_BASE_URL = 'http://localhost:5000/api'; // Change to your deployed URL

const bookingEmailService = {
  async testConnection() {
    try {
      const response = await fetch(`${API_BASE_URL}/test-connection`);
      return response.ok;
    } catch (error) {
      return false;
    }
  },

  async sendTestEmail(userEmail, userName) {
    try {
      const response = await fetch(`${API_BASE_URL}/send-test-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userEmail,
          userName,
        }),
      });
      return response.ok;
    } catch (error) {
      throw error;
    }
  }
};

const NotificationScreen = ({ navigation, route }) => {
  // Main states
  const [notifications, setNotifications] = useState([]);
  const [showActionModal, setShowActionModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [processedNotifications, setProcessedNotifications] = useState(new Set());

  // Email integration states
  const [showEmailSettings, setShowEmailSettings] = useState(false);
  const [backendStatus, setBackendStatus] = useState('checking');
  const [userEmail, setUserEmail] = useState('');
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
  const [emailPreferences, setEmailPreferences] = useState({
    appointmentConfirmations: true,
    appointmentReminders: true,
    emergencyNotifications: true
  });

  // Current user
  const currentUser = auth.currentUser;

  useEffect(() => {
    initializeScreen();
  }, [route.params]);

  useEffect(() => {
    if (currentUser) {
      const unsubscribe = listenForAppointmentUpdates();
      return () => {
        if (unsubscribe) unsubscribe();
      };
    }
  }, [currentUser, processedNotifications]);

  // Initialize screen data
  const initializeScreen = async () => {
    await loadStoredNotifications();
    await loadProcessedNotifications();
    await loadUserEmailPreferences();
    await checkBackendStatus();
    await markAllNotificationsAsRead();
  };

  // Load processed notifications set
  const loadProcessedNotifications = async () => {
    try {
      if (currentUser) {
        const stored = await AsyncStorage.getItem(`processed_notifications_${currentUser.uid}`);
        if (stored) {
          setProcessedNotifications(new Set(JSON.parse(stored)));
        }
      }
    } catch (error) {
      console.error('Error loading processed notifications:', error);
    }
  };

  // Save processed notifications set
  const saveProcessedNotifications = async (processedSet) => {
    try {
      if (currentUser) {
        await AsyncStorage.setItem(
          `processed_notifications_${currentUser.uid}`, 
          JSON.stringify(Array.from(processedSet))
        );
      }
    } catch (error) {
      console.error('Error saving processed notifications:', error);
    }
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    try {
      let date;
      
      if (dateString instanceof Date) {
        date = dateString;
      } else if (typeof dateString === 'string') {
        if (dateString.includes('/')) {
          date = new Date(dateString);
        } else if (dateString.includes('-')) {
          date = new Date(dateString);
        } else {
          date = new Date(dateString);
        }
      } else {
        date = new Date();
      }

      if (isNaN(date.getTime())) {
        return new Date().toLocaleDateString();
      }

      return date.toLocaleDateString();
    } catch (error) {
      console.error('Date formatting error:', error);
      return new Date().toLocaleDateString();
    }
  };

  // Helper function to format time
  const formatTime = (timeString) => {
    try {
      if (!timeString || timeString === 'undefined') {
        return 'Time not specified';
      }

      if (typeof timeString === 'string' && timeString.match(/^\d{1,2}:\d{2}$/)) {
        return timeString;
      }

      if (typeof timeString === 'string' && (timeString.includes('AM') || timeString.includes('PM'))) {
        return timeString;
      }

      const time = new Date(`1970/01/01 ${timeString}`);
      if (!isNaN(time.getTime())) {
        return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }

      return timeString || 'Time not specified';
    } catch (error) {
      console.error('Time formatting error:', error);
      return 'Time not specified';
    }
  };

  // Load stored notifications from AsyncStorage
  const loadStoredNotifications = async () => {
    try {
      if (currentUser) {
        const storedNotifications = await AsyncStorage.getItem(`notifications_${currentUser.uid}`);
        if (storedNotifications) {
          const notifications = JSON.parse(storedNotifications);
          
          // Migration: Update old notifications to have proper status fields
          const migratedNotifications = notifications.map(notification => {
            // If notification doesn't have status but is booking-related, infer status from type
            if (!notification.status && 
                (notification.type === 'Booking Confirmation' || notification.type === 'Booking Update')) {
              
              if (notification.type === 'Booking Confirmation') {
                notification.status = 'approved';
              } else if (notification.type === 'Booking Update') {
                // Check message content to determine if it's declined
                if (notification.message && notification.message.toLowerCase().includes('declined')) {
                  notification.status = 'declined';
                } else {
                  notification.status = 'approved'; // Default for booking updates
                }
              }
            }
            return notification;
          });
          
          // Sort by timestamp to show newest first
          migratedNotifications.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
          setNotifications(migratedNotifications);
          
          // Save migrated notifications back to storage
          if (JSON.stringify(migratedNotifications) !== JSON.stringify(notifications)) {
            await AsyncStorage.setItem(`notifications_${currentUser.uid}`, JSON.stringify(migratedNotifications));
          }
        }
      }
    } catch (error) {
      console.error('Error loading stored notifications:', error);
    }
  };

  // Save notifications to AsyncStorage
  const saveNotifications = async (notificationList) => {
    try {
      if (currentUser) {
        // Sort by timestamp before saving
        const sortedNotifications = [...notificationList].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        await AsyncStorage.setItem(`notifications_${currentUser.uid}`, JSON.stringify(sortedNotifications));
      }
    } catch (error) {
      console.error('Error saving notifications:', error);
    }
  };

  // Mark all notifications as read when user opens notification screen
  const markAllNotificationsAsRead = async () => {
    try {
      if (currentUser && notifications.length > 0) {
        const updatedNotifications = notifications.map(notification => ({
          ...notification,
          isRead: true,
          isNew: false
        }));
        setNotifications(updatedNotifications);
        await saveNotifications(updatedNotifications);
        
        // Clear the red badge count
        await AsyncStorage.setItem(`unread_count_${currentUser.uid}`, '0');
      }
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  // Load user email preferences
  const loadUserEmailPreferences = async () => {
    try {
      if (currentUser) {
        const savedPrefs = await AsyncStorage.getItem(`email_prefs_${currentUser.uid}`);
        if (savedPrefs) {
          setEmailPreferences(JSON.parse(savedPrefs));
        }
        
        const savedEmail = await AsyncStorage.getItem(`user_email_${currentUser.uid}`);
        if (savedEmail) {
          setUserEmail(savedEmail);
        } else if (currentUser.email) {
          setUserEmail(currentUser.email);
        }
      }
    } catch (error) {
      console.error('Error loading email preferences:', error);
    }
  };

  // Check backend email service status
  const checkBackendStatus = async () => {
    try {
      const result = await bookingEmailService.testConnection();
      setBackendStatus(result ? 'online' : 'offline');
    } catch (error) {
      setBackendStatus('offline');
    }
  };

  // Update unread count for red badge system - with both function names for compatibility
  const updateUnreadCount = async (updatedNotifications = null) => {
    try {
      if (currentUser) {
        let unreadCount;
        if (updatedNotifications) {
          // Use provided notifications array
          unreadCount = updatedNotifications.filter(n => !n.isRead).length;
        } else {
          // Use current notifications state
          unreadCount = notifications.filter(n => !n.isRead).length;
        }
        await AsyncStorage.setItem(`unread_count_${currentUser.uid}`, unreadCount.toString());
        console.log('Updated unread count:', unreadCount);
      }
    } catch (error) {
      console.error('Error updating unread count:', error);
    }
  };

  // Alias for backward compatibility to prevent the error
  const updateUnreadCountForNewNotification = updateUnreadCount;

  // Listen for real-time appointment updates
  const listenForAppointmentUpdates = () => {
    if (!currentUser) return;

    const appointmentsRef = collection(db, 'appointments');
    const q = query(
      appointmentsRef,
      where('userId', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'modified') {
          const appointment = change.doc.data();
          const appointmentId = change.doc.id;
          
          console.log('=== APPOINTMENT UPDATE DETECTED ===');
          console.log('Appointment ID:', appointmentId);
          console.log('Status:', appointment.status);
          console.log('Notification shown flag:', appointment.notificationShown);
          console.log('===================================');
          
          // Create unique identifier for this specific appointment status change
          const notificationKey = `${appointmentId}_${appointment.status}_${appointment.createdAt || Date.now()}`;
          
          // Check if appointment status changed and notification not processed yet
          if ((appointment.status === 'approved' || appointment.status === 'declined') && 
              !appointment.notificationShown && 
              !processedNotifications.has(notificationKey)) {
            
            console.log('Creating new notification for:', notificationKey);
            
            try {
              // Add to processed notifications immediately to prevent duplicates
              const updatedProcessedSet = new Set([...processedNotifications, notificationKey]);
              setProcessedNotifications(updatedProcessedSet);
              saveProcessedNotifications(updatedProcessedSet);
              
              // Extract date and time information
              let appointmentDate = null;
              let appointmentTime = null;
              
              // Search for date fields
              const dateKeys = Object.keys(appointment).filter(key => 
                key.toLowerCase().includes('date') || 
                key.toLowerCase().includes('day') ||
                key.toLowerCase().includes('schedule')
              );
              
              const timeKeys = Object.keys(appointment).filter(key => 
                key.toLowerCase().includes('time') || 
                key.toLowerCase().includes('hour')
              );
              
              // Get date from any date-related field
              for (const key of dateKeys) {
                if (appointment[key] && appointment[key] !== 'undefined' && appointment[key] !== null) {
                  appointmentDate = appointment[key];
                  break;
                }
              }
              
              // Get time from any time-related field
              for (const key of timeKeys) {
                if (appointment[key] && appointment[key] !== 'undefined' && appointment[key] !== null) {
                  appointmentTime = appointment[key];
                  break;
                }
              }
              
              // Fallback to common field names
              if (!appointmentDate) {
                appointmentDate = appointment.selectedDate || 
                                appointment.date || 
                                appointment.appointmentDate || 
                                appointment.bookingDate ||
                                'Date not found';
              }
                                
              if (!appointmentTime) {
                appointmentTime = appointment.selectedTime || 
                                appointment.time || 
                                appointment.appointmentTime || 
                                appointment.bookingTime ||
                                'Time not found';
              }
              
              const formattedDate = formatDate(appointmentDate);
              const formattedTime = formatTime(appointmentTime);
              
              // Create notification content
              let notificationTitle, notificationMessage, notificationType;
              
              if (appointment.status === 'approved') {
                notificationTitle = 'Appointment Confirmed';
                notificationMessage = `Your appointment for ${formattedDate} at ${formattedTime} has been confirmed. Please check your email for detailed information.`;
                notificationType = 'Booking Confirmation';
              } else if (appointment.status === 'declined') {
                notificationTitle = 'Appointment Declined';
                notificationMessage = `Your appointment request for ${formattedDate} at ${formattedTime} has been declined. Please check your email for details and rebooking options.`;
                notificationType = 'Booking Update';
              }

              // Create new notification with unique timestamp
              const currentDate = new Date();
              const timestamp = Date.now() + Math.random(); // Add randomness to ensure uniqueness
              
              const newNotification = {
                id: `${appointment.status}_${appointmentId}_${timestamp}`,
                type: notificationType,
                title: notificationTitle,
                message: notificationMessage,
                date: currentDate.toLocaleDateString(),
                time: currentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isNew: true,
                isRead: false,
                appointmentId: appointmentId,
                status: appointment.status, // This is the key field for status badges
                appointmentDate: formattedDate,
                appointmentTime: formattedTime,
                timestamp: timestamp,
                notificationKey: notificationKey,
              };

              console.log('New notification created:', newNotification.id);

              // Update notifications state and save with proper async handling
              setNotifications(prevNotifications => {
                const updatedNotifications = [newNotification, ...prevNotifications];
                
                // Immediately update the unread count in AsyncStorage
                const updateCountAsync = async () => {
                  try {
                    const unreadCount = updatedNotifications.filter(n => !n.isRead).length;
                    await AsyncStorage.setItem(`unread_count_${currentUser.uid}`, unreadCount.toString());
                    console.log('Updated unread count:', unreadCount);
                  } catch (error) {
                    console.error('Error updating unread count:', error);
                  }
                };
                
                // Execute async operations without blocking state update
                Promise.all([
                  saveNotifications(updatedNotifications),
                  updateCountAsync()
                ]).catch(error => {
                  console.error('Error in async operations:', error);
                });
                
                return updatedNotifications;
              });

              // Mark as notification shown in Firebase
              markNotificationShown(appointmentId);
              
            } catch (error) {
              console.error('Error creating notification:', error);
            }
          } else {
            console.log('Notification already processed or conditions not met for:', notificationKey);
          }
        }
      });
    });

    return unsubscribe;
  };

  // Mark notification as shown in Firestore
  const markNotificationShown = async (appointmentId) => {
    try {
      const appointmentRef = doc(db, 'appointments', appointmentId);
      await updateDoc(appointmentRef, {
        notificationShown: true
      });
      console.log('Marked notification as shown for appointment:', appointmentId);
    } catch (error) {
      console.error('Error marking notification as shown:', error);
    }
  };

  // Save email preferences
  const saveEmailPreferences = async (newPrefs) => {
    try {
      if (currentUser) {
        await AsyncStorage.setItem(`email_prefs_${currentUser.uid}`, JSON.stringify(newPrefs));
        setEmailPreferences(newPrefs);
        
        Alert.alert(
          "Preferences Saved",
          "Your email notification preferences have been updated.",
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert("Save Failed", "Could not save preferences. Please try again.");
    }
  };

  // Update user email
  const updateUserEmail = async () => {
    if (!userEmail.trim() || !userEmail.includes('@')) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }

    setIsUpdatingEmail(true);
    try {
      if (currentUser) {
        await AsyncStorage.setItem(`user_email_${currentUser.uid}`, userEmail.trim());
        Alert.alert("Email Updated", "Your email address has been updated successfully.");
      }
    } catch (error) {
      Alert.alert("Update Failed", "Could not update your email. Please try again.");
    } finally {
      setIsUpdatingEmail(false);
    }
  };

  // Send test email
  const sendTestEmail = async () => {
    if (backendStatus !== 'online') {
      Alert.alert(
        "Service Unavailable",
        "Email service is currently offline. Please try again later."
      );
      return;
    }

    try {
      await bookingEmailService.sendTestEmail(userEmail, currentUser?.displayName || 'User');
      Alert.alert(
        "Test Email Sent!",
        "A test email has been sent to your email address. Please check your inbox (and spam folder)."
      );
    } catch (error) {
      Alert.alert(
        "Test Failed",
        "Could not send test email. Please check your internet connection and try again."
      );
    }
  };

  // Toggle preference switch
  const togglePreference = (key) => {
    const newPrefs = {
      ...emailPreferences,
      [key]: !emailPreferences[key]
    };
    saveEmailPreferences(newPrefs);
  };

  // Notification handling functions
  const handleNotificationPress = (notification) => {
    setSelectedNotification(notification);
    markAsRead(notification.id);
    setShowNotificationModal(true);
  };

  const handleLongPress = (notification) => {
    setSelectedNotification(notification);
    setShowActionModal(true);
  };

  const markAsRead = (notificationId) => {
    const updatedNotifications = notifications.map((notification) =>
      notification.id === notificationId
        ? { ...notification, isRead: true, isNew: false }
        : notification
    );
    setNotifications(updatedNotifications);
    saveNotifications(updatedNotifications);
  };

  const markAsUnread = () => {
    if (selectedNotification) {
      const updatedNotifications = notifications.map((notification) =>
        notification.id === selectedNotification.id
          ? { ...notification, isRead: false, isNew: true }
          : notification
      );
      setNotifications(updatedNotifications);
      saveNotifications(updatedNotifications);
    }
    closeActionModal();
  };

  const markAsReadFromLongPress = () => {
    if (selectedNotification) {
      markAsRead(selectedNotification.id);
    }
    closeActionModal();
  };

  const showDeleteConfirmation = () => {
    setShowActionModal(false);
    Alert.alert(
      'Delete Notification',
      `Are you sure you want to delete this ${selectedNotification?.type?.toLowerCase()} notification?`,
      [
        { text: 'Cancel', style: 'cancel', onPress: () => setSelectedNotification(null) },
        { text: 'Confirm', style: 'destructive', onPress: deleteNotification }
      ]
    );
  };

  const deleteNotification = async () => {
    if (selectedNotification) {
      const updatedNotifications = notifications.filter((notification) => 
        notification.id !== selectedNotification.id
      );
      setNotifications(updatedNotifications);
      await saveNotifications(updatedNotifications);
    }
    closeActionModal();
    closeNotificationModal();
  };

  const closeActionModal = () => {
    setShowActionModal(false);
    setSelectedNotification(null);
  };

  const closeNotificationModal = () => {
    setShowNotificationModal(false);
    setSelectedNotification(null);
  };

  // Render functions
  const renderNotificationItem = (notification) => {
    const isUnread = !notification.isRead;
    const isHighlighted = route.params?.highlightNotification === notification.id;
    
    // Check if this is a booking-related notification by type or status
    const isBookingNotification = 
      notification.type === 'Booking Confirmation' || 
      notification.type === 'Booking Update' ||
      (notification.status && (notification.status === 'approved' || notification.status === 'declined'));
    
    // Determine status for display - if no explicit status, infer from type
    let displayStatus = notification.status;
    if (!displayStatus && notification.type === 'Booking Confirmation') {
      displayStatus = 'approved';
    } else if (!displayStatus && notification.type === 'Booking Update') {
      displayStatus = 'declined';
    }
    
    return (
      <TouchableOpacity
        key={notification.id}
        style={[
          styles.notificationItem,
          isUnread ? styles.unreadNotification : null,
          isHighlighted ? styles.highlightedNotification : null,
          isBookingNotification && isUnread ? styles.bookingUpdateNotification : null,
        ]}
        onPress={() => handleNotificationPress(notification)}
        onLongPress={() => handleLongPress(notification)}
        delayLongPress={500}
      >
        <View style={styles.notificationHeader}>
          <View style={styles.notificationTypeContainer}>
            <Text style={[styles.notificationType, isUnread ? styles.unreadText : null]}>
              {notification.type}
            </Text>
            {/* Show status badge for all booking notifications */}
            {isBookingNotification && displayStatus && (
              <View style={[
                styles.statusBadge,
                displayStatus === 'approved' ? styles.approvedBadge : styles.declinedBadge
              ]}>
                <Text style={styles.statusBadgeText}>
                  {displayStatus === 'approved' ? 'CONFIRMED' : 'DECLINED'}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.notificationMeta}>
            <Text style={[styles.notificationDate, isUnread ? styles.unreadText : null]}>
              {notification.date}
            </Text>
            {isUnread && <View style={styles.newIndicator} />}
          </View>
        </View>
        <View style={styles.notificationContent}>
          <Text
            style={[styles.notificationMessage, isUnread ? styles.unreadMessageText : null]}
            numberOfLines={3}
            ellipsizeMode="tail"
          >
            {notification.message}
          </Text>
          {/* Show email reminder for all booking notifications */}
          {isBookingNotification && (
            <Text style={[styles.emailReminder, isUnread ? styles.unreadEmailReminder : null]}>
              📧 Please check your email for detailed information
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  // Email Settings Modal
  const renderEmailSettingsModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showEmailSettings}
      onRequestClose={() => setShowEmailSettings(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.emailSettingsModal}>
          <View style={styles.emailSettingsHeader}>
            <Text style={styles.modalTitle}>Email Settings</Text>
            <TouchableOpacity onPress={() => setShowEmailSettings(false)}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.emailSettingsContent}>
            {/* Service Status */}
            <View style={styles.statusSection}>
              <Text style={styles.sectionTitle}>Service Status</Text>
              <View style={styles.statusRow}>
                <View style={[
                  styles.statusDot,
                  { backgroundColor: backendStatus === 'online' ? '#16a34a' : '#f59e0b' }
                ]} />
                <Text style={styles.statusText}>
                  Email service is {backendStatus === 'online' ? 'online' : 'offline'}
                </Text>
              </View>
            </View>

            {/* Email Address */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Email Address</Text>
              <TextInput
                style={styles.emailInput}
                value={userEmail}
                onChangeText={setUserEmail}
                placeholder="Enter your email address"
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={[styles.updateButton, isUpdatingEmail && styles.buttonDisabled]}
                onPress={updateUserEmail}
                disabled={isUpdatingEmail}
              >
                <Text style={styles.buttonText}>
                  {isUpdatingEmail ? 'Updating...' : 'Update Email'}
                </Text>
              </TouchableOpacity>

              {backendStatus === 'online' && (
                <TouchableOpacity style={styles.testButton} onPress={sendTestEmail}>
                  <Text style={styles.testButtonText}>Send Test Email</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Email Preferences */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Email Preferences</Text>
              
              <View style={styles.preferenceItem}>
                <View style={styles.preferenceContent}>
                  <Text style={styles.preferenceTitle}>Appointment Confirmations</Text>
                  <Text style={styles.preferenceSubtitle}>
                    Get notified when appointments are confirmed
                  </Text>
                </View>
                <Switch
                  value={emailPreferences.appointmentConfirmations}
                  onValueChange={() => togglePreference('appointmentConfirmations')}
                  trackColor={{ false: '#d1d5db', true: '#3b82f6' }}
                />
              </View>

              <View style={styles.preferenceItem}>
                <View style={styles.preferenceContent}>
                  <Text style={styles.preferenceTitle}>Appointment Reminders</Text>
                  <Text style={styles.preferenceSubtitle}>
                    Receive reminders before appointments
                  </Text>
                </View>
                <Switch
                  value={emailPreferences.appointmentReminders}
                  onValueChange={() => togglePreference('appointmentReminders')}
                  trackColor={{ false: '#d1d5db', true: '#3b82f6' }}
                />
              </View>

              <View style={styles.preferenceItem}>
                <View style={styles.preferenceContent}>
                  <Text style={styles.preferenceTitle}>Emergency Notifications</Text>
                  <Text style={styles.preferenceSubtitle}>
                    Important updates and emergencies
                  </Text>
                </View>
                <Switch
                  value={emailPreferences.emergencyNotifications}
                  onValueChange={() => togglePreference('emergencyNotifications')}
                  trackColor={{ false: '#d1d5db', true: '#3b82f6' }}
                />
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const renderNotificationModal = () => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={showNotificationModal}
      onRequestClose={closeNotificationModal}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={closeNotificationModal}
      >
        <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {selectedNotification?.type}
            </Text>
            <TouchableOpacity onPress={closeNotificationModal}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.modalScrollView}>
            <Text style={styles.modalMessageFull}>
              {selectedNotification?.message}
            </Text>
            {selectedNotification?.expandedContent?.clinic && (
              <Text style={styles.modalExpandedText}>
                {selectedNotification.expandedContent.clinic}
              </Text>
            )}
            {selectedNotification?.expandedContent?.phoneNumber && (
              <TouchableOpacity
                onPress={() => Linking.openURL(`tel:${selectedNotification.expandedContent.phoneNumber}`)}
              >
                <Text style={styles.modalPhoneNumber}>
                  {selectedNotification.expandedContent.phoneNumber}
                </Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  const renderActionModal = () => (
    <Modal animationType="fade" transparent={true} visible={showActionModal} onRequestClose={closeActionModal}>
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={closeActionModal}>
        <View style={styles.longPressModalContent} onStartShouldSetResponder={() => true}>
          <Text style={styles.modalTitle}>Notification Options</Text>
          {!selectedNotification?.isRead ? (
            <TouchableOpacity style={styles.modalOption} onPress={markAsReadFromLongPress}>
              <Ionicons name="mail-open-outline" size={24} color="#3B82F6" />
              <Text style={styles.modalOptionText}>Mark as Read</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.modalOption} onPress={markAsUnread}>
              <Ionicons name="mail-outline" size={24} color="#3B82F6" />
              <Text style={styles.modalOptionText}>Mark as Unread</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={[styles.modalOption, styles.deleteOption]} onPress={showDeleteConfirmation}>
            <Ionicons name="trash-outline" size={24} color="#EF4444" />
            <Text style={[styles.modalOptionText, styles.deleteText]}>Delete</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelOption} onPress={closeActionModal}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notification</Text>
        <TouchableOpacity 
          style={styles.settingsButton} 
          onPress={() => setShowEmailSettings(true)}
        >
          <Ionicons name="settings-outline" size={24} color="#374151" />
        </TouchableOpacity>
      </View>

      {/* Service Status Indicator */}
      <View style={styles.serviceStatus}>
        <View style={[
          styles.serviceStatusDot,
          { backgroundColor: backendStatus === 'online' ? '#16a34a' : '#f59e0b' }
        ]} />
        <Text style={styles.serviceStatusText}>
          Email notifications {backendStatus === 'online' ? 'enabled' : 'unavailable'}
        </Text>
      </View>

      <View style={styles.content}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {notifications.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="notifications-outline" size={64} color="#D1D5DB" />
              <Text style={styles.emptyTitle}>No Notifications</Text>
              <Text style={styles.emptySubtitle}>
                You'll receive notifications here when your appointment bookings are updated.
              </Text>
            </View>
          ) : (
            <>
              <Text style={styles.sectionTitle}>Booking Updates</Text>
              {notifications.map(renderNotificationItem)}
            </>
          )}
        </ScrollView>
      </View>

      {renderNotificationModal()}
      {renderActionModal()}
      {renderEmailSettingsModal()}
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
    justifyContent: 'space-between',
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
  settingsButton: {
    padding: 4,
  },
  serviceStatus: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  serviceStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  serviceStatusText: {
    fontSize: 12,
    color: '#6B7280',
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  notificationItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  unreadNotification: {
    backgroundColor: '#3B82F6',
  },
  highlightedNotification: {
    borderWidth: 2,
    borderColor: '#F59E0B',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  bookingUpdateNotification: {
    backgroundColor: '#059669',
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  notificationTypeContainer: {
    flex: 1,
    marginRight: 8,
  },
  notificationType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  unreadText: {
    color: '#FFFFFF',
  },
  notificationMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationDate: {
    fontSize: 14,
    color: '#6B7280',
    marginRight: 8,
  },
  newIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    marginRight: 8,
  },
  notificationContent: {
    flex: 1,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  unreadMessageText: {
    color: '#F3F4F6',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    margin: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  modalMessageFull: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    marginBottom: 16,
  },
  modalExpandedText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 5,
  },
  modalPhoneNumber: {
    fontSize: 14,
    color: '#3B82F6',
    textDecorationLine: 'underline',
  },
  longPressModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    margin: 20,
    minWidth: 280,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  deleteOption: {
    backgroundColor: '#FEF2F2',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#374151',
    marginLeft: 12,
    fontWeight: '500',
  },
  deleteText: {
    color: '#EF4444',
  },
  cancelOption: {
    marginTop: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  cancelText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  emailSettingsModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    margin: 20,
    maxHeight: '85%',
    width: '90%',
  },
  emailSettingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  emailSettingsContent: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  statusSection: {
    marginBottom: 24,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  statusText: {
    fontSize: 14,
    color: '#374151',
  },
  emailInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
    marginBottom: 12,
  },
  updateButton: {
    backgroundColor: '#3B82F6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  buttonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  testButton: {
    backgroundColor: '#10B981',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  testButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    marginBottom: 12,
  },
  preferenceContent: {
    flex: 1,
    marginRight: 16,
  },
  preferenceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  preferenceSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  approvedBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  declinedBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.8)',
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  emailReminder: {
    fontSize: 12,
    color: '#059669',
    fontStyle: 'italic',
    marginTop: 8,
    fontWeight: '500',
  },
  unreadEmailReminder: {
    color: '#F3F4F6',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default NotificationScreen;