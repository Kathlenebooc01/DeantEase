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
// Assuming you have a Navbar component
// import Navbar from '../navigations/navbar';

const NotificationScreen = ({ navigation, route }) => {
  const [notifications, setNotifications] = useState([]);
  const [showActionModal, setShowActionModal] = useState(false); // For long-press actions
  const [showNotificationModal, setShowNotificationModal] = useState(false); // For regular-press pop-up
  const [selectedNotification, setSelectedNotification] = useState(null);

  useEffect(() => {
    generateNotifications();
  }, [route.params]);

  const generateNotifications = () => {
    const sampleNotifications = [
      {
        id: 'reminder_1',
        type: 'Reminders',
        title: 'Appointment Reminder',
        message: 'Hello Claura Smith,\n\nThis is DentEase Clinic, Just wanted to send a reminder that you have an appointment tomorrow at 1:00 PM.',
        date: 'July 09, 2025',
        isNew: true,
        isRead: false,
        expandedContent: {
          clinic: 'Dental Clinic',
          phoneNumber: '09481921762',
        },
      },
      {
        id: 'booking_2',
        type: 'Booking Confirmation',
        title: 'Appointment Confirmed',
        message: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
        date: 'July 08, 2025',
        isNew: false,
        isRead: false,
      },
      {
        id: 'update_3',
        type: 'Latest update',
        title: 'New Services Available',
        message: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
        date: 'July 05, 2025',
        isNew: false,
        isRead: true,
      },
    ];

    setNotifications(sampleNotifications);
  };

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
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === notificationId
          ? { ...notification, isRead: true, isNew: false }
          : notification
      )
    );
  };

  const markAsUnread = () => {
    if (selectedNotification) {
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === selectedNotification.id
            ? { ...notification, isRead: false, isNew: true }
            : notification
        )
      );
    }
    closeActionModal();
    setSelectedNotification(null);
  };

  const markAsReadFromLongPress = () => {
    if (selectedNotification) {
      markAsRead(selectedNotification.id);
    }
    closeActionModal();
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
          onPress: () => setSelectedNotification(null),
        },
        {
          text: 'Confirm',
          style: 'destructive',
          onPress: deleteNotification,
        },
      ]
    );
  };

  const deleteNotification = () => {
    if (selectedNotification) {
      setNotifications((prev) =>
        prev.filter((notification) => notification.id !== selectedNotification.id)
      );
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

  const renderNotificationItem = (notification) => {
    const isUnread = !notification.isRead;
    return (
      <TouchableOpacity
        key={notification.id}
        style={[
          styles.notificationItem,
          isUnread ? styles.unreadNotification : null,
        ]}
        onPress={() => handleNotificationPress(notification)}
        onLongPress={() => handleLongPress(notification)}
        delayLongPress={500}
      >
        <View style={styles.notificationHeader}>
          <Text
            style={[
              styles.notificationType,
              isUnread ? styles.unreadText : null,
            ]}
          >
            {notification.type}
          </Text>
          <View style={styles.notificationMeta}>
            <Text
              style={[
                styles.notificationDate,
                isUnread ? styles.unreadText : null,
              ]}
            >
              {notification.date}
            </Text>
            {isUnread && (
              <View style={styles.newIndicator} />
            )}
          </View>
        </View>
        <View style={styles.notificationContent}>
          <Text
            style={[
              styles.notificationMessage,
              isUnread ? styles.unreadMessageText : null,
            ]}
            numberOfLines={2}
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
            // If the notification is unread (blue), show "Mark as Read"
            <TouchableOpacity style={styles.modalOption} onPress={markAsReadFromLongPress}>
              <Ionicons name="mail-open-outline" size={24} color="#3B82F6" />
              <Text style={styles.modalOptionText}>Mark as Read</Text>
            </TouchableOpacity>
          ) : (
            // If the notification is read, show "Mark as Unread"
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
      </View>
      <View style={styles.content}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sectionTitle}>Previously</Text>
          {notifications.map(renderNotificationItem)}
        </ScrollView>
      </View>
      {renderNotificationModal()}
      {renderActionModal()}
      {/* <Navbar navigation={navigation} activeTab="Notification" /> */}
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
  // Removed reminderNotification style

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
  // Removed reminderText style
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
  // Removed reminderDateText style

  newIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    marginRight: 8,
  },
  // Removed reminderIndicator style

  notificationContent: {
    flex: 1,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  // Removed reminderMessageText style
  unreadMessageText: {
    color: '#F3F4F6',
  },

  // Notification Modal Styles
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
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    padding: 12,
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
  },
  deleteButtonText: {
    color: '#EF4444',
    marginLeft: 8,
    fontWeight: '500',
  },

  // Long-press Action Modal Styles (renamed for clarity)
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
});

export default NotificationScreen;
