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
                  onPress={handleBackToLogin}
                  style={styles.backButton}
                  accessibilityLabel="Go back to login"
                >
                  <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Forgot Password</Text>
                <Text style={styles.headerSubtitle}>
                  Enter your email to reset your password
                </Text>
              </View>

              {/* Icon */}
              <View style={styles.iconContainer}>
                <View style={styles.iconWrapper}>
                  <Ionicons name="mail-outline" size={48} color="#ffffff" />
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
                  accessibilityLabel="Send reset link button"
                  accessibilityHint="Tap to send password reset link to your email"
                >
                  {isLoading ? (
                    <ActivityIndicator color="#4A90E2" size="small" />
                  ) : (
                    <Text style={styles.resetButtonText}>Send Reset Link</Text>
                  )}
                </TouchableOpacity>
              </Animated.View>

              {/* Success Message */}
              {isSuccess && (
                <View style={styles.successContainer}>
                  <Ionicons name="checkmark-circle" size={24} color="#ffffff" />
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
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </SafeAreaProvider>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#3F8FBA",
  },
  mainContainer: {
    flex: 1,
    backgroundColor: "#3F8FBA",
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
  successContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#ffffff",
  },
  successText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: "#ffffff",
    fontWeight: "500",
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