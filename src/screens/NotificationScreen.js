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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, db } from '../config/firebaseConfig'; // Adjust path as needed
import { doc, updateDoc, onSnapshot, collection, query, where, orderBy } from 'firebase/firestore';

const NotificationScreen = ({ navigation, route }) => {
  // Main states
  const [notifications, setNotifications] = useState([]);
  const [showActionModal, setShowActionModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [processedNotifications, setProcessedNotifications] = useState(new Set());

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

  // Update unread count for red badge system
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
              
              // Extract additional appointment details
              const doctorName = appointment.doctorName || appointment.doctor || 'Doctor';
              const clinicName = 'Fano Dental Clinic'; // Always use Fano Dental Clinic
              const service = appointment.service || appointment.serviceType || appointment.selectedServices || '';
              const reason = appointment.reason || appointment.description || '';
              const patientName = appointment.patientName || appointment.fullName || currentUser.displayName || 'Patient';
              
              // Create comprehensive notification content
              let notificationTitle, notificationMessage, notificationType;
              
              if (appointment.status === 'approved') {
                notificationTitle = 'Appointment Confirmed';
                notificationMessage = `Your appointment has been confirmed!\n\n` +
                  `📅 Date: ${formattedDate}\n` +
                  `⏰ Time: ${formattedTime}\n` +
                  `👨‍⚕️ Doctor: Dr. ${doctorName}\n` +
                  `🏥 Clinic: ${clinicName}\n` +
                  `👤 Patient: ${patientName}`;
                
                if (service) {
                  notificationMessage += `\n🦷 Services: ${service}`;
                }
                
                if (reason) {
                  notificationMessage += `\n📝 Reason: ${reason}`;
                }
                
                notificationMessage += `\n\n✅ Status: CONFIRMED\n\nPlease arrive 15 minutes early for your appointment.`;
                notificationType = 'Booking Confirmation';
              } else if (appointment.status === 'declined') {
                notificationTitle = 'Appointment Declined';
                notificationMessage = `Unfortunately, your appointment request has been declined.\n\n` +
                  `📅 Requested Date: ${formattedDate}\n` +
                  `⏰ Requested Time: ${formattedTime}\n` +
                  `👨‍⚕️ Doctor: Dr. ${doctorName}\n` +
                  `🏥 Clinic: ${clinicName}\n` +
                  `👤 Patient: ${patientName}`;
                
                if (service) {
                  notificationMessage += `\n🦷 Services: ${service}`;
                }
                
                if (reason) {
                  notificationMessage += `\n📝 Reason: ${reason}`;
                }
                
                notificationMessage += `\n\n❌ Status: DECLINED\n\nPlease try booking a different date or time slot, or contact the clinic directly.`;
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
                // Store additional details for full context
                doctorName: doctorName,
                clinicName: clinicName,
                service: service,
                reason: reason,
                patientName: patientName,
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
            numberOfLines={4}
            ellipsizeMode="tail"
          >
            {notification.message}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

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
        <View style={styles.settingsButton} />
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
    width: 32, // Maintain layout spacing
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
  modalScrollView: {
    paddingBottom: 20,
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