const express = require('express');
const nodemailer = require('nodemailer');
const admin = require('firebase-admin');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Firebase Admin SDK
const serviceAccount = require('./firebase-service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: process.env.FIREBASE_PROJECT_ID || 'dentease-app'
});

const db = admin.firestore();

// Configure Nodemailer with Gmail
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD
  }
});

// Verify email configuration on startup
transporter.verify((error, success) => {
  if (error) {
    console.log('❌ Email configuration error:', error);
  } else {
    console.log('✅ Email server is ready to send messages');
  }
});

// Email template for booking confirmation
const createBookingConfirmationEmail = (bookingData, userEmail) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return {
    from: `"DentEase Clinic" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: '✅ Your Dental Appointment is Confirmed - DentEase',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; }
          .booking-details { background: #f8f9ff; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; }
          .status-confirmed { color: #16a34a; font-weight: bold; font-size: 18px; }
          .important-info { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; font-size: 14px; }
          .btn { background: #667eea; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🦷 DentEase Clinic</h1>
            <h2>Appointment Confirmed!</h2>
          </div>
          
          <div class="content">
            <p>Dear <strong>${bookingData.patientName || 'Patient'}</strong>,</p>
            
            <p>Great news! Your dental appointment has been <span class="status-confirmed">CONFIRMED</span> by our admin team.</p>
            
            <div class="booking-details">
              <h3>📅 Your Appointment Details:</h3>
              <p><strong>Booking ID:</strong> #${bookingData.id}</p>
              <p><strong>Patient Name:</strong> ${bookingData.patientName || 'Not specified'}</p>
              <p><strong>Service:</strong> ${bookingData.service || 'General Consultation'}</p>
              <p><strong>Date:</strong> ${formatDate(bookingData.date)}</p>
              <p><strong>Time:</strong> ${bookingData.time || 'Not specified'}</p>
              <p><strong>Phone:</strong> ${bookingData.phone || 'Not provided'}</p>
              ${bookingData.notes ? `<p><strong>Notes:</strong> ${bookingData.notes}</p>` : ''}
            </div>

            <div class="important-info">
              <h4>🔔 Important Reminders:</h4>
              <ul>
                <li><strong>Arrive 15 minutes early</strong> for check-in and paperwork</li>
                <li>Bring a <strong>valid ID</strong> and insurance information (if applicable)</li>
                <li>If you need to reschedule, please contact us <strong>at least 24 hours</strong> in advance</li>
                <li>For emergencies, call our clinic directly</li>
              </ul>
            </div>

            <p>We look forward to seeing you at your appointment. If you have any questions or concerns, please don't hesitate to contact us.</p>
            
            <div style="text-align: center;">
              <a href="tel:+1234567890" class="btn">📞 Call Clinic</a>
            </div>
          </div>

          <div class="footer">
            <p><strong>DentEase Dental Clinic</strong></p>
            <p>📧 Email: ${process.env.EMAIL_USER}</p>
            <p>📱 Phone: (123) 456-7890</p>
            <p>📍 Address: Your Clinic Address Here</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 15px 0;">
            <p style="font-size: 12px; color: #999;">
              This is an automated message. Please do not reply to this email.
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  };
};

// API Routes

// 1. Test email configuration
app.get('/api/test-email', async (req, res) => {
  try {
    console.log('🧪 Testing email configuration...');
    
    const testEmail = {
      from: `"DentEase Test" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // send to yourself
      subject: '🧪 DentEase Email Test - Configuration Working!',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background: #f0f9ff; border-radius: 10px;">
          <h2 style="color: #0ea5e9;">✅ Email Configuration Test Successful!</h2>
          <p>If you're reading this, your Nodemailer configuration is working perfectly!</p>
          <p><strong>Test performed at:</strong> ${new Date().toLocaleString()}</p>
          <p><strong>From:</strong> ${process.env.EMAIL_USER}</p>
          <div style="background: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="color: #16a34a; font-weight: bold;">✅ Gmail connection: Success</p>
            <p style="color: #16a34a; font-weight: bold;">✅ SMTP transport: Success</p>
            <p style="color: #16a34a; font-weight: bold;">✅ Email sending: Success</p>
          </div>
          <p>Your DentEase email notification system is ready! 🚀</p>
        </div>
      `
    };

    await transporter.sendMail(testEmail);
    console.log('✅ Test email sent successfully!');
    
    res.json({ 
      success: true, 
      message: 'Test email sent successfully! Check your inbox.',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Email test failed:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Email test failed', 
      details: error.message 
    });
  }
});

// 2. Confirm booking and send email
app.post('/api/confirm-booking', async (req, res) => {
  try {
    const { bookingId } = req.body;
    console.log(`📝 Processing booking confirmation for ID: ${bookingId}`);

    if (!bookingId) {
      return res.status(400).json({ error: 'Booking ID is required' });
    }

    // Get booking from Firestore
    const bookingRef = db.collection('bookings').doc(bookingId);
    const bookingDoc = await bookingRef.get();

    if (!bookingDoc.exists) {
      console.log('❌ Booking not found:', bookingId);
      return res.status(404).json({ error: 'Booking not found' });
    }

    const bookingData = { id: bookingDoc.id, ...bookingDoc.data() };
    console.log('📋 Booking data retrieved:', bookingData.patientName, bookingData.service);

    // Update booking status in Firestore
    await bookingRef.update({
      status: 'confirmed',
      confirmedAt: admin.firestore.FieldValue.serverTimestamp(),
      confirmedBy: 'admin'
    });
    console.log('✅ Booking status updated to confirmed');

    // Get user email
    let userEmail = '';
    
    // Try to get email from user document if userId exists
    if (bookingData.userId) {
      try {
        const userDoc = await db.collection('users').doc(bookingData.userId).get();
        if (userDoc.exists && userDoc.data().email) {
          userEmail = userDoc.data().email;
        }
      } catch (error) {
        console.log('⚠️ Could not fetch user email from users collection:', error.message);
      }
    }
    
    // Fallback to email field in booking document
    if (!userEmail && bookingData.email) {
      userEmail = bookingData.email;
    }

    if (!userEmail) {
      console.log('❌ No email found for booking:', bookingId);
      return res.status(400).json({ error: 'User email not found in booking data' });
    }

    console.log('📧 Sending confirmation email to:', userEmail);

    // Send confirmation email
    const emailOptions = createBookingConfirmationEmail(bookingData, userEmail);
    const emailResult = await transporter.sendMail(emailOptions);
    
    console.log('✅ Confirmation email sent successfully!');
    console.log('📧 Message ID:', emailResult.messageId);

    res.json({ 
      success: true, 
      message: 'Booking confirmed and confirmation email sent successfully!',
      bookingId: bookingId,
      emailSent: true,
      userEmail: userEmail,
      messageId: emailResult.messageId
    });

  } catch (error) {
    console.error('❌ Error in confirm-booking:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to confirm booking and send email', 
      details: error.message 
    });
  }
});

// 3. Send custom notification email
app.post('/api/send-notification', async (req, res) => {
  try {
    const { userEmail, subject, message, bookingData } = req.body;
    console.log('📧 Sending custom notification to:', userEmail);

    if (!userEmail || !subject || !message) {
      return res.status(400).json({ error: 'Email, subject, and message are required' });
    }

    const emailOptions = {
      from: `"DentEase Clinic" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: `🔔 ${subject} - DentEase`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; }
            .notification-box { background: #f0f9ff; border: 1px solid #0ea5e9; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .booking-info { background: #f8f9ff; padding: 15px; border-radius: 5px; margin: 15px 0; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🦷 DentEase Clinic</h1>
              <h2>Important Notification</h2>
            </div>
            
            <div class="content">
              <div class="notification-box">
                <h3>🔔 ${subject}</h3>
                <p>${message}</p>
              </div>
              
              ${bookingData ? `
                <div class="booking-info">
                  <h4>📅 Related Appointment Details:</h4>
                  <p><strong>Service:</strong> ${bookingData.service || 'Not specified'}</p>
                  <p><strong>Date:</strong> ${bookingData.date || 'Not specified'}</p>
                  <p><strong>Time:</strong> ${bookingData.time || 'Not specified'}</p>
                </div>
              ` : ''}

              <p>If you have any questions or concerns, please don't hesitate to contact us.</p>
            </div>

            <div class="footer">
              <p><strong>DentEase Dental Clinic</strong></p>
              <p>📧 Email: ${process.env.EMAIL_USER}</p>
              <p>This is an automated message from DentEase Clinic.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const result = await transporter.sendMail(emailOptions);
    console.log('✅ Custom notification sent successfully!');
    
    res.json({ 
      success: true, 
      message: 'Notification email sent successfully',
      messageId: result.messageId
    });

  } catch (error) {
    console.error('❌ Error sending notification:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to send notification email',
      details: error.message
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'Server is running!', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Start server
app.listen(PORT, () => {
  console.log('\n🚀 DentEase Backend Server Started!');
  console.log(`📡 Server running on: http://localhost:${PORT}`);
  console.log(`📧 Email configured for: ${process.env.EMAIL_USER}`);
  console.log(`🔗 Test email endpoint: http://localhost:${PORT}/api/test-email`);
  console.log('='.repeat(50));
});