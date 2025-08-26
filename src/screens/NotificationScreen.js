import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Navbar from '../navigations/navbar';

const NotificationScreen = ({ navigation, route }) => {
  const [notifications, setNotifications] = useState([]);
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [expandedNotifications, setExpandedNotifications] = useState(new Set());

  useEffect(() => {
    // Check for appointment notifications when screen loads
    generateNotifications();
  }, [route.params]);

  const generateNotifications = () => {
    // Get appointment details if passed from ConfirmationScreen
    const { appointmentDetails } = route.params || {};
    
    let notificationList = [];
    
    // If there's a new appointment booked, create notifications for it
    if (appointmentDetails) {
      const { selectedDate, selectedTime, selectedServices } = appointmentDetails;
      
      // Create reminder notification
      const reminderNotification = {
        id: 'reminder_' + Date.now(),
        type: 'Reminders',
        title: 'Appointment Reminder',
        message: `You have an appointment with Dr. Jessica Fano on ${selectedDate.toLocaleDateString('en-US', { 
          month: 'long', 
          day: 'numeric', 
          year: 'numeric' 
        })} at ${selectedTime}`,
        date: new Date().toLocaleDateString('en-US', { 
          month: 'short', 
          day: '2-digit', 
          year: 'numeric' 
        }),
        isNew: true,
        isRead: false
      };
      
      // Create booking confirmation notification
      const confirmationNotification = {
        id: 'confirmation_' + Date.now(),
        type: 'Booking Confirmation',
        title: 'Appointment Confirmed',
        message: `Your appointment has been successfully booked with Dr. Jessica Fano for ${selectedServices.join(', ')}`,
        date: new Date(Date.now() - 86400000).toLocaleDateString('en-US', { 
          month: 'short', 
          day: '2-digit', 
          year: 'numeric' 
        }),
        isNew: true,
        isRead: false
      };
      
      notificationList = [reminderNotification, confirmationNotification];
    }
    
    // Add some sample past notifications
    const sampleNotifications = [
      {
        id: 'update_1',
        type: 'Latest update',
        title: 'New Services Available',
        message: 'We now offer advanced teeth whitening and orthodontic treatments. Book your appointment today!',
        fullMessage: 'We are excited to announce new services at our dental clinic!\n\nNew Services Available:\n• Advanced Teeth Whitening - Professional whitening treatments for a brighter smile\n• Orthodontic Treatments - Braces, clear aligners, and other teeth straightening options\n• Cosmetic Dentistry - Veneers, bonding, and smile makeovers\n• Implant Dentistry - Tooth replacement solutions\n\nOur experienced team is ready to help you achieve the perfect smile. Contact us today to schedule a consultation and learn more about these exciting new treatments!\n\nSpecial promotion: 20% off teeth whitening for new patients this month!',
        date: 'July 05, 2025',
        isNew: false,
        isRead: true
      }
    ];
    
    setNotifications([...notificationList, ...sampleNotifications]);
  };

  const handleNotificationPress = (notification) => {
    console.log('Notification pressed:', notification);
    
    // Toggle expansion
    const newExpandedNotifications = new Set(expandedNotifications);
    if (expandedNotifications.has(notification.id)) {
      newExpandedNotifications.delete(notification.id);
    } else {
      newExpandedNotifications.add(notification.id);
      // Mark as read when expanded
      markAsRead(notification.id);
    }
    setExpandedNotifications(newExpandedNotifications);
  };

  const handleLongPress = (notification) => {
    setSelectedNotification(notification);
    setShowActionModal(true);
  };

  const markAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, isRead: true, isNew: false }
          : notification
      )
    );
  };

  const markAsUnread = () => {
    if (selectedNotification) {
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === selectedNotification.id 
            ? { ...notification, isRead: false, isNew: true }
            : notification
        )
      );
    }
    setShowActionModal(false);
    setSelectedNotification(null);
  };

  const showDeleteConfirmation = () => {
    setShowActionModal(false);
    Alert.alert(
      'Delete Notification',
      `Are you sure you want to delete this ${selectedNotification?.type?.toLowerCase()} notification?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => setSelectedNotification(null)
        },
        {
          text: 'Confirm',
          style: 'destructive',
          onPress: deleteNotification
        }
      ]
    );
  };

  const deleteNotification = () => {
    if (selectedNotification) {
      setNotifications(prev => 
        prev.filter(notification => notification.id !== selectedNotification.id)
      );
    }
    setSelectedNotification(null);
  };

  const closeActionModal = () => {
    setShowActionModal(false);
    setSelectedNotification(null);
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <View style={styles.folderIcon}>
          <View style={styles.folderBase} />
          <View style={styles.folderTop} />
          <View style={styles.folderTab} />
        </View>
        <View style={styles.bellIcon}>
          <Ionicons name="notifications" size={28} color="#F1C40F" />
          <View style={styles.exclamationBadge}>
            <Text style={styles.exclamationText}>!</Text>
          </View>
        </View>
      </View>
      
      <Text style={styles.emptyTitle}>No notifications yet</Text>
      <Text style={styles.emptyMessage}>
        Your notification will appear here once you've{'\n'}received them.
      </Text>
    </View>
  );

  const renderNotificationItem = (notification) => {
    const isExpanded = expandedNotifications.has(notification.id);
    
    return (
      <TouchableOpacity
        key={notification.id}
        style={[
          styles.notificationItem,
          notification.type === 'Reminders' && styles.reminderNotification,
          !notification.isRead && styles.unreadNotification,
          isExpanded && styles.expandedNotification
        ]}
        onPress={() => handleNotificationPress(notification)}
        onLongPress={() => handleLongPress(notification)}
        delayLongPress={500}
      >
        <View style={styles.notificationContent}>
          <View style={styles.notificationHeader}>
            <Text style={[
              styles.notificationType,
              notification.type === 'Reminders' && styles.reminderText
            ]}>
              {notification.type}
            </Text>
            <View style={styles.notificationMeta}>
              <Text style={[
                styles.notificationDate,
                notification.type === 'Reminders' && styles.reminderDateText
              ]}>
                {notification.date}
              </Text>
              {!notification.isRead && <View style={[
                styles.newIndicator,
                notification.type === 'Reminders' && styles.reminderIndicator
              ]} />}
              <Ionicons 
                name={isExpanded ? "chevron-up" : "chevron-down"} 
                size={20} 
                color={notification.type === 'Reminders' ? "#E5E7EB" : "#9CA3AF"} 
                style={styles.expandIcon}
              />
            </View>
          </View>
          
          <Text style={[
            styles.notificationMessage,
            notification.type === 'Reminders' && styles.reminderMessageText
          ]}>
            {isExpanded ? (notification.fullMessage || notification.message) : notification.message}
          </Text>
          
          {isExpanded && (notification.type === 'Reminders' || notification.type === 'Booking Confirmation') && (
            <TouchableOpacity
              style={[
                styles.actionButton,
                notification.type === 'Reminders' && styles.reminderActionButton
              ]}
              onPress={() => navigation.navigate('AppointmentScreen')}
            >
              <Text style={[
                styles.actionButtonText,
                notification.type === 'Reminders' && styles.reminderActionButtonText
              ]}>
                View Appointment
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderActionModal = () => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={showActionModal}
      onRequestClose={closeActionModal}
    >
      <TouchableOpacity 
        style={styles.modalOverlay} 
        activeOpacity={1} 
        onPress={closeActionModal}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Notification Options</Text>
          
          <TouchableOpacity 
            style={styles.modalOption}
            onPress={markAsUnread}
          >
            <Ionicons name="mail-outline" size={24} color="#3B82F6" />
            <Text style={styles.modalOptionText}>Mark as Unread</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.modalOption, styles.deleteOption]}
            onPress={showDeleteConfirmation}
          >
            <Ionicons name="trash-outline" size={24} color="#EF4444" />
            <Text style={[styles.modalOptionText, styles.deleteText]}>Delete</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.cancelOption}
            onPress={closeActionModal}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );

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
        <Text style={styles.headerTitle}>Notification</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {notifications.length === 0 ? (
          renderEmptyState()
        ) : (
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.sectionTitle}>Previously</Text>
            {notifications.map(renderNotificationItem)}
          </ScrollView>
        )}
      </View>

      {/* Action Modal */}
      {renderActionModal()}

      {/* Bottom Navigation */}
      <Navbar navigation={navigation} activeTab="Profile" />
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
  content: {
    flex: 1,
  },
  
  // Empty State Styles
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    position: 'relative',
    marginBottom: 40,
    alignItems: 'center',
  },
  folderIcon: {
    position: 'relative',
    width: 80,
    height: 60,
  },
  folderBase: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 80,
    height: 50,
    backgroundColor: '#3B82F6',
    borderRadius: 4,
  },
  folderTop: {
    position: 'absolute',
    bottom: 25,
    left: 10,
    width: 60,
    height: 35,
    backgroundColor: '#60A5FA',
    borderRadius: 4,
  },
  folderTab: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 30,
    height: 15,
    backgroundColor: '#3B82F6',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  bellIcon: {
    position: 'absolute',
    right: -10,
    top: 10,
  },
  exclamationBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#F1C40F',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  exclamationText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  
  // Notifications List Styles
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100, // Account for navbar
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
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  reminderNotification: {
    backgroundColor: '#3B82F6',
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  notificationType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  reminderText: {
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
  reminderDateText: {
    color: '#E5E7EB',
  },
  newIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3B82F6',
  },
  reminderIndicator: {
    backgroundColor: '#FFFFFF',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  reminderMessageText: {
    color: '#F3F4F6',
  },
  expandIcon: {
    marginLeft: 8,
  },
  expandedNotification: {
    minHeight: 120,
  },
  actionButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  reminderActionButton: {
    backgroundColor: '#FFFFFF',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  reminderActionButtonText: {
    color: '#3B82F6',
  },

  // Modal Styles
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
    minWidth: 280,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 20,
    textAlign: 'center',
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
});

export default NotificationScreen;