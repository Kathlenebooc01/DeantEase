import React, { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, Alert, Modal, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import Navbar from '../navigations/navbar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const MessagesScreen = ({ navigation }) => {
  const [conversations, setConversations] = useState([])
  const [showContextMenu, setShowContextMenu] = useState(false)
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 })
  const [fadeAnim] = useState(new Animated.Value(0))
  
  // Initialize conversations data with real doctors
  const initializeConversations = () => {
    const initialConversations = [
      {
        id: "dr-jessica",
        name: "Dr. Jessica",
        lastMessage: "Welcome! You can send messages to Dr. Jessica. They are currently online and will respond soon.",
        time: getCurrentTime(),
        unreadCount: 0,
        isAI: false,
        avatar: "person",
        isOnline: true,
        specialty: "General Dentistry",
        status: "Available",
        avatarColor: "#FF6B6B",
      },
      {
        id: "jane-sy",
        name: "Jane Sy",
        lastMessage: "Welcome! You can send messages to Jane Sy. They are currently online and will respond soon.",
        time: getCurrentTime(),
        unreadCount: 0,
        isAI: false,
        avatar: "person",
        isOnline: Math.random() > 0.5,
        specialty: "Pediatric Dentistry",
        status: Math.random() > 0.5 ? "Available" : "Busy",
        avatarColor: "#4ECDC4",
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
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start()
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
            <Ionicons name="mail-outline" size={20} color="#6B73FF" />
            <Text style={styles.contextMenuText}>Mark as unread</Text>
          </TouchableOpacity>
          
          <View style={styles.contextMenuSeparator} />
          
          <TouchableOpacity style={styles.contextMenuItem} onPress={deleteConversation}>
            <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
            <Text style={[styles.contextMenuText, { color: "#FF6B6B" }]}>Delete conversation</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  )

  const renderMessageItem = ({ item, index }) => (
    <Animated.View 
      style={[
        { 
          opacity: fadeAnim,
          transform: [{
            translateY: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [50, 0]
            })
          }]
        }
      ]}
    >
      <TouchableOpacity 
        style={[
          styles.messageItem,
          item.unreadCount > 0 && styles.unreadMessageItem
        ]} 
        onPress={() => handleConversationPress(item)}
        onLongPress={(event) => handleLongPress(item, event)}
        delayLongPress={500}
        activeOpacity={0.95}
      >
        <View style={styles.avatarContainer}>
          <LinearGradient
            colors={[item.avatarColor || "#4ECDC4", item.avatarColor ? `${item.avatarColor}AA` : "#4ECDC4AA"]}
            style={styles.avatar}
          >
            <Ionicons 
              name="person" 
              size={26} 
              color="#FFFFFF"
            />
          </LinearGradient>
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
            </View>
            <View style={styles.timeContainer}>
              <Text style={styles.messageTime}>
                {formatTime(item.time)}
              </Text>
              {item.unreadCount > 0 && (
                <LinearGradient
                  colors={['#6B73FF', '#9C88FF']}
                  style={styles.unreadBadge}
                >
                  <Text style={styles.unreadCount}>{item.unreadCount}</Text>
                </LinearGradient>
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
              <View style={styles.specialtyBadge}>
                <Ionicons name="medical" size={12} color="#3B82F6" />
                <Text style={styles.specialtyText}>{item.specialty}</Text>
              </View>
            )}
          </View>
        </View>
        
        <View style={styles.chevronContainer}>
          <Ionicons name="chevron-forward" size={20} color="#D1D9FF" />
        </View>
      </TouchableOpacity>
    </Animated.View>
  )

  const getStatusColor = (status) => {
    switch (status) {
      case "Available": return "#10B981"
      case "Busy": return "#F59E0B"
      default: return "#9CA3AF"
    }
  }

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <LinearGradient
        colors={['#6B73FF20', '#9C88FF20']}
        style={styles.emptyIconContainer}
      >
        <Ionicons name="chatbubbles-outline" size={64} color="#6B73FF" />
      </LinearGradient>
      <Text style={styles.emptyTitle}>No messages yet</Text>
      <Text style={styles.emptySubtitle}>
        Start a conversation with our experienced dental professionals
      </Text>
      
      <View style={styles.doctorCardsContainer}>
        {conversations.map((doctor, index) => (
          <TouchableOpacity 
            key={doctor.id}
            style={styles.doctorCard}
            onPress={() => handleConversationPress(doctor)}
          >
            <LinearGradient
              colors={[doctor.avatarColor || "#4ECDC4", `${doctor.avatarColor || "#4ECDC4"}80`]}
              style={styles.doctorAvatar}
            >
              <Ionicons name="person" size={24} color="#FFFFFF" />
            </LinearGradient>
            <View style={styles.doctorInfo}>
              <Text style={styles.doctorName}>{doctor.name}</Text>
              <Text style={styles.doctorSpecialty}>{doctor.specialty}</Text>
              <View style={[styles.doctorStatus, { backgroundColor: getStatusColor(doctor.status) }]}>
                <Text style={styles.doctorStatusText}>{doctor.status}</Text>
              </View>
            </View>
            <Ionicons name="arrow-forward" size={20} color="#6B73FF" />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  )

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#FFFFFF', '#F8FAFF']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>
              Messages
            </Text>
            {getTotalUnreadCount() > 0 && (
              <LinearGradient
                colors={['#FF6B6B', '#FF8E8E']}
                style={styles.headerBadge}
              >
                <Text style={styles.headerBadgeText}>{getTotalUnreadCount()}</Text>
              </LinearGradient>
            )}
          </View>
          <TouchableOpacity style={styles.headerButton}>
            <LinearGradient
              colors={['#6B73FF10', '#9C88FF10']}
              style={styles.headerButtonGradient}
            >
              <Ionicons name="search" size={22} color="#6B73FF" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {conversations.length > 0 ? (
        <FlatList
          data={conversations}
          renderItem={renderMessageItem}
          keyExtractor={(item) => item.id}
          style={styles.messagesList}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.messagesListContent}
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

const getStatusColor = (status) => {
  switch (status) {
    case "Available": return "#10B981"
    case "Busy": return "#F59E0B"
    default: return "#9CA3AF"
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFF",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(107, 115, 255, 0.1)",
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1F2937",
    marginRight: 12,
  },
  headerBadge: {
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  headerBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  headerButton: {
    overflow: "hidden",
    borderRadius: 12,
  },
  headerButtonGradient: {
    padding: 12,
    borderRadius: 12,
  },
  messagesList: {
    flex: 1,
  },
  messagesListContent: {
    paddingTop: 8,
  },
  messageItem: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 16,
    shadowColor: "#3B82F6",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  unreadMessageItem: {
    backgroundColor: "#F0F4FF",
    borderLeftWidth: 4,
    borderLeftColor: "#3B82F6",
    shadowOpacity: 0.15,
  },
  avatarContainer: {
    position: "relative",
    marginRight: 16,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  messageContent: {
    flex: 1,
  },
  messageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  nameContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 12,
  },
  contactName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginRight: 8,
  },
  unreadContactName: {
    color: "#3B82F6",
  },
  statusTag: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusTagText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "600",
  },
  timeContainer: {
    alignItems: "flex-end",
  },
  messageTime: {
    fontSize: 12,
    color: "#9CA3AF",
    marginBottom: 4,
    fontWeight: "500",
  },
  unreadBadge: {
    borderRadius: 12,
    minWidth: 22,
    height: 22,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  unreadCount: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },
  messagePreview: {
    fontSize: 15,
    color: "#6B7280",
    lineHeight: 22,
    marginBottom: 6,
  },
  unreadMessagePreview: {
    color: "#374151",
    fontWeight: "500",
  },
  specialtyContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  specialtyBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  specialtyText: {
    fontSize: 12,
    color: "#3B82F6",
    fontWeight: "600",
    marginLeft: 4,
  },
  chevronContainer: {
    justifyContent: "center",
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1F2937",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
  },
  doctorCardsContainer: {
    width: "100%",
  },
  doctorCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: "#6B73FF",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  doctorAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  doctorSpecialty: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 6,
  },
  doctorStatus: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  doctorStatusText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "600",
  },
  // Context Menu Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  contextMenu: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 12,
    minWidth: 180,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  contextMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  contextMenuText: {
    fontSize: 16,
    color: '#374151',
    marginLeft: 12,
    fontWeight: '600',
  },
  contextMenuSeparator: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 8,
    marginHorizontal: 12,
  },
})

export default MessagesScreen