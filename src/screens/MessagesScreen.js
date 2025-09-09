import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import Navbar from '../navigations/navbar';

const MessagesScreen = ({ navigation }) => {
  const messages = [
    {
      id: "1",
      name: "Dr. Jessieca",
      message: "Good day, This is your Dr. Jessieca from Fano Dental Clinic. Looking forward to see you....",
      time: "8:30",
      avatar: null,
    },
    {
      id: "2",
      name: "Jane Sy",
      message: "Hello! This is Jane Sy from Fano Dental Clinic. We'd like to remind you of your appointment on",
      time: "10:30",
      avatar: null,
    },
  ]

  const renderMessageItem = ({ item }) => (
    <TouchableOpacity style={styles.messageItem} onPress={() => navigation.navigate("ChatMessages", { contact: item })}>
      <View style={styles.avatar}>
        <Ionicons name="person" size={24} color="#666" />
      </View>
      <View style={styles.messageContent}>
        <View style={styles.messageHeader}>
          <Text style={styles.contactName}>{item.name}</Text>
          <Text style={styles.messageTime}>{item.time}</Text>
        </View>
        <Text style={styles.messagePreview} numberOfLines={2}>
          {item.message}
        </Text>
      </View>
    </TouchableOpacity>
  )

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Inbox(1)</Text>
      </View>

      <FlatList
        data={messages}
        renderItem={renderMessageItem}
        keyExtractor={(item) => item.id}
        style={styles.messagesList}
      />

      <Navbar navigation={navigation} activeTab="Message" />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    marginTop: 30,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
  },
  messagesList: {
    flex: 1,
  },
  messageItem: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  messageContent: {
    flex: 1,
  },
  messageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  contactName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
  },
  messageTime: {
    fontSize: 14,
    color: "#666",
  },
  messagePreview: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
})

export default MessagesScreen
