import React, { useState, useEffect, useCallback } from "react"
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, Alert, Modal } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import Navbar from '../navigations/navbar'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useFocusEffect } from '@react-navigation/native'

const MessagesScreen = ({ navigation }) => {
  const [conversations, setConversations] = useState([])
  const [showContextMenu, setShowContextMenu] = useState(false)
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 })
  
  // Initialize conversations data with real doctors
  const initializeConversations = () => {
    const initialConversations = [
      {
        id: "dr-jessica",
        name: "Dr. Jessica",
        lastMessage: "Welcome! You can send messages to Dr. Jessica. They are currently online and will respond soon.",
        time: getCurrentTime(),
        unreadCount: 0, // Start with 0 since it's just a welcome message
        isAI: false,
        avatar: "person",
        isOnline: true,
        specialty: "General Dentistry",
        status: "Available",
      },
      {
        id: "jane-sy",
        name: "Jane Sy",
        lastMessage: "Welcome! You can send messages to Jane Sy. They are currently online and will respond soon.",
        time: getCurrentTime(),
        unreadCount: 0, // Start with 0 since it's just a welcome message
        isAI: false,
        avatar: "person",
        isOnline: Math.random() > 0.5, // Random online status for demo
        specialty: "Pediatric Dentistry",
        status: Math.random() > 0.5 ? "Available" : "Busy",
      },
    ]
    return initialConversations
  }

  // Force reset conversations (for development/testing)
  const resetConversations = async () => {
    try {
      await AsyncStorage.removeItem('conversations')
      const initialConversations = initializeConversations()
      setConversations(initialConversations)
      await AsyncStorage.setItem('conversations', JSON.stringify(initialConversations))
      console.log('Force reset conversations')
    } catch (error) {
      console.error('Error resetting conversations:', error)
    }
  }

  // Load conversations from storage or initialize
  const loadConversations = async () => {
    try {
      const storedConversations = await AsyncStorage.getItem('conversations')
      if (storedConversations) {
        const parsed = JSON.parse(storedConversations)
        setConversations(parsed)
        console.log('Loaded conversations from storage:', parsed)
      } else {
        const initialConversations = initializeConversations()
        setConversations(initialConversations)
        await AsyncStorage.setItem('conversations', JSON.stringify(initialConversations))
        console.log('Initialized conversations')
      }
    } catch (error) {
      console.error('Error loading conversations:', error)
      const initialConversations = initializeConversations()
      setConversations(initialConversations)
    }
  }

  // Load conversations when component mounts
  useEffect(() => {
    loadConversations()
  }, [])

  // Refresh conversations every time screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log('Messages screen focused - reloading conversations')
      loadConversations()
    }, [])
  )

  const getCurrentTime = () => {
    const now = new Date()
    return now.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const formatTime = (timeString) => {
    if (timeString === "Yesterday" || timeString.includes(":")) {
      return timeString
    }
    return timeString
  }

  const getTotalUnreadCount = () => {
    return conversations.reduce((total, conv) => total + conv.unreadCount, 0)
  }

  const handleConversationPress = async (contact) => {
    // Hide context menu if it's showing
    setShowContextMenu(false)
    
    // Mark conversation as read locally and in storage
    const updatedConversations = conversations.map(conv => 
      conv.id === contact.id 
        ? { ...conv, unreadCount: 0 }
        : conv
    )
    
    setConversations(updatedConversations)
    
    // Save updated conversations to storage
    try {
      await AsyncStorage.setItem('conversations', JSON.stringify(updatedConversations))
      console.log('Marked conversation as read:', contact.id)
    } catch (error) {
      console.error('Error saving conversations:', error)
    }

    // Navigate to chat with the contact data and callback
    navigation.navigate("ChatMessages", { 
      contact,
      onUpdateLastMessage: updateLastMessage 
    })
  }

  // Handle long press for context menu
  const handleLongPress = (item, event) => {
    const { pageX, pageY } = event.nativeEvent
    setSelectedConversation(item)
    setMenuPosition({ x: pageX, y: pageY })
    setShowContextMenu(true)
  }

  // Mark as unread
  const markAsUnread = async () => {
    if (!selectedConversation) return
    
    try {
      const updatedConversations = conversations.map(conv => 
        conv.id === selectedConversation.id 
          ? { ...conv, unreadCount: conv.unreadCount > 0 ? conv.unreadCount : 1 }
          : conv
      )
      
      setConversations(updatedConversations)
      await AsyncStorage.setItem('conversations', JSON.stringify(updatedConversations))
      console.log('Marked conversation as unread:', selectedConversation.id)
      
      setShowContextMenu(false)
      setSelectedConversation(null)
    } catch (error) {
      console.error('Error marking as unread:', error)
    }
  }

  // Delete conversation
  const deleteConversation = () => {
    if (!selectedConversation) return
    
    Alert.alert(
      "Delete Conversation",
      `Are you sure you want to delete all messages with ${selectedConversation.name}? This action cannot be undone.`,
      [
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => {
            setShowContextMenu(false)
            setSelectedConversation(null)
          }
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              // Remove chat messages from storage
              await AsyncStorage.removeItem(`chat_${selectedConversation.id}`)
              
              // Reset conversation to initial state without welcome message
              const updatedConversations = conversations.map(conv => 
                conv.id === selectedConversation.id 
                  ? { 
                      ...conv, 
                      lastMessage: conv.id === "dr-jessica" ? "At Fano Dental Clinic, we offer..." : "Tap to start conversation",
                      time: getCurrentTime(),
                      unreadCount: 0
                    }
                  : conv
              )
              
              setConversations(updatedConversations)
              await AsyncStorage.setItem('conversations', JSON.stringify(updatedConversations))
              
              console.log(`Deleted conversation for ${selectedConversation.id}`)
              
              setShowContextMenu(false)
              setSelectedConversation(null)
              
              // Show confirmation
              Alert.alert("Success", "Conversation deleted successfully!")
              
            } catch (error) {
              console.error('Error deleting conversation:', error)
              Alert.alert("Error", "Failed to delete conversation. Please try again.")
              setShowContextMenu(false)
              setSelectedConversation(null)
            }
          }
        }
      ]
    )
  }

  // Function to update last message from chat screen
  const updateLastMessage = async (contactId, lastMessage, time) => {
    try {
      console.log('Updating last message for:', contactId, 'with:', lastMessage)
      
      // First, get the current conversations from storage to ensure we have the latest
      const storedConversations = await AsyncStorage.getItem('conversations')
      let currentConversations = conversations
      
      if (storedConversations) {
        currentConversations = JSON.parse(storedConversations)
      }
      
      // Update the conversations
      const updatedConversations = currentConversations.map(conv => 
        conv.id === contactId 
          ? { 
              ...conv, 
              lastMessage: lastMessage,
              time: time,
              unreadCount: 0 // Keep unread count as 0 since user is actively chatting
            }
          : conv
      )
      
      // Update local state
      setConversations(updatedConversations)
      
      // Save to AsyncStorage
      await AsyncStorage.setItem('conversations', JSON.stringify(updatedConversations))
      
      console.log('Successfully updated last message for:', contactId)
    } catch (error) {
      console.error('Error updating last message:', error)
    }
  }

  // Context Menu Component
  const ContextMenu = () => (
    <Modal
      transparent={true}
      visible={showContextMenu}
      animationType="fade"
      onRequestClose={() => {
        setShowContextMenu(false)
        setSelectedConversation(null)
      }}
    >
      <TouchableOpacity 
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => {
          setShowContextMenu(false)
          setSelectedConversation(null)
        }}
      >
        <View style={[styles.contextMenu, { top: menuPosition.y - 100, left: Math.max(10, menuPosition.x - 75) }]}>
          <TouchableOpacity style={styles.contextMenuItem} onPress={markAsUnread}>
            <Ionicons name="mail-outline" size={20} color="#333" />
            <Text style={styles.contextMenuText}>Mark as unread</Text>
          </TouchableOpacity>
          
          <View style={styles.contextMenuSeparator} />
          
          <TouchableOpacity style={styles.contextMenuItem} onPress={deleteConversation}>
            <Ionicons name="trash-outline" size={20} color="#E91E63" />
            <Text style={[styles.contextMenuText, { color: "#E91E63" }]}>Delete conversation</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  )

  const renderMessageItem = ({ item }) => (
    <TouchableOpacity 
      style={[
        styles.messageItem,
        item.unreadCount > 0 && styles.unreadMessageItem
      ]} 
      onPress={() => handleConversationPress(item)}
      onLongPress={(event) => handleLongPress(item, event)}
      delayLongPress={500}
    >
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Ionicons 
            name="person" 
            size={24} 
            color="#004C9C"
          />
        </View>
      </View>

      <View style={styles.messageContent}>
        <View style={styles.messageHeader}>
          <View style={styles.nameContainer}>
            <Text style={[
              styles.contactName,
              item.unreadCount > 0 && styles.unreadContactName
            ]}>
              {item.name}
            </Text>
            <View style={[
              styles.statusTag,
              { backgroundColor: item.status === "Available" ? "#4CAF50" : item.status === "Busy" ? "#FF9800" : "#999" }
            ]}>
              <Text style={styles.statusTagText}>{item.status || "Offline"}</Text>
            </View>
          </View>
          <View style={styles.timeContainer}>
            <Text style={styles.messageTime}>
              {formatTime(item.time)}
            </Text>
            {item.unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadCount}>{item.unreadCount}</Text>
              </View>
            )}
          </View>
        </View>
        <Text 
          style={[
            styles.messagePreview,
            item.unreadCount > 0 && styles.unreadMessagePreview
          ]} 
          numberOfLines={2}
        >
          {item.lastMessage}
        </Text>
        <View style={styles.specialtyContainer}>
          {item.specialty && (
            <Text style={styles.specialtyText}>{item.specialty}</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  )

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="chatbubbles-outline" size={64} color="#ccc" />
      <Text style={styles.emptyTitle}>No messages yet</Text>
      <Text style={styles.emptySubtitle}>
        Start a conversation with our doctors
      </Text>
      <TouchableOpacity 
        style={styles.startChatButton}
        onPress={() => handleConversationPress(conversations[0])}
      >
        <Text style={styles.startChatButtonText}>Start Chat with Dr. Jessica</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.startChatButton, styles.secondaryButton]}
        onPress={() => handleConversationPress(conversations[1])}
      >
        <Text style={[styles.startChatButtonText, styles.secondaryButtonText]}>Start Chat with Jane Sy</Text>
      </TouchableOpacity>
    </View>
  )

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          Messages {getTotalUnreadCount() > 0 && `(${getTotalUnreadCount()})`}
        </Text>
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="search" size={24} color="#E91E63" />
        </TouchableOpacity>
      </View>

      {conversations.length > 0 ? (
        <FlatList
          data={conversations}
          renderItem={renderMessageItem}
          keyExtractor={(item) => item.id}
          style={styles.messagesList}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        renderEmptyState()
      )}

      <Navbar navigation={navigation} activeTab="Message" />
      
      {/* Context Menu */}
      <ContextMenu />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF6F0",
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
    marginTop: 30,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
  },
  headerButton: {
    padding: 8,
  },
  messagesList: {
    flex: 1,
  },
  messageItem: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
    backgroundColor: "#FFFFFF",
  },
  unreadMessageItem: {
    backgroundColor: "#FFF9F9",
  },
  avatarContainer: {
    position: "relative",
    marginRight: 15,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#E3F2FD",
    justifyContent: "center",
    alignItems: "center",
  },
  offlineAvatar: {
    backgroundColor: "#f0f0f0",
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#4CAF50",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  messageContent: {
    flex: 1,
  },
  messageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 5,
  },
  nameContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  contactName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
  },
  unreadContactName: {
    fontWeight: "700",
  },
  statusTag: {
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
  },
  statusTagText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "600",
  },
  timeContainer: {
    alignItems: "flex-end",
  },
  messageTime: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  unreadBadge: {
    backgroundColor: "#E91E63",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  unreadCount: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  messagePreview: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  unreadMessagePreview: {
    color: "#333",
    fontWeight: "500",
  },
  specialtyContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  specialtyText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "400",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  startChatButton: {
    backgroundColor: "#E91E63",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    marginBottom: 12,
  },
  startChatButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#E91E63",
  },
  secondaryButtonText: {
    color: "#E91E63",
  },
  // Context Menu Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  contextMenu: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 8,
    minWidth: 160,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  contextMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  contextMenuText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
    fontWeight: '500',
  },
  contextMenuSeparator: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 4,
  },
})

export default MessagesScreen