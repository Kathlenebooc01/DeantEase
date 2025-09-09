"use client"

import { useState } from "react"
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
} from "react-native"
import { Ionicons } from "@expo/vector-icons"


const ChatMessages = ({ navigation, route }) => {
  const { contact } = route.params
  const [inputText, setInputText] = useState("")

  const [messages, setMessages] = useState([
    {
      id: "1",
      text: "Good day, This is your Dr. Jessieca from Fano Dental Clinic. Looking forward to see you soon.",
      time: "8:30 AM",
      isFromUser: false,
    },
    {
      id: "2",
      text: "Hello, see you soon.",
      time: "8:40 AM",
      isFromUser: true,
    },
  ])

  const renderMessage = ({ item }) => (
    <View
      style={[styles.messageContainer, item.isFromUser ? styles.userMessageContainer : styles.otherMessageContainer]}
    >
      {!item.isFromUser && (
        <View style={styles.avatar}>
          <Ionicons name="person" size={20} color="#666" />
        </View>
      )}
      <View style={[styles.messageBubble, item.isFromUser ? styles.userMessage : styles.otherMessage]}>
        <Text style={[styles.messageText, item.isFromUser ? styles.userMessageText : styles.otherMessageText]}>
          {item.text}
        </Text>
        <Text style={[styles.messageTime, item.isFromUser ? styles.userMessageTime : styles.otherMessageTime]}>
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

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{contact.name}</Text>
        </View>

        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContainer}
        />

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Write a message..."
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
        </View>

        
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    marginTop: 30,
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000",
  },
  messagesList: {
    flex: 1,
  },
  messagesContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  messageContainer: {
    flexDirection: "row",
    marginBottom: 20,
    alignItems: "flex-end",
  },
  userMessageContainer: {
    justifyContent: "flex-end",
  },
  otherMessageContainer: {
    justifyContent: "flex-start",
  },
  avatar: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 8,
  },
  messageBubble: {
    maxWidth: "70%",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
  },
  userMessage: {
    backgroundColor: "#87CEEB",
    marginRight: 0,
  },
  otherMessage: {
    backgroundColor: "#E5E5E5",
    marginLeft: 0,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  userMessageText: {
    color: "#000",
  },
  otherMessageText: {
    color: "#000",
  },
  messageTime: {
    fontSize: 12,
    marginTop: 5,
  },
  userMessageTime: {
    color: "#000",
    textAlign: "right",
  },
  otherMessageTime: {
    color: "#666",
    textAlign: "right",
  },
  inputContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  textInput: {
    backgroundColor: "#f0f0f0",
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 100,
  },
})

export default ChatMessages
