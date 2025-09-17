// services/aiService.js
import { GoogleGenerativeAI } from '@google/generative-ai';

// Replace this with your actual API key
const API_KEY = 'AIzaSyBi5X7hzgio1I114_XlqzTPV12Bsg8G0y8';

let genAI;
let model;

// Initialize the AI only if the API key is valid and not a placeholder
if (API_KEY && API_KEY !== 'YOUR_API_KEY_HERE') {
  try {
    genAI = new GoogleGenerativeAI(API_KEY);
    // Try the newer model names first, falling back to older ones
    try {
      model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    } catch {
      try {
        model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
      } catch {
        model = genAI.getGenerativeModel({ model: "gemini-pro" });
      }
    }
  } catch (error) {
    console.warn('Failed to initialize Google AI:', error);
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
 */
const getConversationalAIResponse = async (message, context, contactId) => {
  if (!model) return null;

  try {
    // Shorter, more focused prompt for better conversation flow
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

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return text && text.trim() ? text.trim() : null;
  } catch (error) {
    console.error('AI generation error:', error);
    return null;
  }
};

/**
 * Smart response handler that provides contextual answers
 */
const getSmartResponse = (message, context, contactId) => {
  const lowerMessage = message.toLowerCase();
  const lowerContext = context.toLowerCase();

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
    return "We offer many dental services! Our most popular are: Consultation (₱500), Cleaning (₱800-2500), Fillings (₱1000-2500), Extractions (₱500), and Whitening (₱500). Which service would you like to know more about?";
  }

  // Dental care tips
  if (lowerMessage.includes('tips') || lowerMessage.includes('care') || lowerMessage.includes('brush') || lowerMessage.includes('clean')) {
    return "Here are essential dental care tips: 🦷 Brush twice daily with fluoride toothpaste, 🧵 floss every day, 🧽 use antibacterial mouthwash, and 📅 visit us every 6 months. Also, limit sugary drinks and snacks! Need specific advice on any of these?";
  }

  // Greetings
  if (lowerMessage.includes('hi') || lowerMessage.includes('hello') || lowerMessage.includes('hey')) {
    return "Hello! I'm DENTA-BOT, your friendly dental assistant. I'm here to help with appointments, dental questions, and information about our services. What can I help you with today?";
  }

  // Thanks
  if (lowerMessage.includes('thank') || lowerMessage.includes('thanks')) {
    return "You're very welcome! I'm always happy to help with dental questions. Is there anything else about your oral health or our services you'd like to know?";
  }

  // Default fallback - more conversational
  return "I understand you're asking about that. As your dental AI assistant, I'm here to help with dental care questions, appointment scheduling, and information about our services at Fano Dental Clinic. What specifically would you like to know about dental health or our clinic?";
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
      return "This sounds like a dental emergency! Please call our clinic immediately at 0917-817-4927 for urgent care. If it's after hours, seek emergency dental treatment right away.";
    }

    // Try conversational AI first
    const aiResponse = await getConversationalAIResponse(message, conversationHistory, contactId);
    if (aiResponse) {
      return aiResponse;
    }

    // Fall back to smart predefined responses
    return getSmartResponse(message, conversationHistory, contactId);

  } catch (error) {
    console.error('AI Service Error:', error);
    return "I'm having a brief technical issue. Please call our clinic at 0917-817-4927 for immediate assistance, or try asking your question again.";
  }
};