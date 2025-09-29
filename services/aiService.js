// services/aiService.js
import { GoogleGenerativeAI } from '@google/generative-ai';

// Replace this with your actual API key
const API_KEY = 'AIzaSyBi5X7hzgio1I114_XlqzTPV12Bsg8G0y8';

let genAI;
let model;
let aiAvailable = false;

// Initialize the AI only if the API key is valid and not a placeholder
if (API_KEY && API_KEY !== 'YOUR_API_KEY_HERE') {
  try {
    genAI = new GoogleGenerativeAI(API_KEY);
    // Use Gemini 2.5 Flash - the best stable model for chatbots (Sept 2025)
    model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    aiAvailable = true;
    console.log('✅ Google AI initialized successfully with Gemini 2.5 Flash');
  } catch (error) {
    console.warn('Failed to initialize Google AI:', error);
    aiAvailable = false;
  }
}

/**
 * Gets the initial greeting message when Dr. Jessica is clicked
 */
export const getDrJessicaGreeting = () => {
  return {
    message: "Hello! 👋 I'm Dr. Jessica's AI assistant. I'm here to help answer your dental questions and provide information about our clinic. How can I assist you today?",
    showButtons: true,
    buttons: [
      { text: "Clinic Hours", value: "Clinic hours" },
      { text: "Location", value: "Location" },
      { text: "Our Services", value: "Our services" }
    ]
  };
};

/**
 * Gets the initial greeting message when Jane Sy is clicked
 */
export const getJaneSyGreeting = () => {
  return {
    message: "Hi! 👋 I'm Jane Sy's AI assistant from Fano Dental Clinic. I can help with appointments and dental inquiries. How may I help you today?",
    showButtons: true,
    buttons: [
      { text: "Book Appointment", value: "I would like to book an appointment" },
      { text: "Pricing List", value: "pricing list" },
      { text: "Emergency Help", value: "I have a dental emergency" }
    ]
  };
};

/**
 * Gets the initial greeting message for the global chatbot
 */
export const getGlobalChatbotGreeting = () => {
  return {
    message: "Hello! 👋 I'm DENTA-BOT, your dental AI assistant. I can help answer questions about dental care, appointments, and services. How can I help you today?",
    showButtons: true,
    buttons: [
      { text: "Dental Care Tips", value: "Give me dental care tips" },
      { text: "Services & Pricing", value: "What services do you offer?" },
      { text: "Emergency Help", value: "I have a dental emergency" },
      { text: "Book Appointment", value: "I want to book an appointment" }
    ]
  };
};

/**
 * Enhanced conversational AI response that maintains context
 * Now with timeout and better error handling
 */
const getConversationalAIResponse = async (message, context, contactId) => {
  // Skip AI if not available or if we know it's down
  if (!model || !aiAvailable) {
    return null;
  }

  try {
    // Add a timeout to prevent hanging
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('AI request timeout')), 8000)
    );

    const prompt = `You are DENTA-BOT, a friendly dental AI assistant for Fano Dental Clinic. 

CLINIC INFO:
- Phone: 0917-817-4927
- Location: Liloan, Cebu
- Services: Cleaning (₱800-2500), Consultation (₱500), Fillings (₱1000-2500), etc.

CONVERSATION CONTEXT:
${context}

Current User Message: "${message}"

Instructions:
- Respond naturally and conversationally
- Keep responses concise (2-3 sentences max)
- Reference previous conversation when relevant
- For appointments, direct to phone number
- For emergencies, prioritize immediate care
- Be helpful and engaging

Response:`;

    const aiPromise = model.generateContent(prompt);
    const result = await Promise.race([aiPromise, timeoutPromise]);
    
    const response = await result.response;
    const text = response.text();

    return text && text.trim() ? text.trim() : null;
  } catch (error) {
    // Log the error but don't show it to users
    if (error.message && error.message.includes('503')) {
      console.warn('Google AI service temporarily unavailable, using fallback responses');
    } else if (error.message && error.message.includes('timeout')) {
      console.warn('AI request timed out, using fallback responses');
    } else {
      console.error('AI generation error:', error.message || error);
    }
    // Return null to use smart responses
    return null;
  }
};

/**
 * Smart response handler that provides contextual answers
 */
const getSmartResponse = (message, context, contactId) => {
  const lowerMessage = message.toLowerCase();
  const lowerContext = context.toLowerCase();

  // Clinic hours
  if (lowerMessage.includes('hour') || lowerMessage.includes('open') || lowerMessage.includes('close')) {
    return "Our clinic hours are:\n🕐 Monday-Saturday: 9:00 AM - 5:00 PM\n🕐 Sunday: 1:00 PM - 4:00 PM\n\nWould you like to book an appointment?";
  }

  // Location
  if (lowerMessage.includes('location') || lowerMessage.includes('where') || lowerMessage.includes('address')) {
    return "We're located in Liloan, Cebu! 📍 For detailed directions or to schedule a visit, please call us at 0917-817-4927. Would you like to know our clinic hours?";
  }

  // Handle "Yes" responses based on context
  if (lowerMessage.includes('yes') || lowerMessage.includes('please') || lowerMessage.includes('pls')) {
    if (lowerContext.includes('appointment') || lowerContext.includes('schedule')) {
      return "Great! I'd love to help you schedule an appointment. Please call us at 0917-817-4927 to book your preferred time slot. What type of appointment do you need - a routine cleaning, checkup, or something specific?";
    }
    if (lowerContext.includes('dental care tips') || lowerContext.includes('tips')) {
      return "Perfect! Here are key dental care tips: Brush twice daily with fluoride toothpaste, floss every day, use mouthwash, and visit us every 6 months for cleanings. Also, limit sugary foods and drinks. Which of these would you like me to explain more?";
    }
    if (lowerContext.includes('services') || lowerContext.includes('pricing')) {
      return "Excellent! We offer comprehensive dental services including cleanings (₱800-2500), consultations (₱500), fillings (₱1000-2500), extractions, braces, and whitening. What specific service interests you most?";
    }
    if (lowerContext.includes('emergency')) {
      return "I understand this is urgent. Please call our clinic immediately at 0917-817-4927 for emergency care. If it's after hours, seek immediate dental care. Can you describe your symptoms?";
    }
    return "Yes, I'm here to help! What specific dental question can I answer for you today?";
  }

  // Handle "No" responses
  if (lowerMessage.includes('no') || lowerMessage.includes('not really')) {
    if (lowerContext.includes('appointment')) {
      return "No problem! Is there anything else about our dental services I can help you with? Maybe you'd like to know about our treatments or have other dental questions?";
    }
    return "Alright! Is there something else I can help you with regarding dental care or our clinic services?";
  }

  // Date and time questions
  if (lowerMessage.includes('date') || lowerMessage.includes('today')) {
    const today = new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    return `Today is ${today}. Are you looking to schedule an appointment for today or another day?`;
  }

  // Appointment related
  if (lowerMessage.includes('appointment') || lowerMessage.includes('schedule') || lowerMessage.includes('book')) {
    return "I'd be happy to help you schedule an appointment! Please call us directly at 0917-817-4927 to book your visit. Our hours are Mon-Sat: 9AM-5PM, Sunday: 1PM-4PM. What type of appointment do you need?";
  }

  // Emergency responses
  if (lowerMessage.includes('pain') || lowerMessage.includes('emergency') || lowerMessage.includes('hurt')) {
    return "This sounds urgent! Please call our clinic right away at 0917-817-4927 for immediate assistance. If it's severe pain or after hours, don't wait - seek emergency dental care. Can you describe what's happening?";
  }

  // Services and pricing
  if (lowerMessage.includes('service') || lowerMessage.includes('price') || lowerMessage.includes('cost')) {
    return "We offer many dental services! Our most popular are:\n\n💰 Consultation: ₱500\n💰 Cleaning: ₱800-2500\n💰 Fillings: ₱1000-2500\n💰 Extractions: ₱500\n💰 Whitening: ₱500\n\nWhich service would you like to know more about?";
  }

  // Dental care tips
  if (lowerMessage.includes('tips') || lowerMessage.includes('care') || lowerMessage.includes('brush') || lowerMessage.includes('clean')) {
    return "Here are essential dental care tips:\n\n🦷 Brush twice daily with fluoride toothpaste\n🧵 Floss every day\n🧽 Use antibacterial mouthwash\n📅 Visit us every 6 months\n🍬 Limit sugary drinks and snacks\n\nNeed specific advice on any of these?";
  }

  // Greetings
  if (lowerMessage.includes('hi') || lowerMessage.includes('hello') || lowerMessage.includes('hey')) {
    return "Hello! 👋 I'm DENTA-BOT, your friendly dental assistant. I'm here to help with appointments, dental questions, and information about our services. What can I help you with today?";
  }

  // Thanks
  if (lowerMessage.includes('thank') || lowerMessage.includes('thanks')) {
    return "You're very welcome! 😊 I'm always happy to help with dental questions. Is there anything else about your oral health or our services you'd like to know?";
  }

  // Goodbye
  if (lowerMessage.includes('bye') || lowerMessage.includes('goodbye')) {
    return "Goodbye! Take care of your smile! 😊 Feel free to reach out anytime you have dental questions or need to schedule an appointment. Have a great day!";
  }

  // Default fallback - more conversational
  return "I'm here to help with dental care questions, appointment scheduling, and information about Fano Dental Clinic's services. Could you please tell me more about what you'd like to know? For example, you can ask about:\n\n• Clinic hours and location\n• Services and pricing\n• Dental care tips\n• Booking an appointment";
};

/**
 * Checks if a message needs immediate doctor attention
 */
export const needsDoctorAttention = (message) => {
  const urgentKeywords = [
    'emergency', 'urgent', 'severe pain', 'bleeding heavily',
    'knocked out', 'broken tooth', 'swollen face', 'fever',
    "can't open mouth", 'extreme pain', 'trauma', 'accident'
  ];
  
  const lowerMessage = message.toLowerCase();
  return urgentKeywords.some(keyword => lowerMessage.includes(keyword));
};

/**
 * Main AI response function with improved conversation flow
 */
export const getAIResponse = async (message, contactId, conversationHistory = '') => {
  try {
    // Handle emergency cases first
    if (needsDoctorAttention(message)) {
      return "🚨 This sounds like a dental emergency! Please call our clinic immediately at 0917-817-4927 for urgent care. If it's after hours, seek emergency dental treatment right away.";
    }

    // Try conversational AI first (but don't let it block the response)
    const aiResponse = await getConversationalAIResponse(message, conversationHistory, contactId);
    if (aiResponse) {
      return aiResponse;
    }

    // Fall back to smart predefined responses (always works)
    return getSmartResponse(message, conversationHistory, contactId);

  } catch (error) {
    console.error('AI Service Error:', error);
    // Even if everything fails, provide a helpful response
    return getSmartResponse(message, conversationHistory, contactId);
  }
};