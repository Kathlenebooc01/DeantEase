// screens/ChatMessages.js
import React, { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { getAIResponse, needsDoctorAttention, getDrJessicaGreeting, getJaneSyGreeting } from "../../services/aiService"
import AsyncStorage from '@react-native-async-storage/async-storage'

const ChatMessages = ({ navigation, route }) => {
  const { contact, onUpdateLastMessage } = route.params
  const [inputText, setInputText] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [messages, setMessages] = useState([])

  // Load existing messages and initialize with greeting if first time
  useEffect(() => {
    loadMessages()
  }, [contact.id])

  // Save messages and update parent whenever messages state changes
  useEffect(() => {
    if (messages.length > 0) {
      saveMessagesToStorage()
      // Update the parent screen with the last message
      const lastMessage = messages[messages.length - 1]
      if (lastMessage && onUpdateLastMessage) {
        console.log('Updating parent with last message:', lastMessage.text)
        onUpdateLastMessage(contact.id, lastMessage.text, lastMessage.time)
      }
    }
  }, [messages, contact.id, onUpdateLastMessage])

  const loadMessages = async () => {
    try {
      const storedMessages = await AsyncStorage.getItem(`chat_${contact.id}`)
      
      if (storedMessages) {
        // Load existing messages
        const parsedMessages = JSON.parse(storedMessages)
        console.log(`Loaded ${parsedMessages.length} messages for ${contact.id}`)
        setMessages(parsedMessages)
      } else {
        // Initialize with greeting for first time
        const greeting = getGreetingForContact(contact)
        const initialMessage = {
          id: "greeting_1",
          text: greeting.message,
          time: getCurrentTime(),
          isFromUser: false,
          sender: "AI Assistant",
          showButtons: greeting.showButtons,
          buttons: greeting.buttons,
        }
        console.log(`Initializing chat for ${contact.id} with greeting`)
        setMessages([initialMessage])
      }
    } catch (error) {
      console.error('Error loading messages:', error)
      // Fallback to greeting if loading fails
      const greeting = getGreetingForContact(contact)
      const initialMessage = {
        id: "greeting_1",
        text: greeting.message,
        time: getCurrentTime(),
        isFromUser: false,
        sender: "AI Assistant",
        showButtons: greeting.showButtons,
        buttons: greeting.buttons,
      }
      setMessages([initialMessage])
    }
  }

  const saveMessagesToStorage = async () => {
    try {
      await AsyncStorage.setItem(`chat_${contact.id}`, JSON.stringify(messages))
      console.log(`Saved ${messages.length} messages for ${contact.id}`)
    } catch (error) {
      console.error('Error saving messages:', error)
    }
  }

  const getGreetingForContact = (contact) => {
    if (contact.id === "dr-jessica") {
      return getDrJessicaGreeting ? getDrJessicaGreeting() : getDefaultGreeting()
    } else if (contact.id === "jane-sy") {
      return getJaneSyGreeting ? getJaneSyGreeting() : getDefaultGreeting()
    } else {
      return getDefaultGreeting()
    }
  }

  const getDefaultGreeting = () => {
    return {
      message: `Hello! I'm ${contact.name}'s AI assistant. How can I help you with your dental care today?`,
      showButtons: true,
      buttons: [
        { text: "Book an appointment", value: "I would like to book an appointment" },
        { text: "Ask about services", value: "What dental services do you offer?" },
        { text: "Emergency help", value: "I have a dental emergency" },
        { text: "General question", value: "I have a general question" }
      ]
    }
  }

  const getCurrentTime = () => {
    const now = new Date()
    return now.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  // Handle button clicks
  const handleButtonClick = async (buttonValue) => {
    console.log('Button clicked:', buttonValue)
    
    // Add user message showing which button was clicked
    const userMessage = {
      id: Date.now().toString(),
      text: buttonValue,
      time: getCurrentTime(),
      isFromUser: true,
      sender: "You",
    }

    // Add user message first
    setMessages(prev => {
      const newMessages = [...prev, userMessage]
      console.log('Added user message via button click')
      return newMessages
    })

    setIsTyping(true)

    try {
      // Small delay to make it feel more natural
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      let aiResponse = await getAIResponseSafely(buttonValue, contact.id)
      
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        time: getCurrentTime(),
        isFromUser: false,
        sender: "AI Assistant",
      }
      
      // Add AI response
      setMessages(prev => {
        const newMessages = [...prev, aiMessage]
        console.log('Added AI response via button click')
        return newMessages
      })

    } catch (error) {
      console.error('Error getting AI response:', error)
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        text: `I'm having trouble responding right now. ${contact.name} will be with you shortly to help with your concern.`,
        time: getCurrentTime(),
        isFromUser: false,
        sender: "AI Assistant",
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  const handleSend = async () => {
    const messageText = inputText.trim()
    if (messageText === "") return

    console.log('Sending message:', messageText)

    // Clear input immediately and store message text
    setInputText("")

    const userMessage = {
      id: Date.now().toString(),
      text: messageText,
      time: getCurrentTime(),
      isFromUser: true,
      sender: "You",
    }

    // Add user message to local state immediately for better UX
    setMessages(prev => {
      const newMessages = [...prev, userMessage]
      console.log('Added user message via text input')
      return newMessages
    })

    setIsTyping(true)

    try {
      // Small delay to make it feel more natural
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      let aiResponse
      let aiMessage

      // Check if this needs doctor's attention
      if (needsDoctorAttention && needsDoctorAttention(messageText)) {
        aiResponse = `I see this is something that requires ${contact.name}'s personal attention. I've notified them about your message, and they'll respond as soon as they're available. For urgent matters, please call the clinic directly.`
        aiMessage = {
          id: (Date.now() + 1).toString(),
          text: aiResponse,
          time: getCurrentTime(),
          isFromUser: false,
          sender: "AI Assistant",
          needsDoctor: true,
        }
      } else {
        // Get AI response with fallback
        aiResponse = await getAIResponseSafely(messageText, contact.id)
        
        aiMessage = {
          id: (Date.now() + 1).toString(),
          text: aiResponse,
          time: getCurrentTime(),
          isFromUser: false,
          sender: "AI Assistant",
        }
      }
      
      // Add AI message to local state
      setMessages(prev => {
        const newMessages = [...prev, aiMessage]
        console.log('Added AI response via text input')
        return newMessages
      })

    } catch (error) {
      console.error('Error getting AI response:', error)
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        text: `I'm having trouble responding right now. ${contact.name} will be with you shortly to help with your concern.`,
        time: getCurrentTime(),
        isFromUser: false,
        sender: "AI Assistant",
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  // Safe AI response function with fallback
  const getAIResponseSafely = async (messageText, contactId) => {
    try {
      if (getAIResponse) {
        const response = await getAIResponse(messageText, contactId)
        console.log('Got AI response:', response.substring(0, 50) + '...')
        return response
      } else {
        return getSimpleResponse(messageText, contact)
      }
    } catch (error) {
      console.error('AI service error:', error)
      return getSimpleResponse(messageText, contact)
    }
  }

  // Simple fallback responses
  const getSimpleResponse = (messageText, contact) => {
    const lowerMessage = messageText.toLowerCase()
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      return `Hello! Great to hear from you. I'm ${contact.name}'s AI assistant. How can I help you with your dental care today?`
    }
    
    if (lowerMessage.includes('pain') || lowerMessage.includes('hurt') || lowerMessage.includes('ache') || lowerMessage.includes('emergency')) {
      return `I understand you're experiencing pain. For immediate pain relief, you can try taking over-the-counter pain medication as directed. However, I recommend scheduling an appointment with ${contact.name} to properly diagnose and treat the issue. For urgent matters, please call our clinic directly.`
    }
    
    if (lowerMessage.includes('brush') || lowerMessage.includes('tooth') || lowerMessage.includes('teeth') || lowerMessage.includes('oral care')) {
      return "Good oral hygiene is important! I recommend brushing twice daily with fluoride toothpaste, flossing daily, and using mouthwash. Replace your toothbrush every 3-4 months. Regular dental checkups every 6 months are also essential."
    }
    
    if (lowerMessage.includes('appointment') || lowerMessage.includes('schedule') || lowerMessage.includes('book')) {
      return `I'd be happy to help you with appointment information. Please call our clinic directly at 0917-817-4927 or let me know what specific time you're looking for, and I can check with ${contact.name}'s schedule. What type of appointment are you looking for?`
    }

    if (lowerMessage.includes('service') || lowerMessage.includes('treatment') || lowerMessage.includes('offer')) {
      return `${contact.name} offers a comprehensive range of dental services including general checkups, cleanings, fillings, crowns, teeth whitening, and emergency dental care. What specific service are you interested in learning about?`
    }
    
    // Default response
    return `Thank you for your message! While I can help with basic dental information and appointment scheduling, ${contact.name} would be better suited to provide specific advice for your situation. Is there a particular dental concern you'd like to discuss?`
  }

  // Clear chat function
  const clearChat = async () => {
    try {
      await AsyncStorage.removeItem(`chat_${contact.id}`)
      const greeting = getGreetingForContact(contact)
      const initialMessage = {
        id: "greeting_1",
        text: greeting.message,
        time: getCurrentTime(),
        isFromUser: false,
        sender: "AI Assistant",
        showButtons: greeting.showButtons,
        buttons: greeting.buttons,
      }
      setMessages([initialMessage])
      console.log(`Cleared chat for ${contact.id}`)
    } catch (error) {
      console.error('Error clearing chat:', error)
    }
  }

  // Render quick action buttons
  const renderButtons = (buttons) => (
    <View style={styles.buttonsContainer}>
      {buttons.map((button, index) => (
        <TouchableOpacity
          key={index}
          style={styles.quickButton}
          onPress={() => handleButtonClick(button.value)}
        >
          <Text style={styles.quickButtonText}>{button.text}</Text>
        </TouchableOpacity>
      ))}
    </View>
  )

  const renderMessage = ({ item, index }) => (
    <View style={[
      styles.messageRow,
      item.isFromUser ? styles.userRow : styles.botRow,
    ]}>
      {!item.isFromUser && (
        <View style={styles.avatar}>
          <Ionicons 
            name={item.sender === "AI Assistant" ? "chatbubbles" : "person"} 
            size={20} 
            color="#666" 
          />
        </View>
      )}
      <View style={[
        styles.bubbleContainer,
        item.isFromUser ? styles.userBubble : styles.botBubble,
      ]}>
        {!item.isFromUser && (
          <Text style={styles.senderText}>
            {item.sender}
          </Text>
        )}
        <Text style={[
          styles.messageText,
          item.isFromUser ? styles.userMessageText : styles.botMessageText,
        ]}>
          {item.text}
        </Text>
        
        {/* Render buttons if they exist */}
        {item.showButtons && item.buttons && renderButtons(item.buttons)}
        
        <Text style={[
          styles.messageTime,
          item.isFromUser ? styles.userMessageTime : styles.botMessageTime,
        ]}>
          {item.time}
        </Text>
      </View>
      {item.isFromUser && (
        <View style={styles.avatar}>
          <Ionicons name="person" size={20} color="#666" />
        </View>
      )}
    </View>
  )

  const renderTypingIndicator = () => (
    isTyping && (
      <View style={[styles.messageRow, styles.botRow]}>
        <View style={styles.avatar}>
          <Ionicons name="chatbubbles" size={20} color="#666" />
        </View>
        <View style={[styles.bubbleContainer, styles.botBubble, styles.typingBubble]}>
          <Text style={styles.senderText}>AI Assistant</Text>
          <View style={styles.typingContainer}>
            <Text style={styles.typingText}>Typing</Text>
            <View style={styles.dotsContainer}>
              <ActivityIndicator size="small" color="#666" />
            </View>
          </View>
        </View>
      </View>
    )
  )

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>{contact.name}</Text>
            <Text style={styles.headerSubtitle}>AI Assistant Available</Text>
          </View>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={clearChat}
          >
            <Ionicons name="refresh-outline" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Messages */}
        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContainer}
          ListFooterComponent={renderTypingIndicator}
          showsVerticalScrollIndicator={false}
        />

        {/* Input */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              placeholder="Ask me about dental care..."
              value={inputText}
              onChangeText={setInputText}
              multiline
              placeholderTextColor="#666"
              editable={!isTyping}
              returnKeyType="send"
              onSubmitEditing={handleSend}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (inputText.trim() === "" || isTyping) && { opacity: 0.5 },
              ]}
              onPress={handleSend}
              disabled={inputText.trim() === "" || isTyping}
            >
              <Ionicons name="send" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFF6F0"
  },
  container: {
    flex: 1,
    backgroundColor: "#37a3ddff"
  },
  header: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 15,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
    marginTop: Platform.OS === "android" ? 25 : 0,
    marginTop: 1,
  },
  backButton: {
    marginRight: 15
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000"
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#004C9C",
    marginTop: 2
  },
  headerButton: {
    padding: 8,
  },
  messagesList: {
    flex: 1
  },
  messagesContainer: {
    paddingHorizontal: 15,
    paddingVertical: 20
  },
  messageRow: {
    flexDirection: "row",
    marginBottom: 15,
    width: "100%"
  },
  userRow: {
    justifyContent: "flex-end"
  },
  botRow: {
    justifyContent: "flex-start"
  },
  avatar: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 6,
  },
  bubbleContainer: {
    maxWidth: "75%",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  userBubble: {
    backgroundColor: "#004C9C",
    borderTopRightRadius: 5
  },
  botBubble: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  senderText: {
    fontSize: 11,
    color: "#004C9C",
    fontWeight: "600",
    marginBottom: 4,
  },
  messageText: {
    fontSize: 15.5,
    lineHeight: 21
  },
  userMessageText: {
    color: "#fff"
  },
  botMessageText: {
    color: "#000"
  },
  messageTime: {
    fontSize: 12,
    marginTop: 5
  },
  userMessageTime: {
    color: "#f5f5f5",
    textAlign: "right"
  },
  botMessageTime: {
    color: "#666",
    textAlign: "right"
  },
  typingBubble: {
    minHeight: 60,
    justifyContent: "center"
  },
  typingContainer: {
    flexDirection: "row",
    alignItems: "center"
  },
  typingText: {
    color: "#666",
    fontSize: 14,
    fontStyle: "italic"
  },
  dotsContainer: {
    marginLeft: 8
  },
  // New styles for buttons
  buttonsContainer: {
    marginTop: 10,
    marginBottom: 5,
  },
  quickButton: {
    backgroundColor: "#004C9C",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginBottom: 6,
    alignSelf: "flex-start",
  },
  quickButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  inputContainer: {
    backgroundColor: "#fff",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: "#F5F5F5",
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 5,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: Platform.OS === "ios" ? 10 : 8,
    color: "#000",
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: "#004C9C",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 5,
  },
})

export default ChatMessages