"use client"
import React, { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { SafeAreaProvider } from "react-native-safe-area-context"

// Import Firebase Auth & Firestore functions and your config
import { 
  getAuth,
  updateProfile,
  updateEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { auth, db } from "../config/firebaseConfig"

export default function AccountSettingsScreen({ navigation }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmNewPassword, setConfirmNewPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [generalError, setGeneralError] = useState("")
  const [generalSuccess, setGeneralSuccess] = useState("")

  // State for input focus
  const [fullNameFocused, setFullNameFocused] = useState(false)
  const [emailFocused, setEmailFocused] = useState(false)
  const [passwordFocused, setPasswordFocused] = useState(false)
  const [newPasswordFocused, setNewPasswordFocused] = useState(false)
  const [confirmNewPasswordFocused, setConfirmNewPasswordFocused] = useState(false)

  // Fetch current user data on component load
  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser
      if (user) {
        setCurrentUser(user)
        setFullName(user.displayName || "")
        setEmail(user.email || "")
      }
    }
    fetchUserData()
  }, [])

  const handleUpdateProfile = async () => {
    setIsLoading(true)
    setGeneralError("")
    setGeneralSuccess("")

    try {
      // Update name if it has changed
      if (fullName !== currentUser.displayName) {
        await updateProfile(currentUser, { displayName: fullName })
        setGeneralSuccess("Profile updated successfully!")
      }

      // Re-authenticate and update email/password if they have changed
      if (email !== currentUser.email || newPassword) {
        if (!password) {
          setGeneralError("Please enter your current password to update email or password.")
          setIsLoading(false)
          return
        }

        const credential = EmailAuthProvider.credential(currentUser.email, password)
        await reauthenticateWithCredential(currentUser, credential)

        if (email !== currentUser.email) {
          await updateEmail(currentUser, email)
          setGeneralSuccess("Email updated successfully!")
        }

        if (newPassword) {
          if (newPassword.length < 6) {
            setGeneralError("New password must be at least 6 characters.")
            setIsLoading(false)
            return
          }
          if (newPassword !== confirmNewPassword) {
            setGeneralError("New passwords do not match.")
            setIsLoading(false)
            return
          }
          await updatePassword(currentUser, newPassword)
          setGeneralSuccess("Password updated successfully!")
        }
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      if (error.code === 'auth/wrong-password') {
        setGeneralError("Invalid current password.")
      } else if (error.code === 'auth/email-already-in-use') {
        setGeneralError("This email is already in use by another account.")
      } else {
        setGeneralError("Failed to update profile. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateProfilePicture = async () => {
    // This functionality requires a library like expo-image-picker
    // and a storage service like Firebase Storage.
    // Placeholder logic for now.
    console.log("Change profile picture pressed. This would open an image picker.")
  }

  const navigateBack = () => {
    navigation?.goBack()
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={navigateBack} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Account Settings</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
          >
            {/* Profile Picture Section */}
            <View style={styles.profilePictureSection}>
              <Image
                source={currentUser?.photoURL ? { uri: currentUser.photoURL } : require("../../assets/profile/photo.png")}
                style={styles.profileImage}
              />
              <TouchableOpacity onPress={handleUpdateProfilePicture}>
                <Text style={styles.changePhotoText}>Change Photo</Text>
              </TouchableOpacity>
            </View>

            {/* Status Messages */}
            {generalError ? <Text style={styles.errorText}>{generalError}</Text> : null}
            {generalSuccess ? <Text style={styles.successText}>{generalSuccess}</Text> : null}

            {/* Edit Profile Form */}
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>Edit Profile</Text>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Full Name</Text>
                <View style={[styles.inputWrapper, fullNameFocused && styles.inputFocused]}>
                  <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={fullName}
                    onChangeText={setFullName}
                    onFocus={() => setFullNameFocused(true)}
                    onBlur={() => setFullNameFocused(false)}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email Address</Text>
                <View style={[styles.inputWrapper, emailFocused && styles.inputFocused]}>
                  <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                    keyboardType="email-address"
                  />
                </View>
              </View>
            </View>

            {/* Change Password Form */}
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>Change Password</Text>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Current Password</Text>
                <View style={[styles.inputWrapper, passwordFocused && styles.inputFocused]}>
                  <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Required for any changes"
                    value={password}
                    onChangeText={setPassword}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                    secureTextEntry
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>New Password</Text>
                <View style={[styles.inputWrapper, newPasswordFocused && styles.inputFocused]}>
                  <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Leave blank if not changing"
                    value={newPassword}
                    onChangeText={setNewPassword}
                    onFocus={() => setNewPasswordFocused(true)}
                    onBlur={() => setNewPasswordFocused(false)}
                    secureTextEntry
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirm New Password</Text>
                <View style={[styles.inputWrapper, confirmNewPasswordFocused && styles.inputFocused]}>
                  <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={confirmNewPassword}
                    onChangeText={setConfirmNewPassword}
                    onFocus={() => setConfirmNewPasswordFocused(true)}
                    onBlur={() => setConfirmNewPasswordFocused(false)}
                    secureTextEntry
                  />
                </View>
              </View>
            </View>

            {/* Save Button */}
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleUpdateProfile}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>Save Changes</Text>
              )}
            </TouchableOpacity>

          </KeyboardAvoidingView>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F4F8", // A lighter, more modern background color
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff", // White header background
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1A202C",
  },
  content: {
    flex: 1,
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  profilePictureSection: {
    alignItems: "center",
    marginBottom: 30,
  },
  profileImage: {
    width: 120, // Slightly larger profile image
    height: 120,
    borderRadius: 60,
    backgroundColor: "#CBD5E1",
    marginBottom: 10,
    borderWidth: 3,
    borderColor: "#fff",
  },
  changePhotoText: {
    color: "#4299E1", // A vibrant blue
    fontWeight: "500",
    fontSize: 16,
  },
  formCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2D3748",
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#4A5568",
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7FAFC", // Light gray background for inputs
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 16,
    minHeight: 50,
  },
  inputFocused: {
    borderColor: "#4299E1",
    shadowColor: "#4299E1",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#2D3748",
  },
  saveButton: {
    backgroundColor: "#4299E1",
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    shadowColor: "#4299E1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  errorText: {
    color: "#F56565",
    textAlign: "center",
    marginBottom: 15,
    fontWeight: "500",
  },
  successText: {
    color: "#48BB78",
    textAlign: "center",
    marginBottom: 15,
    fontWeight: "500",
  },
})
