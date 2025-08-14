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
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { SafeAreaProvider } from "react-native-safe-area-context"

export default function ForgotScreen({ navigation }) {
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

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      setIsSuccess(true)
      Alert.alert(
        "Reset Link Sent!", 
        "We've sent a password reset link to your email address. Please check your inbox and follow the instructions.",
        [
          {
            text: "OK",
            onPress: () => {
              if (navigation) {
                navigation.goBack()
              }
            }
          }
        ]
      )
    }, 2000)
  }

  const handleBackToLogin = () => {
    if (navigation) {
      navigation.goBack()
    } else {
      console.log("Navigation back to Login screen")
      Alert.alert("Navigation", "Would navigate back to Login screen")
    }
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.mainContainer}>
            {/* Header Section */}
            <View style={styles.header}>
              <TouchableOpacity 
                onPress={handleBackToLogin}
                style={styles.backButton}
                accessibilityLabel="Go back to login"
              >
                <Ionicons name="arrow-back" size={24} color="#fff" />
              </TouchableOpacity>
              <View style={styles.headerContent}>
                <Text style={styles.headerTitle}>Forgot Password</Text>
                <Text style={styles.headerSubtitle}>
                  Enter your email to reset your password
                </Text>
              </View>
            </View>

            {/* Full Screen White Card */}
            <View style={styles.card}>
              <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
              >
                <ScrollView
                  style={{ flex: 1 }}
                  contentContainerStyle={styles.scrollContent}
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}
                  bounces={false}
                  overScrollMode="never"
                >
                  {/* Icon */}
                  <View style={styles.iconContainer}>
                    <View style={styles.iconWrapper}>
                      <Ionicons name="mail-outline" size={48} color="#4A90E2" />
                    </View>
                  </View>

                  {/* Title and Description */}
                  <Text style={styles.title}>Reset Password</Text>
                  <Text style={styles.description}>
                    Don't worry! Enter your email address below and we'll send you a link to reset your password.
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
                      <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
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
                        selectionColor="#4A90E2"
                        textContentType="emailAddress"
                        placeholderTextColor="#999"
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
                      accessibilityLabel="Send reset link button"
                      accessibilityHint="Tap to send password reset link to your email"
                    >
                      {isLoading ? (
                        <ActivityIndicator color="#fff" size="small" />
                      ) : (
                        <Text style={styles.resetButtonText}>Send Reset Link</Text>
                      )}
                    </TouchableOpacity>
                  </Animated.View>

                  {/* Success Message */}
                  {isSuccess && (
                    <View style={styles.successContainer}>
                      <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                      <Text style={styles.successText}>
                        Reset link sent successfully! Check your email.
                      </Text>
                    </View>
                  )}

                  {/* Back to Login */}
                  <TouchableOpacity 
                    onPress={handleBackToLogin} 
                    style={styles.backToLoginContainer}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.backToLogin}>
                      Remember your password? <Text style={styles.backToLoginLink}>Back to Login</Text>
                    </Text>
                  </TouchableOpacity>

                  {/* Help Text */}
                  <View style={styles.helpContainer}>
                    <Text style={styles.helpText}>
                      If you don't receive an email within a few minutes, please check your spam folder or contact support.
                    </Text>
                  </View>
                </ScrollView>
              </KeyboardAvoidingView>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </SafeAreaView>
    </SafeAreaProvider>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#4A90E2",
  },
  mainContainer: {
    flex: 1,
  },
  header: {
    backgroundColor: "#4A90E2",
    paddingTop: Platform.OS === "ios" ? 20 : 40,
    paddingBottom: 40,
    paddingHorizontal: 24,
    position: "relative",
  },
  backButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 60 : 80,
    left: 24,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  headerContent: {
    marginTop: 60,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 28,
    color: "#fff",
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#fff",
    opacity: 0.9,
    textAlign: "center",
  },
  card: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 24,
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  iconWrapper: {
    width: 100,
    height: 100,
    backgroundColor: "#F0F7FF",
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#E3F2FD",
  },
  title: {
    textAlign: "center",
    fontWeight: "600",
    fontSize: 24,
    color: "#4A90E2",
    marginBottom: 12,
  },
  description: {
    textAlign: "center",
    fontSize: 16,
    color: "#666",
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
    color: "#333",
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E9ECEF",
    paddingHorizontal: 16,
    minHeight: 52,
  },
  inputFocused: {
    borderColor: "#4A90E2",
    backgroundColor: "#F0F7FF",
  },
  inputError: {
    borderColor: "#FF6B6B",
    backgroundColor: "#FFF5F5",
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    paddingVertical: 0,
  },
  errorText: {
    color: "#FF6B6B",
    fontSize: 14,
    marginTop: 4,
    marginLeft: 4,
  },
  resetButton: {
    backgroundColor: "#4A90E2",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 52,
    shadowColor: "#4A90E2",
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
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  successContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F8E9",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#4CAF50",
  },
  successText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: "#2E7D32",
    fontWeight: "500",
  },
  backToLoginContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  backToLogin: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  backToLoginLink: {
    color: "#4A90E2",
    fontWeight: "600",
  },
  helpContainer: {
    backgroundColor: "#F8F9FA",
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#4A90E2",
  },
  helpText: {
    fontSize: 13,
    color: "#666",
    lineHeight: 20,
    textAlign: "center",
  },
})