"use client"

import { useState, useRef } from "react"
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Animated,
  ActivityIndicator,
  ScrollView,
  Modal,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { sendPasswordResetEmail } from "firebase/auth"
import { auth } from '../config/firebaseConfig';

// Custom Success Modal Component
const SuccessModal = ({ isVisible, onClose, email }) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={modalStyles.centeredView}>
        <View style={modalStyles.modalView}>
          <View style={modalStyles.iconContainer}>
            <Ionicons name="checkmark-done-circle-outline" size={60} color="#3F8FBA" />
          </View>
          <Text style={modalStyles.modalTitle}>Password Reset Link Sent!</Text>
          <Text style={modalStyles.modalText}>
            A secure link to change your password has been sent to <Text style={modalStyles.emailText}>{email}</Text>. Please check your inbox and follow the instructions.
          </Text>
          <TouchableOpacity
            style={modalStyles.button}
            onPress={onClose}
          >
            <Text style={modalStyles.buttonText}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}

export default function ChangePasswordScreen({ navigation }) {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [emailFocused, setEmailFocused] = useState(false)
  const [emailError, setEmailError] = useState("")
  const [isSuccess, setIsSuccess] = useState(false)

  // Button animation
  const buttonScale = useRef(new Animated.Value(1)).current

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleResetPassword = async () => {
    // Reset errors
    setEmailError("")
    setIsSuccess(false)

    // Validation
    if (!email.trim()) {
      setEmailError("Email is required")
      return
    }
    
    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email")
      return
    }

    // Button press animation
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start()

    setIsLoading(true)

    try {
      await sendPasswordResetEmail(auth, email);
      
      console.log("Password reset email sent successfully!");
      setIsSuccess(true)
      
    } catch (error) {
      console.error("Firebase Password Reset Error:", error.code, error.message);
      setIsSuccess(false);

      // We show a generic success message for security reasons, even on errors like user-not-found
      setIsSuccess(true);
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoBack = () => {
    setIsSuccess(false);
    if (navigation) {
      navigation.goBack()
    } else {
      console.log("Navigation back to previous screen")
    }
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : -100}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ScrollView
              style={styles.mainContainer}
              contentContainerStyle={styles.scrollContainer}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              bounces={true}
            >
              {/* Header Section with Back Button */}
              <View style={styles.header}>
                <TouchableOpacity 
                  onPress={handleGoBack}
                  style={styles.backButton}
                  accessibilityLabel="Go back"
                >
                  <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Change Password</Text>
                <Text style={styles.headerSubtitle}>
                  Enter your email to receive a password change link.
                </Text>
              </View>

              {/* Icon */}
              <View style={styles.iconContainer}>
                <View style={styles.iconWrapper}>
                  <Ionicons name="lock-closed-outline" size={48} color="#ffffff" />
                </View>
              </View>

              {/* Title and Description */}
              <Text style={styles.title}>Change Your Password</Text>
              <Text style={styles.description}>
                To change your password, please enter the email address associated with your account below.
              </Text>

              {/* Email Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email Address</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    emailFocused && styles.inputFocused,
                    emailError && styles.inputError
                  ]}
                >
                  <Ionicons name="mail-outline" size={20} color="#ffffff" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your email"
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text)
                      if (emailError) setEmailError("")
                      if (isSuccess) setIsSuccess(false)
                    }}
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    underlineColorAndroid="transparent"
                    selectionColor="#ffffff"
                    textContentType="emailAddress"
                    placeholderTextColor="rgba(255,255,255,0.7)"
                    accessibilityLabel="Email input"
                    accessibilityHint="Enter your email address to reset password"
                    returnKeyType="done"
                    onSubmitEditing={handleResetPassword}
                  />
                </View>
                {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
              </View>

              {/* Reset Button */}
              <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                <TouchableOpacity
                  style={[styles.resetButton, isLoading && styles.resetButtonDisabled]}
                  onPress={handleResetPassword}
                  disabled={isLoading}
                  accessibilityLabel="Send change password link button"
                  accessibilityHint="Tap to send password change link to your email"
                >
                  {isLoading ? (
                    <ActivityIndicator color="#4A90E2" size="small" />
                  ) : (
                    <Text style={styles.resetButtonText}>Send Change Link</Text>
                  )}
                </TouchableOpacity>
              </Animated.View>

              {/* Help Text */}
              <View style={styles.helpContainer}>
                <Text style={styles.helpText}>
                  For security, the change password link will be valid for a limited time.
                </Text>
              </View>
            </ScrollView>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </SafeAreaView>
      
      {/* Custom Modal is rendered here */}
      <SuccessModal isVisible={isSuccess} onClose={handleGoBack} email={email} />
    </SafeAreaProvider>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#3B82F6",
  },
  mainContainer: {
    flex: 1,
    backgroundColor: "#3B82F6",
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === "ios" ? 60 : 80,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 40,
    position: "relative",
  },
  backButton: {
    position: "absolute",
    top: -10,
    left: -4,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  headerTitle: {
    fontSize: 28,
    color: "#fff",
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
    marginTop: 20,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#fff",
    opacity: 0.9,
    textAlign: "center",
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  iconWrapper: {
    width: 100,
    height: 100,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.3)",
  },
  title: {
    textAlign: "center",
    fontWeight: "600",
    fontSize: 24,
    color: "#ffffff",
    marginBottom: 12,
  },
  description: {
    textAlign: "center",
    fontSize: 16,
    color: "rgba(255,255,255,0.9)",
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 8,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontWeight: "600",
    fontSize: 16,
    color: "#ffffff",
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    paddingHorizontal: 16,
    minHeight: 52,
  },
  inputFocused: {
    borderColor: "#ffffff",
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  inputError: {
    borderColor: "#FF6B6B",
    backgroundColor: "rgba(255,107,107,0.1)",
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#ffffff",
    paddingVertical: 0,
  },
  errorText: {
    color: "#FFE6E6",
    fontSize: 14,
    marginTop: 4,
    marginLeft: 4,
  },
  resetButton: {
    backgroundColor: "#ffffff",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 52,
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 20,
  },
  resetButtonDisabled: {
    opacity: 0.7,
  },
  resetButtonText: {
    color: "#4A90E2",
    fontWeight: "600",
    fontSize: 16,
  },
  backToLoginContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  backToLogin: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
  },
  backToLoginLink: {
    color: "#ffffff",
    fontWeight: "600",
  },
  helpContainer: {
    backgroundColor: "rgba(255,255,255,0.1)",
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#ffffff",
  },
  helpText: {
    fontSize: 13,
    color: "rgba(255,255,255,0.9)",
    lineHeight: 20,
    textAlign: "center",
  },
})

// Styles for the new Modal
const modalStyles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalView: {
    width: "85%",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  iconContainer: {
    backgroundColor: "#E3F2FD",
    borderRadius: 50,
    padding: 15,
    marginBottom: 20,
  },
  modalTitle: {
    marginBottom: 15,
    textAlign: "center",
    fontWeight: "700",
    fontSize: 24,
    color: "#333",
  },
  modalText: {
    marginBottom: 20,
    textAlign: "center",
    fontSize: 16,
    color: "#666",
    lineHeight: 22,
  },
  emailText: {
    fontWeight: "bold",
    color: "#3F8FBA",
  },
  button: {
    width: "100%",
    backgroundColor: "#3F8FBA",
    borderRadius: 12,
    padding: 15,
    elevation: 2,
    marginTop: 10,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 16,
  },
})
