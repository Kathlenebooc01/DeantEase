const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

// This function triggers every time a new document is created in the 'appointments' collection.
exports.createAppointmentNotification = functions.firestore
  .document('appointments/{appointmentId}')
  .onCreate(async (snapshot, context) => {
    // Get the data of the newly created appointment.
    const newAppointmentData = snapshot.data();
    const { date, time, userName, userId } = newAppointmentData;

    // Construct the notification message dynamically.
    const notificationMessage = `Hello ${userName},\n\nThis is DentEase Clinic. We just wanted to send a reminder that you have an appointment on ${date} at ${time}.`;

    // Create the new notification object.
    const notification = {
      type: 'Reminders',
      title: 'Appointment Reminder',
      message: notificationMessage,
      date: date, // Use the appointment date for the notification date
      isNew: true,
      isRead: false,
      userId: userId, // This is crucial for showing notifications to the right user
      expandedContent: {
        clinic: 'Dental Clinic',
        phoneNumber: '09481921762',
      },
      // Add a server timestamp to order notifications later.
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    try {
      // Add the new notification to a 'notifications' collection in Firestore.
      await admin.firestore().collection('notifications').add(notification);
      console.log('Successfully created notification for user:', userId);
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  });