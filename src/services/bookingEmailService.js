// bookingEmailService.js - Add this to your React Native app services

const API_BASE_URL = 'http://localhost:5000/api'; // Change to your deployed URL

export const bookingEmailService = {
  
  // Test if backend is connected
  testConnection: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error('Backend connection failed');
      }
      
      console.log('✅ Backend connected:', result);
      return result;
    } catch (error) {
      console.error('❌ Backend connection failed:', error);
      return null;
    }
  },

  // This will be called by admin to send confirmation email
  // But you can also use it in app if needed (like for testing)
  sendConfirmationEmail: async (bookingId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/confirm-booking`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bookingId }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send confirmation email');
      }

      return result;
    } catch (error) {
      console.error('Error sending confirmation email:', error);
      throw error;
    }
  },

  // Send notification to user (can be used by app or admin)
  sendNotificationToUser: async (userEmail, subject, message, bookingData = null) => {
    try {
      const response = await fetch(`${API_BASE_URL}/send-notification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          userEmail, 
          subject, 
          message, 
          bookingData 
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send notification');
      }

      return result;
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  },

  // Request appointment reminder (can be called by app)
  requestAppointmentReminder: async (userEmail, appointmentData) => {
    try {
      const reminderMessage = `
        This is a friendly reminder about your upcoming dental appointment.
        
        Please arrive 15 minutes early for check-in.
        If you need to reschedule, please contact us as soon as possible.
        
        We look forward to seeing you!
      `;

      const result = await bookingEmailService.sendNotificationToUser(
        userEmail,
        'Appointment Reminder - DentEase',
        reminderMessage,
        appointmentData
      );

      return result;
    } catch (error) {
      console.error('Error sending reminder:', error);
      throw error;
    }
  }
};