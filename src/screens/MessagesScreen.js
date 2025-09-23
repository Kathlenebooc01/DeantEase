import React, { useState, useEffect, useCallback, useContext } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, Alert, Modal, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Navbar from "../navigations/navbar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { UserContext } from "../context/UserContext";
import {
  collection,
  doc,
  onSnapshot,
  query,
  orderBy,
  getDoc,
  getDocs,
  deleteDoc,
  setDoc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../config/firebaseConfig";

const MessagesScreen = ({ navigation }) => {
  const [conversations, setConversations] = useState([]);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [fadeAnim] = useState(new Animated.Value(0));
  const { userProfile } = useContext(UserContext);

  // Utility function to get initials from a name
  const getInitials = (name) => {
    if (!name) return "??";
    const words = name.split(" ").filter((word) => word);
    let initials = "";
    if (words.length >= 2) {
      initials = words[0][0] + words[words.length - 1][0];
    } else if (words.length === 1) {
      initials = words[0][0];
    }
    return initials.toUpperCase();
  };

  const initializeConversations = () => {
    return [
      {
        id: "dr-jessica",
        name: "Dr. Jessica",
        lastMessage: "Welcome! You can send messages to Dr. Jessica.",
        time: getCurrentTime(),
        timestamp: new Date().toISOString(),
        unreadCount: 0,
        isAI: false,
        avatar: "person",
        isOnline: true,
        status: "Available",
        avatarColor: "#FF6B6B",
      },
    ];
  };

  const getCurrentTime = () =>
    new Date().toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

  const setupFirebaseListeners = useCallback(() => {
    if (!userProfile?.id) {
      setConversations(initializeConversations());
      return;
    }

    const doctors = ["dr-jessica", "jane-sy"];
    const unsubscribes = [];

    setConversations(initializeConversations());

    for (const doctorId of doctors) {
      const messagesRef = collection(db, "chat_rooms", doctorId, "user_conversations", userProfile.id, "messages");
      const messagesQuery = query(messagesRef, orderBy("timestamp", "desc"));

      const unsubscribe = onSnapshot(
        messagesQuery,
        (snapshot) => {
          let unreadCount = 0;
          let lastMessage = "";
          let lastMessageTime = "";
          let lastMessageTimestamp = new Date().toISOString();

          if (!snapshot.empty) {
            const latestMessage = snapshot.docs[0].data();
            lastMessage = latestMessage.text;
            lastMessageTimestamp = latestMessage.timestamp?.toDate
              ? latestMessage.timestamp.toDate().toISOString()
              : new Date().toISOString();
            lastMessageTime = latestMessage.timestamp?.toDate
              ? latestMessage.timestamp.toDate().toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                })
              : getCurrentTime();
          } else {
            const initialConversations = initializeConversations();
            const initialConv = initialConversations.find((conv) => conv.id === doctorId);
            if (initialConv) {
              lastMessage = initialConv.lastMessage;
              lastMessageTime = initialConv.time;
              lastMessageTimestamp = initialConv.timestamp;
            }
          }

          setConversations((prev) => {
            const updated = prev.map((conv) =>
              conv.id === doctorId
                ? {
                    ...conv,
                    lastMessage,
                    time: lastMessageTime,
                    timestamp: lastMessageTimestamp,
                    unreadCount,
                  }
                : conv
            );
            return updated.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
          });
        },
        (error) => {
          console.error(`Error listening to messages for ${doctorId}:`, error);
        }
      );

      unsubscribes.push(unsubscribe);
    }

    return () => unsubscribes.forEach((unsub) => unsub());
  }, [userProfile]);

  useFocusEffect(
    useCallback(() => {
      console.log("Messages screen focused. Setting up Firebase listeners.");
      const unsubscribe = setupFirebaseListeners();
      return () => {
        console.log("Messages screen blurred. Cleaning up listeners.");
        unsubscribe();
      };
    }, [setupFirebaseListeners])
  );

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const handleConversationPress = (contact) => {
    setShowContextMenu(false);
    const sanitizedContact = {
      id: contact.id,
      name: contact.name,
      isOnline: contact.isOnline,
      avatarColor: contact.avatarColor,
      status: contact.status,
    };
    navigation.navigate("ChatMessages", { contact: sanitizedContact });
  };

  const handleLongPress = (item, event) => {
    const { pageX, pageY } = event.nativeEvent;
    setSelectedConversation(item);
    setMenuPosition({ x: pageX, y: pageY });
    setShowContextMenu(true);
  };

  const markAsUnread = async () => {
    if (!selectedConversation) return;
    try {
      const updatedConversations = conversations.map((conv) =>
        conv.id === selectedConversation.id
          ? { ...conv, unreadCount: conv.unreadCount > 0 ? conv.unreadCount : 1, timestamp: new Date().toISOString() }
          : conv
      );
      const sortedConversations = updatedConversations.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setConversations(sortedConversations);
      await AsyncStorage.setItem("conversations", JSON.stringify(sortedConversations));
      setShowContextMenu(false);
      setSelectedConversation(null);
    } catch (error) {
      console.error("Error marking as unread:", error);
    }
  };

  const deleteConversation = () => {
    if (!selectedConversation) return;
    Alert.alert(
      "Clear Conversation",
      `Are you sure you want to clear all messages with ${selectedConversation.name}? This will clear all messages.`,
      [
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => {
            setShowContextMenu(false);
            setSelectedConversation(null);
          },
        },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.removeItem(`chat_${selectedConversation.id}`);

              if (userProfile?.id) {
                const messagesRef = collection(
                  db,
                  "chat_rooms",
                  selectedConversation.id,
                  "user_conversations",
                  userProfile.id,
                  "messages"
                );
                const querySnapshot = await getDocs(messagesRef);
                const deletePromises = querySnapshot.docs.map((doc) => deleteDoc(doc.ref));
                await Promise.all(deletePromises);

                const userConversationRef = doc(
                  db,
                  "chat_rooms",
                  selectedConversation.id,
                  "user_conversations",
                  userProfile.id
                );
                await setDoc(
                  userConversationRef,
                  {
                    userId: userProfile.id,
                    userName: userProfile.name || userProfile.fullName || "User",
                    userEmail: userProfile.email || "",
                    lastMessage: "",
                    lastMessageTime: serverTimestamp(),
                    lastMessageSender: "",
                    createdAt: serverTimestamp(),
                  },
                  { merge: true }
                );

                await addDoc(messagesRef, {
                  text: `Welcome! You can send messages to ${selectedConversation.name}. ${
                    selectedConversation.isOnline
                      ? "They are online and will respond soon."
                      : "They will respond when they're available."
                  }`,
                  senderId: "system",
                  senderName: "System",
                  senderType: "system",
                  timestamp: serverTimestamp(),
                });
              }

              const updatedConversations = conversations.map((conv) =>
                conv.id === selectedConversation.id
                  ? { ...initializeConversations().find((c) => c.id === conv.id) }
                  : conv
              );
              const sortedConversations = updatedConversations.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
              setConversations(sortedConversations);
              await AsyncStorage.setItem("conversations", JSON.stringify(sortedConversations));
              setShowContextMenu(false);
              setSelectedConversation(null);
              Alert.alert("Success", "Conversation cleared successfully!");
            } catch (error) {
              console.error("Error clearing conversation:", error);
              Alert.alert("Error", "Failed to clear conversation. Please try again.");
              setShowContextMenu(false);
              setSelectedConversation(null);
            }
          },
        },
      ]
    );
  };

  const ContextMenu = () => (
    <Modal
      transparent={true}
      visible={showContextMenu}
      animationType="fade"
      onRequestClose={() => {
        setShowContextMenu(false);
        setSelectedConversation(null);
      }}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => {
          setShowContextMenu(false);
          setSelectedConversation(null);
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
            <Text style={[styles.contextMenuText, { color: "#FF6B6B" }]}>Clear all messages</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  const renderMessageItem = ({ item }) => (
    <Animated.View
      style={[{ opacity: fadeAnim, transform: [{ translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [50, 0] }) }] }]}
    >
      <TouchableOpacity
        style={[styles.messageItem, item.unreadCount > 0 && styles.unreadMessageItem]}
        onPress={() => handleConversationPress(item)}
        onLongPress={(event) => handleLongPress(item, event)}
        delayLongPress={500}
        activeOpacity={0.95}
      >
        <View style={styles.avatarContainer}>
          <LinearGradient colors={[item.avatarColor || "#4ECDC4", item.avatarColor ? `${item.avatarColor}AA` : "#4ECDC4AA"]} style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(item.name)}</Text>
          </LinearGradient>
        </View>
        <View style={styles.messageContent}>
          <View style={styles.messageHeader}>
            <View style={styles.nameContainer}>
              <Text style={[styles.contactName, item.unreadCount > 0 && styles.unreadContactName]}>{item.name}</Text>
            </View>
            <View style={styles.timeContainer}>
              <Text style={styles.messageTime}>{item.time}</Text>
              {item.unreadCount > 0 && (
                <LinearGradient colors={["#6B73FF", "#9C88FF"]} style={styles.unreadBadge}>
                  <Text style={styles.unreadCount}>{item.unreadCount}</Text>
                </LinearGradient>
              )}
            </View>
          </View>
          <Text style={[styles.messagePreview, item.unreadCount > 0 && styles.unreadMessagePreview]} numberOfLines={2}>
            {item.lastMessage}
          </Text>
        </View>
        <View style={styles.chevronContainer}>
          <Ionicons name="chevron-forward" size={20} color="#D1D9FF" />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  const getTotalUnreadCount = () => conversations.reduce((total, conv) => total + conv.unreadCount, 0);

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <LinearGradient colors={["#6B73FF20", "#9C88FF20"]} style={styles.emptyIconContainer}>
        <Ionicons name="chatbubbles-outline" size={64} color="#6B73FF" />
      </LinearGradient>
      <Text style={styles.emptyTitle}>No messages yet</Text>
      <Text style={styles.emptySubtitle}>Start a conversation with our experienced dental professionals</Text>
      <View style={styles.doctorCardsContainer}>
        {initializeConversations().map((doctor) => (
          <TouchableOpacity key={doctor.id} style={styles.doctorCard} onPress={() => handleConversationPress(doctor)}>
            <LinearGradient colors={[doctor.avatarColor, `${doctor.avatarColor}80`]} style={styles.doctorAvatar}>
              <Text style={styles.avatarText}>{getInitials(doctor.name)}</Text>
            </LinearGradient>
            <View style={styles.doctorInfo}>
              <Text style={styles.doctorName}>{doctor.name}</Text>
              <Text style={styles.doctorStatusText}>{doctor.status}</Text>
            </View>
            <Ionicons name="arrow-forward" size={20} color="#6B73FF" />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#FFFFFF", "#F8FAFF"]} style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Messages</Text>
            {getTotalUnreadCount() > 0 && (
              <LinearGradient colors={["#FF6B6B", "#FF8E8E"]} style={styles.headerBadge}>
                <Text style={styles.headerBadgeText}>{getTotalUnreadCount()}</Text>
              </LinearGradient>
            )}
          </View>
          <TouchableOpacity style={styles.headerButton}>
            <LinearGradient colors={["#6B73FF10", "#9C88FF10"]} style={styles.headerButtonGradient}>
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
      <ContextMenu />
    </SafeAreaView>
  );
};

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
  avatarText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  doctorAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
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
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  doctorStatusText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  contextMenu: {
    position: "absolute",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 12,
    minWidth: 180,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  contextMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  contextMenuText: {
    fontSize: 16,
    color: "#374151",
    marginLeft: 12,
    fontWeight: "600",
  },
  contextMenuSeparator: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginVertical: 8,
    marginHorizontal: 12,
  },
});

export default MessagesScreen;