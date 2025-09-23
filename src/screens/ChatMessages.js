import React, { useState, useEffect, useContext } from "react";
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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserContext } from "../context/UserContext";
import {
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../config/firebaseConfig";

const ChatMessages = ({ navigation, route }) => {
  const { contact } = route.params;
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([]);
  const [doctorOnlineStatus, setDoctorOnlineStatus] = useState(true);
  const { userProfile } = useContext(UserContext);
  const [showPopup, setShowPopup] = useState(false);
  const [popupOpacity] = useState(new Animated.Value(0));

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

  useEffect(() => {
    navigation.setOptions({
      title: contact.name,
      headerRight: () => (
        <TouchableOpacity style={styles.headerButton} onPress={clearChat}>
          <Ionicons name="refresh-outline" size={20} color="#666" />
        </TouchableOpacity>
      ),
    });
  }, [navigation, contact.name]);

  useEffect(() => {
    if (!userProfile?.id) return;
    loadMessagesFromFirebase();
    setupFirebaseListener();
  }, [contact.id, userProfile]);

  const setupFirebaseListener = () => {
    if (!userProfile?.id) return;
    const messagesRef = collection(
      db,
      "chat_rooms",
      contact.id,
      "user_conversations",
      userProfile.id,
      "messages"
    );
    const messagesQuery = query(messagesRef, orderBy("timestamp", "asc"));
    const unsubscribe = onSnapshot(
      messagesQuery,
      (snapshot) => {
        const firebaseMessages = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            text: data.text || "",
            time: data.timestamp?.toDate
              ? data.timestamp.toDate().toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                })
              : getCurrentTime(),
            isFromUser: data.senderType === "user",
            sender:
              data.senderName ||
              (data.senderType === "admin" ? contact.name : userProfile?.name || "You"),
            isSystemMessage: data.senderType === "system",
            timestamp: data.timestamp?.toDate ? data.timestamp.toDate() : new Date(),
            senderType: data.senderType || "user",
          };
        });
        setMessages(firebaseMessages);
        saveMessagesToStorage(firebaseMessages);
      },
      (error) => {
        console.error("Firebase listener error:", error);
        loadMessagesFromStorage();
      }
    );
    return () => unsubscribe();
  };

  const loadMessagesFromFirebase = async () => {
    if (!userProfile?.id) {
      loadMessagesFromStorage();
      return;
    }
    try {
      const userConversationRef = doc(db, "chat_rooms", contact.id, "user_conversations", userProfile.id);
      const userConversationDoc = await getDoc(userConversationRef);
      if (!userConversationDoc.exists()) {
        await setDoc(userConversationRef, {
          userId: userProfile.id,
          userName: userProfile.name || userProfile.fullName || "User",
          userEmail: userProfile.email || "",
          lastMessage: "",
          lastMessageTime: serverTimestamp(),
          lastMessageSender: "",
          createdAt: serverTimestamp(),
        });
        const messagesRef = collection(db, "chat_rooms", contact.id, "user_conversations", userProfile.id, "messages");
        await addDoc(messagesRef, {
          text: `Welcome! You can send messages to ${contact.name}. ${doctorOnlineStatus ? "They are online and will respond soon." : "They will respond when they're available."}`,
          senderId: "system",
          senderName: "System",
          senderType: "system",
          timestamp: serverTimestamp(),
        });
      } else {
        const messagesRef = collection(db, "chat_rooms", contact.id, "user_conversations", userProfile.id, "messages");
        const messagesQuery = query(messagesRef, orderBy("timestamp", "asc"));
        const messagesSnapshot = await getDocs(messagesQuery);
        if (messagesSnapshot.empty) {
          await addDoc(messagesRef, {
            text: `Welcome! You can send messages to ${contact.name}. ${doctorOnlineStatus ? "They are online and will respond soon." : "They will respond when they're available."}`,
            senderId: "system",
            senderName: "System",
            senderType: "system",
            timestamp: serverTimestamp(),
          });
        }
      }
    } catch (error) {
      console.error("Error setting up Firebase conversation:", error);
      loadMessagesFromStorage();
    }
  };

  const loadMessagesFromStorage = async () => {
    try {
      const storedMessages = await AsyncStorage.getItem(`chat_${contact.id}`);
      if (storedMessages) {
        setMessages(JSON.parse(storedMessages));
      } else {
        const initialMessage = {
          id: "welcome_1",
          text: `Welcome! You can send messages to ${contact.name}. ${doctorOnlineStatus ? "" : "They will respond when they're available."}`,
          time: getCurrentTime(),
          isFromUser: false,
          sender: contact.name,
          isSystemMessage: true,
        };
        setMessages([initialMessage]);
        await saveMessagesToStorage([initialMessage]);
      }
    } catch (error) {
      console.error("Error loading messages from storage:", error);
      const initialMessage = {
        id: "welcome_1",
        text: `Welcome! You can send messages to ${contact.name}. ${doctorOnlineStatus ? "" : "They will respond when they're available."}`,
        time: getCurrentTime(),
        isFromUser: false,
        sender: contact.name,
        isSystemMessage: true,
      };
      setMessages([initialMessage]);
      await saveMessagesToStorage([initialMessage]);
    }
  };

  const saveMessagesToStorage = async (messagesToSave = messages) => {
    try {
      const serializableMessages = messagesToSave.map((msg) => ({
        ...msg,
        timestamp: msg.timestamp instanceof Date ? msg.timestamp.toISOString() : msg.timestamp,
      }));
      await AsyncStorage.setItem(`chat_${contact.id}`, JSON.stringify(serializableMessages));
    } catch (error) {
      console.error("Error saving messages to storage:", error);
    }
  };

  const getCurrentTime = () => new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });

  const showPopupNotification = () => {
    setShowPopup(true);
    Animated.timing(popupOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
    setTimeout(() => {
      Animated.timing(popupOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setShowPopup(false);
      });
    }, 2000);
  };

  const handleSend = async () => {
    const messageText = inputText.trim();
    if (messageText === "") return;
    setInputText("");
    setIsTyping(true);
    const userMessage = {
      id: Date.now().toString(),
      text: messageText,
      time: getCurrentTime(),
      isFromUser: true,
      sender: userProfile?.name || "You",
    };
    setMessages((prev) => [...prev, userMessage]);
    try {
      if (!userProfile?.id) throw new Error("User profile not found");
      const messagesRef = collection(db, "chat_rooms", contact.id, "user_conversations", userProfile.id, "messages");
      await addDoc(messagesRef, {
        text: messageText,
        senderId: userProfile.id,
        senderName: userProfile.name || userProfile.fullName || "You",
        senderType: "user",
        timestamp: serverTimestamp(),
      });
      const userConversationRef = doc(db, "chat_rooms", contact.id, "user_conversations", userProfile.id);
      await setDoc(
        userConversationRef,
        {
          userId: userProfile.id,
          userName: userProfile.name || userProfile.fullName || "User",
          userEmail: userProfile.email || "",
          lastMessage: messageText,
          lastMessageTime: serverTimestamp(),
          lastMessageSender: "user",
        },
        { merge: true }
      );
      setIsTyping(false);
      showPopupNotification();
    } catch (error) {
      console.error("Error sending message to Firebase:", error);
      setIsTyping(false);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        text: "Message saved locally. Will sync when connection is restored.",
        time: getCurrentTime(),
        isFromUser: false,
        sender: "System",
        isSystemMessage: true,
        isError: false,
      };
      setMessages((prev) => [...prev, errorMessage]);
      saveMessagesToStorage([...messages, userMessage, errorMessage]);
      showPopupNotification();
    }
  };

  const clearChat = async () => {
    try {
      await AsyncStorage.removeItem(`chat_${contact.id}`);
      if (userProfile?.id) {
        const messagesRef = collection(db, "chat_rooms", contact.id, "user_conversations", userProfile.id, "messages");
        const querySnapshot = await getDocs(messagesRef);
        const deletePromises = querySnapshot.docs.map((doc) => deleteDoc(doc.ref));
        await Promise.all(deletePromises);

        const userConversationRef = doc(db, "chat_rooms", contact.id, "user_conversations", userProfile.id);
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
          text: `Welcome! You can send messages to ${contact.name}. ${doctorOnlineStatus ? "They are online and will respond soon." : "They will respond when they're available."}`,
          senderId: "system",
          senderName: "System",
          senderType: "system",
          timestamp: serverTimestamp(),
        });
      }
      setMessages([]);
      loadMessagesFromFirebase();
    } catch (error) {
      console.error("Error clearing chat:", error);
    }
  };

  const renderMessage = ({ item }) => (
    <View style={[styles.messageRow, item.isFromUser ? styles.userRow : styles.botRow]}>
      {!item.isFromUser && (
        <View style={[styles.avatar, item.isSystemMessage && styles.systemAvatar]}>
          {item.isSystemMessage ? (
            <Ionicons name="information-circle" size={20} color="#666" />
          ) : (
            <LinearGradient colors={[contact.avatarColor || "#FF6B6B", `${contact.avatarColor || "#FF6B6B"}AA`]} style={styles.avatar}>
              <Text style={styles.avatarText}>{getInitials(contact.name)}</Text>
            </LinearGradient>
          )}
        </View>
      )}
      <View
        style={[
          styles.bubbleContainer,
          item.isFromUser ? styles.userBubble : styles.botBubble,
          item.isSystemMessage && styles.systemBubble,
          item.isError && styles.errorBubble,
        ]}
      >
        {!item.isFromUser && (
          <Text style={[styles.senderText, item.isSystemMessage && styles.systemSenderText]}>{item.sender}</Text>
        )}
        <Text
          style={[
            styles.messageText,
            item.isFromUser ? styles.userMessageText : styles.botMessageText,
            item.isSystemMessage && styles.systemMessageText,
            item.isError && styles.errorMessageText,
          ]}
        >
          {item.text}
        </Text>
        <Text
          style={[
            styles.messageTime,
            item.isFromUser ? styles.userMessageTime : styles.botMessageTime,
            item.isSystemMessage && styles.systemMessageTime,
          ]}
        >
          {item.time}
        </Text>
      </View>
      {item.isFromUser && (
        <View style={styles.avatar}>
          <LinearGradient colors={["#4ECDC4", "#4ECDC4AA"]} style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(userProfile?.name || "You")}</Text>
          </LinearGradient>
        </View>
      )}
    </View>
  );

  const renderTypingIndicator = () =>
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
    );

  const PopupNotification = () => (
    <Modal transparent={true} visible={showPopup} animationType="none" pointerEvents="none">
      <View style={styles.popupContainer}>
        <Animated.View style={[styles.popupContent, { opacity: popupOpacity }]}>
          <View style={styles.popupIcon}>
            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
          </View>
          <Text style={styles.popupText}>Message sent to {contact.name}</Text>
        </Animated.View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>{contact.name}</Text>
            <View style={styles.statusContainer}>
              <View style={[styles.statusDot, { backgroundColor: doctorOnlineStatus ? "#4CAF50" : "#999" }]} />
              <Text style={styles.headerSubtitle}>{doctorOnlineStatus ? "Online" : "Last seen recently"}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.headerButton} onPress={clearChat}>
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
              style={[styles.sendButton, (inputText.trim() === "" || isTyping) && { opacity: 0.5 }]}
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
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#ffffffff",
  },
  container: {
    flex: 1,
    backgroundColor: "#E8EAEF",
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
  },
  backButton: {
    marginRight: 15,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000",
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
    flex: 1,
  },
  messagesContainer: {
    paddingHorizontal: 15,
    paddingVertical: 20,
  },
  messageRow: {
    flexDirection: "row",
    marginBottom: 15,
    width: "100%",
  },
  userRow: {
    justifyContent: "flex-end",
  },
  botRow: {
    justifyContent: "flex-start",
  },
  avatar: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 6,
  },
  systemAvatar: {
    backgroundColor: "#e8e8e8",
  },
  avatarText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  bubbleContainer: {
    maxWidth: "75%",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  userBubble: {
    backgroundColor: "#004C9C",
    borderTopRightRadius: 5,
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
    lineHeight: 21,
  },
  userMessageText: {
    color: "#fff",
  },
  botMessageText: {
    color: "#000",
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
    marginTop: 5,
  },
  userMessageTime: {
    color: "#f5f5f5",
    textAlign: "right",
  },
  botMessageTime: {
    color: "#666",
    textAlign: "right",
  },
  systemMessageTime: {
    color: "#999",
    textAlign: "right",
  },
  typingBubble: {
    minHeight: 60,
    justifyContent: "center",
  },
  typingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  typingText: {
    color: "#666",
    fontSize: 14,
    fontStyle: "italic",
  },
  dotsContainer: {
    marginLeft: 8,
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
});

export default ChatMessages;