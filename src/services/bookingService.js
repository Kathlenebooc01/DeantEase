// bookingService.js - API service for email notifications

const API_BASE_URL = 'http://localhost:5000/api';

export const bookingService = {
  
  // Test email configuration
  testEmailConfig: async () => {
    try {
      console.log('🧪 Testing email configuration...');
      
      const response = await fetch(`${API_BASE_URL}/test-email`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.details || result.error || 'Email test failed');
      }

      console.log('✅ Email test successful:', result);
      return result;
      
    } catch (error) {
      console.error('❌ Email test error:', error);
      throw error;
    }
  },

  // Confirm booking and send email
  confirmBooking: async (bookingId) => {
    try {
      console.log('📝 Confirming booking:', bookingId);
      
      const response = await fetch(`${API_BASE_URL}/confirm-booking`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bookingId }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.details || result.error || 'Failed to confirm booking');
      }

      console.log('✅ Booking confirmed successfully:', result);
      return result;
      
    } catch (error) {
      console.error('❌ Booking confirmation error:', error);
      throw error;
    }
  },

  // Send custom notification
  sendCustomNotification: async (userEmail, subject, message, bookingData = null) => {
    try {
      console.log('📧 Sending custom notification to:', userEmail);
      
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
        throw new Error(result.details || result.error || 'Failed to send notification');
      }

      console.log('✅ Notification sent successfully:', result);
      return result;
      
    } catch (error) {
      console.error('❌ Notification sending error:', error);
      throw error;
    }
  },

  // Check server health
  checkServerHealth: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error('Server health check failed');
      }
      
      return result;
    } catch (error) {
      console.error('❌ Server health check failed:', error);
      throw error;
    }
  }
};