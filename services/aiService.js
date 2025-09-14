// services/aiService.js
import { GoogleGenerativeAI } from '@google/generative-ai';

// Replace this with your actual API key
const API_KEY = 'AIzaSyBi5X7hzgio1I114_XlqzTPV12Bsg8G0y8';

let genAI;
let model;

// Initialize the AI only if the API key is valid and not a placeholder
if (API_KEY && API_KEY !== 'AIzaSyBi5X7hzgio1I114_XlqzTPV12Bsg8G0y8') {
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
 * @returns {object} Contains the greeting message and button options
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
 * @returns {object} Contains the greeting message and button options
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
 * @returns {object} Contains the greeting message and button options
 */
export const getGlobalChatbotGreeting = () => {
  return {
    message: "Hello! 👋 I'm your dental AI assistant from Fano Dental Clinic. I can help answer questions about dental care, appointments, services, and provide general oral health guidance. How can I help you today?",
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
 * Provides a predefined dental response when the Google AI is unavailable.
 * This function handles common keywords and phrases with flexible matching.
 * @param {string} message The user's input message.
 * @param {string} contactId The contact ID to personalize responses.
 * @returns {string} A predefined response based on keywords.
 */
const getDentalResponse = (message, contactId = 'general') => {
  const lowerMessage = message.toLowerCase();

  // --- BUTTON-CLICK AND PRICE LIST RESPONSES ---
  // These responses are triggered by specific keywords from the UI or user input.
  if (lowerMessage.includes('clinic hours')) {
    return `Fano Dental Clinic Liloan – Clinic Hours\n\nMonday: 9:00 AM – 5:00 PM\nTuesday: 9:00 AM – 5:00 PM\nWednesday: 9:00 AM – 5:00 PM\nThursday: 9:00 AM – 5:00 PM\nFriday: 9:00 AM – 5:00 PM\nSaturday: 9:00 AM – 5:00 PM\nSunday: 1:00 PM – 4:00 PM`;
  }

  if (lowerMessage.includes('location')) {
    return "You can find us at 961 Consolacion-Tayud-Liloan Rd. Landing Catarman Liloan, Cebu, Liloan, Philippines. We look forward to seeing you!";
  }

  if (lowerMessage.includes('our services') || lowerMessage.includes('full services') || lowerMessage.includes('what services do you offer')) {
    return `🦷 At Fano Dental Clinic, we offer:\n\n• Cleaning & Fillings\n• Extractions & Root Canal\n• Braces & Retainers\n• Teeth Whitening\n• Dentures\n• Dental Crowns\n\nFor detailed options, you can ask me about a specific service or visit our website for more information.`;
  }
  
  // New logic for displaying the complete pricing list
  if (lowerMessage.includes('pricing list')) {
    return `Here is our complete pricing list:\n\n• Consultation: ₱500\n• Cleaning: ₱800 - ₱2,500\n• Filling: ₱1,000 - ₱2,500\n• Fluoride/Sealant: ₱500 each\n• Root Canal/Extraction: ₱500 each\n• Braces/Whitening: ₱500 each\n• Other procedures: ₱500\n\nFor detailed pricing, insurance coverage, and payment plans, please contact our front desk team.`;
  }

  // Dental care tips response
  if (lowerMessage.includes('give me dental care tips') || lowerMessage.includes('dental care tips') || lowerMessage.includes('oral health tips')) {
    return `Here are essential dental care tips:\n\n🦷 Daily Care:\n• Brush twice daily with fluoride toothpaste\n• Floss daily between all teeth\n• Use antibacterial mouthwash\n• Replace your toothbrush every 3-4 months\n\n🍎 Diet Tips:\n• Limit sugary and acidic foods\n• Drink plenty of water\n• Eat calcium-rich foods\n\n📅 Regular Care:\n• Visit for cleanings every 6 months\n• Don't ignore tooth pain or sensitivity\n• Quit smoking for better oral health`;
  }

  // --- GENERAL RESPONSES (your existing logic) ---
  
  // Math questions - simple calculator with flexible matching
  const mathMatch = lowerMessage.match(/^(\d+)\s*([\+\-\*\/])\s*(\d+)$/);
  if (mathMatch) {
    const num1 = parseInt(mathMatch[1]);
    const operator = mathMatch[2];
    const num2 = parseInt(mathMatch[3]);
    let result;
    
    switch (operator) {
      case '+': result = num1 + num2; break;
      case '-': result = num1 - num2; break;
      case '*': result = num1 * num2; break;
      case '/': result = num2 !== 0 ? num1 / num2 : "Cannot divide by zero"; break;
      default: return "Sorry, I can only perform basic arithmetic (+, -, *, /). Is there a dental question I can answer?";
    }
    return `${num1} ${operator} ${num2} = ${result}. Is there something else I can help you with regarding your teeth?`;
  }

  // Time/Date questions - uses includes() for flexible matching
  if (lowerMessage.includes('what time') || lowerMessage.includes('time today now') || lowerMessage.includes("what is the time ")) {
    const now = new Date();
    return `It's currently ${now.toLocaleTimeString()}. How can I help you with your dental care?`;
  }

  if (lowerMessage.includes('what date') || (lowerMessage.includes('today') && lowerMessage.includes('date')) || lowerMessage.includes("what's today's date")) {
    const now = new Date();
    return `Today is ${now.toLocaleDateString()}. Do you need to schedule a dental appointment?`;
  }
  
  // General chat responses - uses includes() for flexible matching
  if (lowerMessage.includes('how are you') || lowerMessage.includes('how r u') || lowerMessage.includes('how you doing')) {
    return "I'm doing well, thank you! I'm here and ready to help with any dental questions you might have. How are you doing today?";
  }

  if (lowerMessage.includes('thank you') || lowerMessage.includes('thanks') || lowerMessage.includes('appreciate it')) {
    return "You're very welcome! Is there anything else about dental care I can help you with today?";
  }

  if (lowerMessage.includes('bye') || lowerMessage.includes('goodbye') || lowerMessage.includes('talk to you later')) {
    return "Goodbye! Remember to brush and floss regularly. Feel free to reach out anytime you have dental questions!";
  }

  if (lowerMessage.includes('joke') || lowerMessage.includes('funny') || lowerMessage.includes('tell me a joke')) {
    const jokes = [
      "Why did the tooth go to the party? Because it wanted to have a filling good time! 😄",
      "What do you call a dentist's advice? A filling recommendation! 🦷",
      "Why don't teeth ever get lonely? Because they always stick together! 😁"
    ];
    return jokes[Math.floor(Math.random() * jokes.length)];
  }

  if (lowerMessage.includes('weather') || lowerMessage.includes('rain') || lowerMessage.includes('sunny')) {
    return "I wish I could check the weather for you! While you're thinking about the weather, remember that weather changes can sometimes affect tooth sensitivity. How are your teeth feeling today?";
  }
  
  if (lowerMessage.includes('hi') || lowerMessage.includes('hello') || lowerMessage.includes('hey') || lowerMessage.includes('good morning') || lowerMessage.includes('good afternoon') || lowerMessage.includes('good evening')) {
    return "Hello! I'm here to help you with your dental care questions. What can I assist you with today?";
  }
  
  // Dental-related topics - uses includes() for flexible matching
  if (lowerMessage.includes('pain') || lowerMessage.includes('hurt') || lowerMessage.includes('ache') || lowerMessage.includes('sore') || lowerMessage.includes('discomfort')) {
    return "I understand you're experiencing discomfort. For immediate relief, you can try over-the-counter pain medication as directed on the package. However, dental pain often indicates an issue that needs professional attention. I recommend scheduling an appointment as soon as possible.";
  }

  if (lowerMessage.includes('toothache') || lowerMessage.includes('tooth pain')) {
    return "Toothaches can be quite uncomfortable. Try rinsing with warm salt water and taking over-the-counter pain relievers. Avoid very hot or cold foods. This usually indicates a cavity or infection, so please schedule an appointment soon.";
  }

  if (lowerMessage.includes('brush') || lowerMessage.includes('floss') || lowerMessage.includes('clean') || lowerMessage.includes('hygiene')) {
    return "Great question about oral hygiene! I recommend: \n• Brush twice daily with fluoride toothpaste\n• Floss daily between all teeth\n• Use antibacterial mouthwash\n• Replace your toothbrush every 3-4 months\n• Visit for cleanings every 6 months";
  }

  if (lowerMessage.includes('bleeding') || lowerMessage.includes('blood') || lowerMessage.includes('gums') || lowerMessage.includes('bleeding gums')) {
    return "Bleeding gums can indicate gingivitis or gum disease. Make sure to brush gently with a soft-bristled toothbrush and floss daily. If bleeding persists for more than a week, please schedule an appointment for evaluation.";
  }

  if (lowerMessage.includes('white') || lowerMessage.includes('stain') || lowerMessage.includes('yellow') || lowerMessage.includes('bright') || lowerMessage.includes('whitening')) {
    return "For teeth whitening, I recommend professional treatments for the best and safest results. Avoid over-the-counter whitening products that might damage your enamel. Regular cleanings also help maintain brightness!";
  }

  if (lowerMessage.includes('cavity') || lowerMessage.includes('hole') || lowerMessage.includes('decay')) {
    return "If you suspect a cavity, it's important to see a dentist soon. Early treatment is usually simpler and less expensive. In the meantime, avoid sugary foods and drinks, and maintain good oral hygiene.";
  }

  if (lowerMessage.includes('appointment') || lowerMessage.includes('schedule') || lowerMessage.includes('book') || lowerMessage.includes('visit') || lowerMessage.includes('i want to book an appointment')) {
    return "I'd be happy to help with appointment information! Please call our office directly at 0917-817-4927 to schedule, or let me know what type of appointment you need and I can provide more specific guidance.";
  }

  if (lowerMessage.includes('emergency') || lowerMessage.includes('urgent') || lowerMessage.includes('broken') || lowerMessage.includes('knocked out')) {
    return "This sounds like a dental emergency! Please call our office immediately at 0917-817-4927. If it's after hours, we have an emergency line. For a knocked-out tooth, try to place it back in the socket gently, or keep it in milk until you can see a dentist.";
  }

  if (lowerMessage.includes('wisdom') || lowerMessage.includes('third molar')) {
    return "Wisdom teeth can cause various issues. Common symptoms include pain, swelling, or difficulty opening your mouth. A dentist can evaluate whether removal is necessary through an examination and X-rays.";
  }

  if (lowerMessage.includes('sensitive') || lowerMessage.includes('sensitivity') || lowerMessage.includes('cold') || lowerMessage.includes('hot')) {
    return "Tooth sensitivity can be caused by worn enamel, exposed roots, or cavities. Try using toothpaste designed for sensitive teeth, avoid extremely hot or cold foods temporarily, and schedule a check-up to determine the cause.";
  }

  // Insurance/cost - uses includes() for flexible matching
  if (lowerMessage.includes('insurance') || lowerMessage.includes('cost') || lowerMessage.includes('price') || lowerMessage.includes('payment') || lowerMessage.includes('how much') || lowerMessage.includes('expensive') || lowerMessage.includes('cheap') || lowerMessage.includes('affordable')) {
    if (lowerMessage.includes('consultation')) {
      return "Dental Consultation costs ₱500. This includes a full check-up of teeth, gums, and mouth with advice and treatment options. For insurance coverage and payment plans, please speak with our front desk team.";
    }
    
    if (lowerMessage.includes('cleaning') || lowerMessage.includes('prophylaxis')) {
      return "Oral Prophylaxis (Professional Cleaning) costs ₱800 - ₱2,500 depending on the complexity. This removes buildup and helps prevent gum disease. Contact our office for specific pricing and insurance information.";
    }
    
    if (lowerMessage.includes('filling') || lowerMessage.includes('pasta')) {
      return "Dental Filling (Pasta) costs ₱1,000 - ₱2,500. We use tooth-colored fillings that match your natural teeth. Price varies based on the size and location of the cavity.";
    }
    
    if (lowerMessage.includes('fluoride')) {
      return "Fluoride Varnish treatment costs ₱500. This strengthens tooth enamel and helps protect against cavities - a great preventive treatment!";
    }
    
    if (lowerMessage.includes('sealant') || lowerMessage.includes('pit') || lowerMessage.includes('fissure')) {
      return "Pit and Fissure Sealant costs ₱500. This protective coating is applied to molars to prevent cavities in the grooves - excellent for children and adults.";
    }
    
    if (lowerMessage.includes('root canal')) {
      return "Root Canal Treatment costs ₱500. This removes infected tooth nerve and seals the tooth to prevent reinfection. The price may vary depending on the tooth's condition.";
    }
    
    if (lowerMessage.includes('extraction') || lowerMessage.includes('odontectomy')) {
      return "Tooth Extraction (Odontectomy) costs ₱500. This includes removal of damaged teeth due to trauma or decay. Price may vary based on complexity.";
    }
    
    if (lowerMessage.includes('braces') || lowerMessage.includes('orthodontics')) {
      return "Orthodontics Braces cost ₱500. This helps straighten misaligned teeth and correct bite issues. Please schedule a consultation for a detailed treatment plan and payment options.";
    }
    
    if (lowerMessage.includes('whitening') || lowerMessage.includes('whiten')) {
      return "Teeth Whitening treatment costs ₱500. This cosmetic treatment removes stains and gives you a brighter, more confident smile. Results typically last 1-2 years with proper care.";
    }
    
    if (lowerMessage.includes('gingivectomy')) {
      return "Gingivectomy costs ₱500. This minor surgery removes excess or diseased gum tissue, improving gum health and smile appearance.";
    }
    
    if (lowerMessage.includes('frenectomy')) {
      return "Frenectomy costs ₱500. This minor surgery corrects tongue-tie or lip-tie, improving speech, eating, and orthodontic care.";
    }
    
    if (lowerMessage.includes('denture')) {
      return "Dentures cost ₱500. We offer various types including Partial/Metal, Complete, Soft Liner, and more. Custom-made dentures restore your smile and chewing function. Schedule a consultation for specific options.";
    }
    
    if (lowerMessage.includes('crown')) {
      return "Dental Crown costs ₱500. We offer various types including Jacket Crown, PFM Crown, All Ceramic, Zirconia Crown, and Second Crown. Crowns restore damaged teeth's strength and appearance.";
    }
    
    // General pricing response as fallback if no specific service is mentioned
    return "Here are our current service prices:\n\n• Consultation: ₱500\n• Cleaning: ₱800-₱2,500\n• Filling: ₱1,000-₱2,500\n• Fluoride/Sealant: ₱500 each\n• Root Canal/Extraction: ₱500 each\n• Braces/Whitening: ₱500 each\n• Other procedures: ₱500\n\nFor detailed pricing, insurance coverage, and payment plans, please contact our front desk team. We accept various payment methods and offer flexible payment options.";
  }

  // Other general questions
  if (lowerMessage.includes('how old') || lowerMessage.includes('age')) {
    return "I'm a digital assistant, so I don't have an age like humans do! I was created to help patients with dental questions. Speaking of age, dental care needs change as we get older - are you looking for age-specific dental advice?";
  }

  if (lowerMessage.includes('your name') || lowerMessage.includes('who are you')) {
    return "I'm an AI dental assistant for Fano Dental Clinic! I'm here to help answer basic dental questions and provide information about oral health. What can I help you with today?";
  }

  if (lowerMessage.includes('favorite') || lowerMessage.includes('like')) {
    return "As a dental AI, I really 'like' healthy smiles and good oral hygiene! My favorite thing is helping people maintain great dental health. What about you - do you have any dental concerns or questions?";
  }

  // Default fallback response - personalized based on contact
  if (contactId === 'global-chatbot') {
    return "Thank you for your question! While I can provide basic dental information, our dentists would be the best people to give you specific advice for your situation. Is there a particular dental concern I can help you with, or would you like to schedule an appointment at 0917-817-4927?";
  }
  
  return "Thank you for your question! While I can provide basic dental information, a dentist would be the best person to give you specific advice for your situation. Is there a particular dental concern I can help you with, or would you like to schedule an appointment?";
};

/**
 * Checks if a message contains urgent keywords that require a doctor's attention.
 * This is a critical safety check that bypasses the AI for emergencies.
 * @param {string} message The user's input message.
 * @returns {boolean} True if the message is urgent, otherwise false.
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
 * Main function to get a response from the AI or a predefined fallback.
 * Enhanced with true conversational AI capabilities.
 * @param {string} message The user's input message.
 * @param {string} contactId The contact ID to personalize responses.
 * @returns {Promise<string>} A promise that resolves to the bot's response.
 */
export const getAIResponse = async (message, contactId) => {
  try {
    // 1. Check for urgent keywords first and respond accordingly
    if (needsDoctorAttention(message)) {
      return "This sounds like a dental emergency! Please call our office immediately for professional assistance at 0917-817-4927. If it's after hours, please seek immediate care from an emergency dentist or hospital.";
    }

    // 2. Try Google AI first for natural conversation
    if (model) {
      let contactName = "the dentist";
      let clinicInfo = "Fano Dental Clinic";
      
      if (contactId === "dr-jessica") {
        contactName = "Dr. Jessica";
      } else if (contactId === "jane-sy") {
        contactName = "Jane Sy";
      } else if (contactId === "global-chatbot") {
        contactName = "Fano Dental Clinic";
        clinicInfo = "Fano Dental Clinic";
      }
      
      const prompt = `You are a friendly, professional, and empathetic AI dental assistant for ${contactName} at ${clinicInfo}. You're designed to be conversational, helpful, and engaging while maintaining your dental expertise.

**Your Personality:**
- Warm, friendly, and approachable
- Professional but not overly formal
- Genuinely helpful and caring
- Can engage in light conversation while steering towards dental topics
- Always ready to help with dental questions

**Core Guidelines:**
1. **Be Conversational**: You can chat about various topics, but always maintain your identity as a dental AI assistant
2. **Dental Focus**: While you can discuss other topics briefly, always try to connect back to dental health when appropriate
3. **Safety First**: For any dental emergency or serious symptoms, immediately recommend professional care
4. **No Medical Diagnosis**: Provide general information but always recommend consulting with a dentist for specific issues
5. **Be Helpful**: Answer questions naturally and provide useful information
6. **Stay In Character**: You're an AI assistant for a dental clinic, so maintain that context

**Clinic Information:**
- Name: Fano Dental Clinic
- Location: 961 Consolacion-Tayud-Liloan Rd. Landing Catarman Liloan, Cebu, Liloan, Philippines
- Phone: 0917-817-4927
- Hours: Mon-Sat: 9:00 AM – 5:00 PM, Sun: 1:00 PM – 4:00 PM

**Services & Pricing:**
- Consultation: ₱500
- Cleaning: ₱800 - ₱2,500
- Filling: ₱1,000 - ₱2,500
- Fluoride/Sealant: ₱500 each
- Root Canal/Extraction: ₱500 each
- Braces/Whitening: ₱500 each
- Other procedures: ₱500

**Instructions:**
- Answer naturally and conversationally
- If asked about non-dental topics, you can engage briefly but connect back to dental health when possible
- Be empathetic and understanding
- Use a warm, friendly tone
- Provide helpful and accurate information
- Always offer to help with dental concerns

User says: "${message}"

Respond as the dental AI assistant:`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      if (text && text.trim()) {
        return text.trim();
      }
    }
    
    // 3. Check for predefined responses as backup
    const buttonResponse = getDentalResponse(message, contactId);
    if (buttonResponse && !buttonResponse.startsWith("Thank you for your question!")) {
      return buttonResponse;
    }
    
    // 4. Final fallback if AI is not available
    return getDentalResponse(message, contactId);

  } catch (error) {
    console.error('AI Service Error:', error);
    // Return a safe predefined response if an AI error occurs
    return getDentalResponse(message, contactId);
  }
};