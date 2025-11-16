// services/aiService.js
import { GoogleGenerativeAI } from '@google/generative-ai';

// IMPORTANT: Get a NEW API key from https://aistudio.google.com/app/apikey
// NEVER commit API keys to Git! Use environment variables instead
const API_KEY = 'YOUR_NEW_API_KEY_HERE'; // Replace with your NEW API key

let genAI;
let model;
let aiAvailable = false;

// Initialize the AI only if the API key is valid and not a placeholder
if (API_KEY && API_KEY !== 'YOUR_NEW_API_KEY_HERE') {
  try {
    genAI = new GoogleGenerativeAI(API_KEY);
    // Use gemini-1.5-pro - the most capable model for complex dental queries
    model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-pro",
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 1024,
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
      ],
    });
    aiAvailable = true;
    console.log('✅ Google AI initialized successfully with Gemini 1.5 Pro');
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
      { text: "Clinic Hours", value: "What are your clinic hours?" },
      { text: "Location", value: "Where is the clinic located?" },
      { text: "Our Services", value: "What services do you offer?" }
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
      { text: "Pricing List", value: "Can you show me the pricing list?" },
      { text: "Emergency Help", value: "I have a dental emergency" }
    ]
  };
};

/**
 * Gets the initial greeting message for the global chatbot
 */
export const getGlobalChatbotGreeting = () => {
  return {
    message: "Hello! 👋 I'm DENTA-BOT, your advanced dental AI assistant. I can help answer detailed questions about dental care, procedures, appointments, and services. How can I help you today?",
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
 * Enhanced conversational AI response with comprehensive dental knowledge
 */
const getConversationalAIResponse = async (message, context, contactId) => {
  // Skip AI if not available
  if (!model || !aiAvailable) {
    console.log('AI not available, using fallback responses');
    return null;
  }

  try {
    // Add a timeout to prevent hanging
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('AI request timeout')), 15000)
    );

    const prompt = `You are DENTA-BOT, an advanced AI dental assistant for Fano Dental Clinic with comprehensive knowledge about dentistry, oral health, and dental procedures.

CLINIC INFORMATION:
- Name: Fano Dental Clinic
- Phone: 0917-817-4927
- Location: Liloan, Cebu, Philippines
- Hours: Mon-Sat: 9:00 AM - 5:00 PM, Sunday: 1:00 PM - 4:00 PM

SERVICES & PRICING:
- Consultation: ₱500
- Oral Prophylaxis (Cleaning): ₱800-2,500
- Tooth Restoration (Fillings): ₱1,000-2,500
- Tooth Extraction: ₱500+
- Orthodontics (Braces): Available
- Teeth Whitening: ₱500+
- Dental Crowns, Bridges, Dentures: Available
- Root Canal Treatment: Available
- Pediatric Dentistry: Available

PREVIOUS CONVERSATION CONTEXT:
${context}

CURRENT USER MESSAGE: 
"${message}"

YOUR ROLE & CAPABILITIES:
1. Answer ANY dental-related question with accuracy and detail
2. Explain dental procedures, conditions, treatments
3. Provide oral health advice and preventive care tips
4. Help with appointment booking (direct to phone)
5. Address dental emergencies with urgency
6. Explain symptoms, causes, and treatment options
7. Discuss costs, insurance, and payment options
8. Be empathetic, professional, and reassuring

RESPONSE GUIDELINES:
- Provide detailed, accurate dental information
- Use medical terminology but explain it simply
- Be conversational yet professional
- Reference the conversation context naturally
- For appointments: direct to call 0917-817-4927
- For emergencies: prioritize immediate care instructions
- Keep responses focused and practical (2-4 sentences)
- Use emojis sparingly for warmth
- If you don't know something specific to this clinic, be honest but still provide general dental information

IMPORTANT MEDICAL DISCLAIMER:
- You can provide general dental information and education
- Always recommend in-person evaluation for specific diagnosis
- Never replace professional dental examination
- For serious symptoms, urge immediate professional care

Now respond to the user's message:`;

    const aiPromise = model.generateContent(prompt);
    const result = await Promise.race([aiPromise, timeoutPromise]);
    
    const response = await result.response;
    const text = response.text();

    if (text && text.trim()) {
      console.log('✅ AI Response generated successfully');
      return text.trim();
    }
    
    return null;
  } catch (error) {
    // Log the error but don't show it to users
    if (error.message && error.message.includes('503')) {
      console.warn('Google AI service temporarily unavailable, using fallback responses');
    } else if (error.message && error.message.includes('timeout')) {
      console.warn('AI request timed out, using fallback responses');
    } else if (error.message && error.message.includes('403')) {
      console.warn('API key issue detected, using fallback responses');
      aiAvailable = false; // Disable AI for future requests
    } else if (error.message && error.message.includes('429')) {
      console.warn('Rate limit exceeded, using fallback responses');
    } else {
      console.error('AI generation error:', error.message || error);
    }
    // Return null to use smart responses
    return null;
  }
};

/**
 * Enhanced smart response handler with more dental knowledge
 */
const getSmartResponse = (message, context, contactId) => {
  const lowerMessage = message.toLowerCase();
  const lowerContext = context.toLowerCase();

  // Clinic hours
  if (lowerMessage.includes('hour') || lowerMessage.includes('open') || lowerMessage.includes('close') || lowerMessage.includes('time')) {
    return "Our clinic hours are:\n🕐 Monday-Saturday: 9:00 AM - 5:00 PM\n🕐 Sunday: 1:00 PM - 4:00 PM\n\nWould you like to schedule an appointment during these hours?";
  }

  // Location
  if (lowerMessage.includes('location') || lowerMessage.includes('where') || lowerMessage.includes('address') || lowerMessage.includes('find you')) {
    return "We're located in Liloan, Cebu! 📍 For detailed directions or to schedule a visit, please call us at 0917-817-4927. We're easy to find and have convenient parking. Would you like to know our clinic hours?";
  }

  // Specific dental procedures and conditions
  if (lowerMessage.includes('cavity') || lowerMessage.includes('cavities') || lowerMessage.includes('hole in tooth')) {
    return "Cavities are tooth decay caused by bacteria and acids. We offer tooth restoration (fillings) for ₱1,000-2,500. Early treatment prevents worse damage. If you suspect a cavity, I recommend calling 0917-817-4927 to schedule an examination. Are you experiencing tooth pain or sensitivity?";
  }

  if (lowerMessage.includes('braces') || lowerMessage.includes('orthodontic') || lowerMessage.includes('straighten')) {
    return "We offer orthodontic treatment including braces to straighten teeth and correct bite issues. Treatment typically takes 1-3 years depending on your case. For a consultation and personalized treatment plan, please call us at 0917-817-4927. Would you like to know about the process or costs?";
  }

  if (lowerMessage.includes('whitening') || lowerMessage.includes('white teeth') || lowerMessage.includes('bleach')) {
    return "Professional teeth whitening is available starting at ₱500. We offer safe, effective whitening that's better than over-the-counter products. Results typically last 6-12 months with proper care. Call 0917-817-4927 to book your whitening session! Are you interested in same-day treatment?";
  }

  if (lowerMessage.includes('root canal')) {
    return "Root canal treatment saves infected or damaged teeth. We perform root canals with modern techniques to minimize discomfort. The procedure usually takes 1-2 visits. For evaluation and cost estimate, call 0917-817-4927. Are you experiencing severe tooth pain or sensitivity to hot/cold?";
  }

  if (lowerMessage.includes('extract') || lowerMessage.includes('pull tooth') || lowerMessage.includes('remove tooth')) {
    return "Tooth extraction starts at ₱500 and is performed when a tooth is too damaged to save. We use local anesthesia and provide aftercare instructions. Simple extractions are usually quick and healing takes about 1-2 weeks. Call 0917-817-4927 for an evaluation. Is this for a wisdom tooth or regular tooth?";
  }

  if (lowerMessage.includes('wisdom tooth') || lowerMessage.includes('wisdom teeth')) {
    return "Wisdom teeth often need removal if they're impacted, causing pain, or crowding other teeth. Extraction prevents future problems. We can evaluate your wisdom teeth and recommend the best course of action. Call 0917-817-4927 to schedule an examination. Are you experiencing pain or swelling?";
  }

  if (lowerMessage.includes('crown') || lowerMessage.includes('cap')) {
    return "Dental crowns cover and protect damaged teeth. They're custom-made to match your natural teeth and can last 10-15 years with proper care. We offer various crown materials. Call 0917-817-4927 for a consultation and cost estimate. Do you have a broken or severely decayed tooth?";
  }

  if (lowerMessage.includes('denture') || lowerMessage.includes('false teeth')) {
    return "We provide full and partial dentures to replace missing teeth. Modern dentures look natural and restore function. The process involves several visits for fitting and adjustments. Call 0917-817-4927 for a consultation and personalized quote. Are you missing multiple teeth?";
  }

  if (lowerMessage.includes('gum') || lowerMessage.includes('bleeding gums') || lowerMessage.includes('gingivitis')) {
    return "Bleeding or swollen gums may indicate gum disease (gingivitis or periodontitis). Professional cleaning (₱800-2,500) and improved oral hygiene usually resolve early-stage gum disease. Don't ignore this - it can lead to tooth loss. Call 0917-817-4927 for evaluation. Are your gums bleeding when you brush?";
  }

  if (lowerMessage.includes('toothache') || lowerMessage.includes('tooth pain') || lowerMessage.includes('teeth hurt')) {
    return "Toothaches can indicate cavities, infection, or other issues. Don't wait - tooth pain usually gets worse. Call 0917-817-4927 immediately for an emergency appointment. Meanwhile, avoid hot/cold foods, take pain relievers, and use cold compress. Is the pain constant or triggered by eating/drinking?";
  }

  if (lowerMessage.includes('sensitive') || lowerMessage.includes('sensitivity')) {
    return "Tooth sensitivity to hot, cold, or sweet foods can result from worn enamel, gum recession, or cavities. Use sensitivity toothpaste and avoid acidic foods. Schedule a checkup at 0917-817-4927 to identify the cause. We can provide treatments like fluoride or desensitizing agents. How long have you had this sensitivity?";
  }

  if (lowerMessage.includes('child') || lowerMessage.includes('kid') || lowerMessage.includes('pediatric')) {
    return "We provide pediatric dental care for children! Early dental visits (by age 1) establish good habits. We make visits fun and comfortable for kids. Services include cleanings, fluoride treatments, and cavity prevention. Call 0917-817-4927 to schedule your child's appointment. How old is your child?";
  }

  // Handle "Yes" responses based on context
  if (lowerMessage.includes('yes') || lowerMessage.includes('please') || lowerMessage.includes('pls') || lowerMessage === 'y') {
    if (lowerContext.includes('appointment') || lowerContext.includes('schedule') || lowerContext.includes('book')) {
      return "Great! I'd love to help you schedule an appointment. Please call us at 0917-817-4927 to book your preferred time slot. Our staff will find the best time for you. What type of dental service do you need?";
    }
    if (lowerContext.includes('emergency') || lowerContext.includes('pain') || lowerContext.includes('urgent')) {
      return "Please call our clinic immediately at 0917-817-4927 for emergency care. If it's after hours and severe, go to the nearest emergency room. Don't delay treatment for dental emergencies. Can you describe your symptoms?";
    }
    if (lowerContext.includes('hours') || lowerContext.includes('time')) {
      return "Our hours are Mon-Sat: 9AM-5PM, Sunday: 1PM-4PM. We're closed on major holidays. Would you like to book an appointment?";
    }
    return "Yes, I'm here to help! What specific dental question or concern can I address for you today?";
  }

  // Handle "No" responses
  if (lowerMessage.includes('no') || lowerMessage.includes('not really') || lowerMessage === 'n') {
    if (lowerContext.includes('appointment')) {
      return "No problem! Is there anything else about our dental services I can help you with? I can answer questions about procedures, costs, or oral health. What would you like to know?";
    }
    return "Alright! Is there something else I can help you with regarding dental care or our clinic services?";
  }

  // Date and time questions
  if (lowerMessage.includes('date') || lowerMessage.includes('today') || lowerMessage.includes('what day')) {
    const today = new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    return `Today is ${today}. We're open ${['Sunday'].includes(new Date().toLocaleDateString('en-US', { weekday: 'long' })) ? '1PM-4PM' : '9AM-5PM'} today. Would you like to schedule an appointment?`;
  }

  // Appointment related
  if (lowerMessage.includes('appointment') || lowerMessage.includes('schedule') || lowerMessage.includes('book') || lowerMessage.includes('visit')) {
    return "I'd be happy to help you schedule an appointment! Please call us directly at 0917-817-4927 to book your visit. Our friendly staff will find the perfect time slot for you. What type of dental service do you need - cleaning, checkup, or something specific?";
  }

  // Emergency responses
  if (lowerMessage.includes('pain') || lowerMessage.includes('emergency') || lowerMessage.includes('hurt') || lowerMessage.includes('urgent')) {
    return "🚨 This sounds urgent! Please call our clinic right away at 0917-817-4927 for immediate assistance. If it's severe pain, swelling, or after hours, don't wait - seek emergency dental care. Can you describe what's happening?";
  }

  // Services and pricing
  if (lowerMessage.includes('service') || lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('how much')) {
    return "We offer comprehensive dental services:\n\n💰 Consultation: ₱500\n💰 Cleaning: ₱800-2,500\n💰 Fillings: ₱1,000-2,500\n💰 Extraction: ₱500+\n💰 Whitening: ₱500+\n💰 Braces, Crowns, Root Canals: Available\n\nWhich service would you like to know more about?";
  }

  // Dental care tips
  if (lowerMessage.includes('tips') || lowerMessage.includes('care') || lowerMessage.includes('brush') || lowerMessage.includes('maintain') || lowerMessage.includes('prevent')) {
    return "Essential dental care tips:\n\n🦷 Brush twice daily for 2 minutes with fluoride toothpaste\n🧵 Floss daily to remove plaque between teeth\n🧽 Use antibacterial mouthwash\n📅 Visit us every 6 months for professional cleaning\n🍬 Limit sugary/acidic foods and drinks\n💧 Drink plenty of water\n🚭 Avoid tobacco\n\nNeed specific advice on any of these?";
  }

  // Insurance
  if (lowerMessage.includes('insurance') || lowerMessage.includes('coverage') || lowerMessage.includes('philhealth')) {
    return "For questions about insurance coverage, payment plans, or PhilHealth acceptance, please call us at 0917-817-4927. Our staff can provide detailed information about payment options and help maximize your benefits. Do you have specific insurance questions?";
  }

  // Greetings
  if (lowerMessage.includes('hi') || lowerMessage.includes('hello') || lowerMessage.includes('hey') || lowerMessage.includes('good morning') || lowerMessage.includes('good afternoon')) {
    return "Hello! 👋 I'm DENTA-BOT, your friendly dental AI assistant. I can help with dental questions, appointment scheduling, and information about our services at Fano Dental Clinic. What can I help you with today?";
  }

  // Thanks
  if (lowerMessage.includes('thank') || lowerMessage.includes('thanks') || lowerMessage.includes('appreciate')) {
    return "You're very welcome! 😊 I'm always happy to help with dental questions and clinic information. Your oral health is important to us. Is there anything else you'd like to know?";
  }

  // Goodbye
  if (lowerMessage.includes('bye') || lowerMessage.includes('goodbye') || lowerMessage.includes('see you')) {
    return "Goodbye! Take care of your smile! 😊 Remember to brush, floss, and schedule regular checkups. Feel free to reach out anytime you have dental questions. Have a wonderful day!";
  }

  // Default fallback - more conversational
  return "I'm here to help with any dental-related questions! I can provide information about:\n\n• Dental procedures and treatments\n• Oral health and preventive care\n• Symptoms and conditions\n• Clinic hours, location, and pricing\n• Appointment scheduling\n\nWhat would you like to know about dental care or our clinic services?";
};

/**
 * Checks if a message needs immediate doctor attention
 */
export const needsDoctorAttention = (message) => {
  const urgentKeywords = [
    'emergency', 'urgent', 'severe pain', 'bleeding heavily',
    'knocked out', 'broken tooth', 'swollen face', 'fever',
    "can't open mouth", 'extreme pain', 'trauma', 'accident',
    'unbearable', 'excruciating', 'pus', 'abscess', 'infection spreading'
  ];
  
  const lowerMessage = message.toLowerCase();
  return urgentKeywords.some(keyword => lowerMessage.includes(keyword));
};

/**
 * Main AI response function with improved conversation flow
 */
export const getAIResponse = async (message, contactId, conversationHistory = '') => {
  try {
    // Handle emergency cases first with extra urgency
    if (needsDoctorAttention(message)) {
      return "🚨 DENTAL EMERGENCY! Please call our clinic IMMEDIATELY at 0917-817-4927 for urgent care. If it's after hours or life-threatening (difficulty breathing/swallowing, uncontrolled bleeding), go to the nearest emergency room NOW. Don't wait - dental emergencies require immediate attention!";
    }

    // Try conversational AI first for detailed responses
    const aiResponse = await getConversationalAIResponse(message, conversationHistory, contactId);
    if (aiResponse) {
      return aiResponse;
    }

    // Fall back to enhanced smart responses (comprehensive dental knowledge)
    return getSmartResponse(message, conversationHistory, contactId);

  } catch (error) {
    console.error('AI Service Error:', error);
    // Even if everything fails, provide a helpful response
    return getSmartResponse(message, conversationHistory, contactId);
  }
};