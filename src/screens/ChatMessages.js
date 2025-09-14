// screens/ChatMessages.js
import React, { useState, useEffect, useContext } from "react"
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
  Modal,
  Animated,
  Image, // Import Image component
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import AsyncStorage from '@react-native-async-storage/async-storage'
import { UserContext } from '../context/UserContext' // Import UserContext

const ChatMessages = ({ navigation, route }) => {
  const { contact, onUpdateLastMessage } = route.params
  const [inputText, setInputText] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [messages, setMessages] = useState([])
  const [doctorOnlineStatus, setDoctorOnlineStatus] = useState(true) // Simulate online status
  
  // Use UserContext to get user profile data
  const { userProfile } = useContext(UserContext)
  
  // Pop-up notification states
  const [showPopup, setShowPopup] = useState(false)
  const [popupOpacity] = useState(new Animated.Value(0))

  // Load existing messages and initialize if first time
  useEffect(() => {
    loadMessages()
  }, [contact.id])

  // Save messages and update parent whenever messages state changes
  useEffect(() => {
    if (messages.length > 0) {
      saveMessagesToStorage()
      const lastMessage = messages[messages.length - 1]
      if (lastMessage && !lastMessage.isSystemMessage && onUpdateLastMessage) {
        onUpdateLastMessage(contact.id, lastMessage.text, lastMessage.time)
      }
    }
  }, [messages, contact.id, onUpdateLastMessage])

  const loadMessages = async () => {
    try {
      const storedMessages = await AsyncStorage.getItem(`chat_${contact.id}`)
      
      if (storedMessages) {
        const parsedMessages = JSON.parse(storedMessages)
        setMessages(parsedMessages)
      } else {
        const initialMessage = {
          id: "welcome_1",
          text: `Welcome! You can send messages to ${contact.name}. ${doctorOnlineStatus ? "They are currently online and will respond soon." : "They will respond when they're available."}`,
          time: getCurrentTime(),
          isFromUser: false,
          sender: contact.name,
          isSystemMessage: true,
        }
        setMessages([initialMessage])
      }
    } catch (error) {
      console.error('Error loading messages:', error)
      const initialMessage = {
        id: "welcome_1",
        text: `Welcome! You can send messages to ${contact.name}. ${doctorOnlineStatus ? "They are currently online and will respond soon." : "They will respond when they're available."}`,
        time: getCurrentTime(),
        isFromUser: false,
        sender: contact.name,
        isSystemMessage: true,
      }
      setMessages([initialMessage])
    }
  }

  const saveMessagesToStorage = async () => {
    try {
      await AsyncStorage.setItem(`chat_${contact.id}`, JSON.stringify(messages))
    } catch (error) {
      console.error('Error saving messages:', error)
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

  const showPopupNotification = () => {
    setShowPopup(true)
    
    Animated.timing(popupOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start()

    setTimeout(() => {
      Animated.timing(popupOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setShowPopup(false)
      })
    }, 2000)
  }

  const handleSend = async () => {
    const messageText = inputText.trim()
    if (messageText === "") return

    setInputText("")

    const userMessage = {
      id: Date.now().toString(),
      text: messageText,
      time: getCurrentTime(),
      isFromUser: true,
      sender: userProfile?.name || "You",
    }

    setMessages(prev => {
      const newMessages = [...prev, userMessage]
      return newMessages
    })

    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      showPopupNotification()
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        text: "Failed to send message. Please check your connection and try again.",
        time: getCurrentTime(),
        isFromUser: false,
        sender: "System",
        isSystemMessage: true,
        isError: true,
      }
      setMessages(prev => [...prev, errorMessage])
    }
  }

  const clearChat = async () => {
    try {
      await AsyncStorage.removeItem(`chat_${contact.id}`)
      setMessages([])
    } catch (error) {
      console.error('Error clearing chat:', error)
    }
  }

  const renderMessage = ({ item, index }) => (
    <View style={[
      styles.messageRow,
      item.isFromUser ? styles.userRow : styles.botRow,
    ]}>
      {/* Bot/System Avatar */}
      {!item.isFromUser && (
        <View style={[styles.avatar, item.isSystemMessage && styles.systemAvatar]}>
          <Ionicons 
            name={item.isSystemMessage ? "information-circle" : "person"} 
            size={20} 
            color={item.isSystemMessage ? "#666" : "#666"} 
          />
        </View>
      )}
      <View style={[
        styles.bubbleContainer,
        item.isFromUser ? styles.userBubble : styles.botBubble,
        item.isSystemMessage && styles.systemBubble,
        item.isError && styles.errorBubble,
      ]}>
        {!item.isFromUser && (
          <Text style={[
            styles.senderText,
            item.isSystemMessage && styles.systemSenderText
          ]}>
            {item.sender}
          </Text>
        )}
        <Text style={[
          styles.messageText,
          item.isFromUser ? styles.userMessageText : styles.botMessageText,
          item.isSystemMessage && styles.systemMessageText,
          item.isError && styles.errorMessageText,
        ]}>
          {item.text}
        </Text>
        
        <Text style={[
          styles.messageTime,
          item.isFromUser ? styles.userMessageTime : styles.botMessageTime,
          item.isSystemMessage && styles.systemMessageTime,
        ]}>
          {item.time}
        </Text>
      </View>
      {/* User Avatar */}
      {item.isFromUser && (
        <View style={styles.avatar}>
          {userProfile?.profileImage?.uri ? (
            <Image source={{ uri: userProfile.profileImage.uri }} style={styles.profileImage} />
          ) : (
            <Ionicons name="person" size={20} color="#666" />
          )}
        </View>
      )}
    </View>
  )

  const renderTypingIndicator = () => (
    isTyping && (
      <View style={[styles.messageRow, styles.botRow]}>
        <View style={[styles.avatar, styles.systemAvatar]}>
          <Ionicons name="information-circle" size={20} color="#666" />
        </View>
        <View style={[styles.bubbleContainer, styles.systemBubble, styles.typingBubble]}>
          <Text style={styles.systemSenderText}>System</Text>
          <View style={styles.typingContainer}>
            <Text style={styles.typingText}>Sending message</Text>
            <View style={styles.dotsContainer}>
              <ActivityIndicator size="small" color="#666" />
            </View>
          </View>
        </View>
      </View>
    )
  )

  const PopupNotification = () => (
    <Modal
      transparent={true}
      visible={showPopup}
      animationType="none"
      pointerEvents="none"
    >
      <View style={styles.popupContainer}>
        <Animated.View 
          style={[
            styles.popupContent,
            { opacity: popupOpacity }
          ]}
        >
          <View style={styles.popupIcon}>
            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
          </View>
          <Text style={styles.popupText}>
            Message sent to {contact.name}
          </Text>
        </Animated.View>
      </View>
    </Modal>
  )

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>{contact.name}</Text>
            <View style={styles.statusContainer}>
              <View style={[styles.statusDot, { backgroundColor: doctorOnlineStatus ? "#4CAF50" : "#999" }]} />
              <Text style={styles.headerSubtitle}>
                {doctorOnlineStatus ? "Online" : "Last seen recently"}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={clearChat}
          >
            <Ionicons name="refresh-outline" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContainer}
          ListFooterComponent={renderTypingIndicator}
          showsVerticalScrollIndicator={false}
        />

        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              placeholder={`Message ${contact.name}...`}
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

        <PopupNotification />
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
    backgroundColor: "#E8EAEF"
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
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#004C9C",
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
    overflow: 'hidden', // to ensure the image fits the rounded container
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 17.5,
  },
  systemAvatar: {
    backgroundColor: "#e8e8e8",
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
  systemBubble: {
    backgroundColor: "#f8f8f8",
    borderColor: "#ddd",
    borderWidth: 1,
  },
  errorBubble: {
    backgroundColor: "#ffebee",
    borderColor: "#f44336",
    borderWidth: 1,
  },
  senderText: {
    fontSize: 11,
    color: "#004C9C",
    fontWeight: "600",
    marginBottom: 4,
  },
  systemSenderText: {
    color: "#666",
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
  systemMessageText: {
    color: "#555",
    fontStyle: "italic",
  },
  errorMessageText: {
    color: "#d32f2f",
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
  systemMessageTime: {
    color: "#999",
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
  popupContainer: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 100,
  },
  popupContent: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  popupIcon: {
    marginRight: 10,
  },
  popupText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
})

export default ChatMessages