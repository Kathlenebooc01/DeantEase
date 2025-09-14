// Step 1: Create components/GlobalChatbot.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { getAIResponse, needsDoctorAttention, getGlobalChatbotGreeting } from '../../services/aiService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const GlobalChatbot = () => {
  const navigation = useNavigation();
  const [isVisible, setIsVisible] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef(null);

  // Initialize with welcome message
  useEffect(() => {
    loadMessages();
  }, []);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (messages.length > 0 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const loadMessages = async () => {
    try {
      const storedMessages = await AsyncStorage.getItem('global_chatbot_messages');
      if (storedMessages) {
        setMessages(JSON.parse(storedMessages));
      } else {
        // Initialize with welcome message
        const welcomeMessage = {
          id: 'welcome_1',
          text: "Hello! 👋 I'm your dental AI assistant. I can help answer questions about dental care, appointments, and services. How can I help you today?",
          time: getCurrentTime(),
          isFromUser: false,
          sender: 'Dental Assistant',
          showButtons: true,
          buttons: [
            { text: "Dental Care Tips", value: "Give me dental care tips" },
            { text: "Services & Pricing", value: "What services do you offer?" },
            { text: "Emergency Help", value: "I have a dental emergency" },
            { text: "Book Appointment", value: "I want to book an appointment" }
          ]
        };
        setMessages([welcomeMessage]);
      }
    } catch (error) {
      console.error('Error loading chatbot messages:', error);
    }
  };

  const saveMessages = async (newMessages) => {
    try {
      await AsyncStorage.setItem('global_chatbot_messages', JSON.stringify(newMessages));
    } catch (error) {
      console.error('Error saving chatbot messages:', error);
    }
  };

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleNavigateToAppointment = () => {
    // Close the chatbot first
    setIsVisible(false);
    setIsMinimized(false);
    
    // Navigate to appointment screen
    navigation.navigate('AppointmentScreen');
  };

  const handleSend = async () => {
    const messageText = inputText.trim();
    if (messageText === '' || isTyping) return;

    setInputText('');

    const userMessage = {
      id: Date.now().toString(),
      text: messageText,
      time: getCurrentTime(),
      isFromUser: true,
      sender: 'You',
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    saveMessages(newMessages);

    setIsTyping(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      let aiResponse;
      if (needsDoctorAttention && needsDoctorAttention(messageText)) {
        aiResponse = "This sounds like something that needs immediate professional attention. Please call our clinic at 0917-817-4927 or visit us for urgent dental care.";
      } else {
        aiResponse = await getAIResponse(messageText, 'global-chatbot');
      }

      const aiMessage = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        time: getCurrentTime(),
        isFromUser: false,
        sender: 'Dental Assistant',
      };

      const updatedMessages = [...newMessages, aiMessage];
      setMessages(updatedMessages);
      saveMessages(updatedMessages);

    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        text: "I'm having trouble responding right now. Please try again or call our clinic directly at 0917-817-4927.",
        time: getCurrentTime(),
        isFromUser: false,
        sender: 'Dental Assistant',
      };
      
      const updatedMessages = [...newMessages, errorMessage];
      setMessages(updatedMessages);
      saveMessages(updatedMessages);
    } finally {
      setIsTyping(false);
    }
  };

  const handleButtonClick = async (buttonValue) => {
    const userMessage = {
      id: Date.now().toString(),
      text: buttonValue,
      time: getCurrentTime(),
      isFromUser: true,
      sender: 'You',
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    saveMessages(newMessages);

    setIsTyping(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      let aiResponse;
      let showBookButton = false;
      
      // Check if the user wants to book an appointment
      if (buttonValue === "I want to book an appointment") {
        aiResponse = "I'd be happy to help you book an appointment! 📅 You can schedule your visit with our dental team. We offer various services including routine cleanings, checkups, and specialized treatments. Click the button below to proceed with booking.";
        showBookButton = true;
      } else {
        aiResponse = await getAIResponse(buttonValue, 'global-chatbot');
      }

      const aiMessage = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        time: getCurrentTime(),
        isFromUser: false,
        sender: 'Dental Assistant',
        showButtons: showBookButton,
        buttons: showBookButton ? [
          { 
            text: "Book here", 
            value: "navigate_to_appointment",
            isNavigation: true 
          }
        ] : undefined
      };

      const updatedMessages = [...newMessages, aiMessage];
      setMessages(updatedMessages);
      saveMessages(updatedMessages);

    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        text: "I'm having trouble responding right now. Please try again or call our clinic directly at 0917-817-4927.",
        time: getCurrentTime(),
        isFromUser: false,
        sender: 'Dental Assistant',
      };
      
      const updatedMessages = [...newMessages, errorMessage];
      setMessages(updatedMessages);
      saveMessages(updatedMessages);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSpecialButtonClick = (button) => {
    if (button.isNavigation && button.value === "navigate_to_appointment") {
      handleNavigateToAppointment();
    } else {
      handleButtonClick(button.value);
    }
  };

  const toggleChatbot = () => {
    if (isVisible) {
      // Closing chatbot
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setIsVisible(false);
        setIsMinimized(false);
      });
    } else {
      // Opening chatbot
      setIsVisible(true);
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  const minimizeChat = () => {
    setIsMinimized(true);
    Animated.timing(slideAnim, {
      toValue: 0.1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const maximizeChat = () => {
    setIsMinimized(false);
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const clearChat = async () => {
    try {
      await AsyncStorage.removeItem('global_chatbot_messages');
      // Reload with welcome message using the greeting from aiService
      const greeting = getGlobalChatbotGreeting();
      const initialMessage = {
        id: 'welcome_1',
        text: greeting.message,
        time: getCurrentTime(),
        isFromUser: false,
        sender: 'Dental Assistant',
        showButtons: greeting.showButtons,
        buttons: greeting.buttons
      };
      setMessages([initialMessage]);
    } catch (error) {
      console.error('Error clearing chat:', error);
    }
  };

  const renderButtons = (buttons) => (
    <View style={styles.buttonsContainer}>
      {buttons.map((button, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.quickButton,
            button.isNavigation && styles.navigationButton
          ]}
          onPress={() => handleSpecialButtonClick(button)}
        >
          <View style={styles.buttonContent}>
            {button.isNavigation && (
              <Ionicons 
                name="calendar-outline" 
                size={14} 
                color="#fff" 
                style={styles.buttonIcon} 
              />
            )}
            <Text style={styles.quickButtonText}>{button.text}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderMessage = ({ item }) => (
    <View style={[
      styles.messageRow,
      item.isFromUser ? styles.userRow : styles.botRow,
    ]}>
      {!item.isFromUser && (
        <View style={styles.avatar}>
          <Ionicons name="chatbubbles" size={16} color="#666" />
        </View>
      )}
      <View style={[
        styles.bubbleContainer,
        item.isFromUser ? styles.userBubble : styles.botBubble,
      ]}>
        {!item.isFromUser && (
          <Text style={styles.senderText}>{item.sender}</Text>
        )}
        <Text style={[
          styles.messageText,
          item.isFromUser ? styles.userMessageText : styles.botMessageText,
        ]}>
          {item.text}
        </Text>
        
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
          <Ionicons name="person" size={16} color="#666" />
        </View>
      )}
    </View>
  );

  const renderTypingIndicator = () => (
    isTyping && (
      <View style={[styles.messageRow, styles.botRow]}>
        <View style={styles.avatar}>
          <Ionicons name="chatbubbles" size={16} color="#666" />
        </View>
        <View style={[styles.bubbleContainer, styles.botBubble]}>
          <Text style={styles.senderText}>Dental Assistant</Text>
          <View style={styles.typingContainer}>
            <Text style={styles.typingText}>Typing</Text>
            <ActivityIndicator size="small" color="#666" style={styles.typingSpinner} />
          </View>
        </View>
      </View>
    )
  );

  return (
    <>
      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={toggleChatbot}
        activeOpacity={0.8}
      >
        <Ionicons 
          name={isVisible ? "close" : "chatbubbles"} 
          size={24} 
          color="#fff" 
        />
      </TouchableOpacity>

      {/* Chat Modal */}
      <Modal
        visible={isVisible}
        transparent={true}
        animationType="none"
        statusBarTranslucent={true}
      >
        <View style={styles.modalOverlay}>
          <Animated.View 
            style={[
              styles.chatContainer,
              {
                transform: [{
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 0.1, 1],
                    outputRange: [height, height * 0.7, 0],
                  })
                }],
                opacity: slideAnim.interpolate({
                  inputRange: [0, 0.1, 1],
                  outputRange: [0, 1, 1],
                })
              },
              isMinimized && styles.minimizedChat
            ]}
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <Ionicons name="chatbubbles" size={20} color="#004C9C" />
                <Text style={styles.headerTitle}>Dental Assistant</Text>
                <View style={styles.onlineIndicator} />
              </View>
              <View style={styles.headerButtons}>
                <TouchableOpacity
                  style={styles.headerButton}
                  onPress={clearChat}
                >
                  <Ionicons name="refresh-outline" size={18} color="#666" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.headerButton}
                  onPress={isMinimized ? maximizeChat : minimizeChat}
                >
                  <Ionicons 
                    name={isMinimized ? "chevron-up" : "chevron-down"} 
                    size={18} 
                    color="#666" 
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.headerButton}
                  onPress={toggleChatbot}
                >
                  <Ionicons name="close" size={18} color="#666" />
                </TouchableOpacity>
              </View>
            </View>

            {!isMinimized && (
              <>
                {/* Messages */}
                <KeyboardAvoidingView 
                  style={styles.messagesContainer}
                  behavior={Platform.OS === "ios" ? "padding" : "height"}
                >
                  <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderMessage}
                    keyExtractor={(item) => item.id}
                    style={styles.messagesList}
                    contentContainerStyle={styles.messagesContent}
                    ListFooterComponent={renderTypingIndicator}
                    showsVerticalScrollIndicator={false}
                  />

                  {/* Input */}
                  <View style={styles.inputContainer}>
                    <View style={styles.inputWrapper}>
                      <TextInput
                        style={styles.textInput}
                        placeholder="Ask me anything about dental care..."
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
                          (inputText.trim() === '' || isTyping) && styles.sendButtonDisabled,
                        ]}
                        onPress={handleSend}
                        disabled={inputText.trim() === '' || isTyping}
                      >
                        <Ionicons name="send" size={16} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </KeyboardAvoidingView>
              </>
            )}
          </Animated.View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#004C9C',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    zIndex: 1000,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  chatContainer: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: width - 40,
    maxWidth: 350,
    height: height * 0.6,
    backgroundColor: '#fff',
    borderRadius: 16,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  minimizedChat: {
    height: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginLeft: 8,
  },
  onlineIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    marginLeft: 8,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 6,
    marginLeft: 4,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 12,
    width: '100%',
  },
  userRow: {
    justifyContent: 'flex-end',
  },
  botRow: {
    justifyContent: 'flex-start',
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  bubbleContainer: {
    maxWidth: '75%',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  userBubble: {
    backgroundColor: '#004C9C',
    borderTopRightRadius: 4,
  },
  botBubble: {
    backgroundColor: '#f8f9fa',
    borderTopLeftRadius: 4,
  },
  senderText: {
    fontSize: 10,
    color: '#004C9C',
    fontWeight: '600',
    marginBottom: 2,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 18,
  },
  userMessageText: {
    color: '#fff',
  },
  botMessageText: {
    color: '#000',
  },
  messageTime: {
    fontSize: 10,
    marginTop: 4,
    textAlign: 'right',
  },
  userMessageTime: {
    color: 'rgba(255,255,255,0.8)',
  },
  botMessageTime: {
    color: '#666',
  },
  buttonsContainer: {
    marginTop: 8,
    marginBottom: 4,
  },
  quickButton: {
    backgroundColor: '#004C9C',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 4,
    alignSelf: 'flex-start',
  },
  navigationButton: {
    backgroundColor: '#2E7D32',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonIcon: {
    marginRight: 6,
  },
  quickButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingText: {
    color: '#666',
    fontSize: 12,
    fontStyle: 'italic',
  },
  typingSpinner: {
    marginLeft: 6,
  },
  inputContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 8,
    color: '#000',
    maxHeight: 20,
    minHeight: 36,
  },
  sendButton: {
    backgroundColor: '#004C9C',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});

export default GlobalChatbot;