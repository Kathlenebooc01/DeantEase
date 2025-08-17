"use client"

import { useState, useRef, useEffect } from "react"
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
  Dimensions,
  ScrollView,
  Image,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { SafeAreaProvider } from "react-native-safe-area-context"

const { width, height } = Dimensions.get("window")

export default function SignUpScreen({ navigation }) {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [secureTextPassword, setSecureTextPassword] = useState(true)
  const [secureTextConfirm, setSecureTextConfirm] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  
  // Focus states
  const [fullNameFocused, setFullNameFocused] = useState(false)
  const [emailFocused, setEmailFocused] = useState(false)
  const [passwordFocused, setPasswordFocused] = useState(false)
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false)
  
  // Error states
  const [fullNameError, setFullNameError] = useState("")
  const [emailError, setEmailError] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [confirmPasswordError, setConfirmPasswordError] = useState("")
  const [termsError, setTermsError] = useState("")

  // Button animation
  const buttonScale = useRef(new Animated.Value(1)).current

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSignUp = async () => {
    // Reset errors
    setFullNameError("")
    setEmailError("")
    setPasswordError("")
    setConfirmPasswordError("")
    setTermsError("")

    // Validation
    let hasError = false
    
    if (!fullName.trim()) {
      setFullNameError("Full name is required")
      hasError = true
    }

    if (!email.trim()) {
      setEmailError("Email is required")
      hasError = true
    } else if (!validateEmail(email)) {
      setEmailError("Please enter a valid email")
      hasError = true
    }

    if (!password.trim()) {
      setPasswordError("Password is required")
      hasError = true
    } else if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters")
      hasError = true
    }

    if (!confirmPassword.trim()) {
      setConfirmPasswordError("Please confirm your password")
      hasError = true
    } else if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match")
      hasError = true
    }

    if (!acceptTerms) {
      setTermsError("Please accept the Terms and Conditions")
      hasError = true
    }

    if (hasError) return

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
      Alert.alert("Success", "Account created successfully!")
    }, 2000)
  }

  const handleLogin = () => {
    navigation?.navigate("Login")
  }

  const handleTermsPress = () => {
    Alert.alert("Terms and Conditions", "Terms and Conditions would be displayed here")
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
              {/* Header Section */}
              <View style={styles.header}>
                <Text style={styles.hello}>Hello!</Text>
                <Text style={styles.welcome}>
                  Welcome to <Text style={styles.brand}>DentEase</Text>
                </Text>
              </View>

              {/* Sign Up title */}
              <Text style={styles.signUpTitle}>Sign Up</Text>

              {/* Full Name Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Full Name</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    fullNameFocused && styles.inputFocused,
                    fullNameError && styles.inputError,
                  ]}
                >
                  <Ionicons name="person-outline" size={20} color="#ffffff" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Clara Lauren"
                    value={fullName}
                    onChangeText={(text) => {
                      setFullName(text)
                      if (fullNameError) setFullNameError("")
                    }}
                    onFocus={() => setFullNameFocused(true)}
                    onBlur={() => setFullNameFocused(false)}
                    autoCapitalize="words"
                    autoCorrect={false}
                    underlineColorAndroid="transparent"
                    selectionColor="#ffffff"
                    textContentType="name"
                    placeholderTextColor="rgba(255,255,255,0.7)"
                    accessibilityLabel="Full name input"
                    accessibilityHint="Enter your full name"
                    returnKeyType="next"
                  />
                </View>
                {fullNameError ? <Text style={styles.errorText}>{fullNameError}</Text> : null}
              </View>

              {/* Email Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    emailFocused && styles.inputFocused,
                    emailError && styles.inputError,
                  ]}
                >
                  <Ionicons name="mail-outline" size={20} color="#ffffff" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="lauraclara124@gmail.com"
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text)
                      if (emailError) setEmailError("")
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
                    accessibilityHint="Enter your email address"
                    returnKeyType="next"
                  />
                </View>
                {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
              </View>

              {/* Password Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Password</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    passwordFocused && styles.inputFocused,
                    passwordError && styles.inputError,
                  ]}
                >
                  <Ionicons name="lock-closed-outline" size={20} color="#ffffff" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="••••••••••"
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text)
                      if (passwordError) setPasswordError("")
                      if (confirmPassword && confirmPasswordError && text === confirmPassword) {
                        setConfirmPasswordError("")
                      }
                    }}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                    secureTextEntry={secureTextPassword}
                    underlineColorAndroid="transparent"
                    selectionColor="#ffffff"
                    textContentType="newPassword"
                    placeholderTextColor="rgba(255,255,255,0.7)"
                    accessibilityLabel="Password input"
                    accessibilityHint="Enter your password"
                    returnKeyType="next"
                  />
                  <TouchableOpacity
                    onPress={() => setSecureTextPassword(!secureTextPassword)}
                    style={styles.eyeIcon}
                    accessibilityLabel={secureTextPassword ? "Show password" : "Hide password"}
                  >
                    <Ionicons
                      name={secureTextPassword ? "eye-off-outline" : "eye-outline"}
                      size={20}
                      color="#ffffff"
                    />
                  </TouchableOpacity>
                </View>
                {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
              </View>

              {/* Confirm Password Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Confirm Password</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    confirmPasswordFocused && styles.inputFocused,
                    confirmPasswordError && styles.inputError,
                  ]}
                >
                  <Ionicons name="lock-closed-outline" size={20} color="#ffffff" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="123456789a"
                    value={confirmPassword}
                    onChangeText={(text) => {
                      setConfirmPassword(text)
                      if (confirmPasswordError) setConfirmPasswordError("")
                    }}
                    onFocus={() => setConfirmPasswordFocused(true)}
                    onBlur={() => setConfirmPasswordFocused(false)}
                    secureTextEntry={secureTextConfirm}
                    underlineColorAndroid="transparent"
                    selectionColor="#ffffff"
                    textContentType="newPassword"
                    placeholderTextColor="rgba(255,255,255,0.7)"
                    accessibilityLabel="Confirm password input"
                    accessibilityHint="Confirm your password"
                    returnKeyType="done"
                    onSubmitEditing={handleSignUp}
                  />
                  <TouchableOpacity
                    onPress={() => setSecureTextConfirm(!secureTextConfirm)}
                    style={styles.eyeIcon}
                    accessibilityLabel={secureTextConfirm ? "Show password" : "Hide password"}
                  >
                    <Ionicons
                      name={secureTextConfirm ? "eye-off-outline" : "eye-outline"}
                      size={20}
                      color="#ffffff"
                    />
                  </TouchableOpacity>
                </View>
                {confirmPasswordError ? <Text style={styles.errorText}>{confirmPasswordError}</Text> : null}
              </View>

              {/* Terms and Conditions */}
              <View style={styles.termsContainer}>
                <TouchableOpacity
                  onPress={() => {
                    setAcceptTerms(!acceptTerms)
                    if (termsError) setTermsError("")
                  }}
                  style={styles.checkboxContainer}
                >
                  <View style={[styles.checkbox, acceptTerms && styles.checkboxChecked]}>
                    {acceptTerms && <Ionicons name="checkmark" size={14} color="#3F8FBA" />}
                  </View>
                  <Text style={styles.termsText}>
                    I accept{" "}
                    <Text style={styles.termsLink} onPress={handleTermsPress}>
                      Terms and Conditions
                    </Text>
                  </Text>
                </TouchableOpacity>
                {termsError ? <Text style={styles.errorText}>{termsError}</Text> : null}
              </View>

              {/* Sign Up Button */}
              <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                <TouchableOpacity
                  style={[styles.signUpButton, isLoading && styles.signUpButtonDisabled]}
                  onPress={handleSignUp}
                  disabled={isLoading}
                  accessibilityLabel="Sign up button"
                  accessibilityHint="Tap to create your account"
                >
                  {isLoading ? (
                    <ActivityIndicator color="#3F8FBA" size="small" />
                  ) : (
                    <Text style={styles.signUpButtonText}>Sign Up</Text>
                  )}
                </TouchableOpacity>
              </Animated.View>

              {/* Login link */}
              <TouchableOpacity onPress={handleLogin} style={styles.loginContainer}>
                <Text style={styles.login}>
                  Already have an account? <Text style={styles.loginLink}>Login here</Text>
                </Text>
              </TouchableOpacity>
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
  },
  hello: {
    fontSize: 32,
    color: "#fff",
    fontWeight: "700",
    marginBottom: 4,
  },
  welcome: {
    fontSize: 18,
    color: "#fff",
    opacity: 0.9,
  },
  brand: {
    fontWeight: "700",
  },
  signUpTitle: {
    textAlign: "center",
    fontWeight: "600",
    fontSize: 24,
    color: "#ffffff",
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 20,
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
    borderWidth: 0,
    borderBottomWidth: 0,
    borderBottomColor: "transparent",
    textDecorationLine: "none",
    backgroundColor: "transparent",
  },
  eyeIcon: {
    padding: 4,
    marginLeft: 8,
  },
  errorText: {
    color: "#FFE6E6",
    fontSize: 14,
    marginTop: 4,
    marginLeft: 4,
  },
  termsContainer: {
    marginBottom: 24,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.5)",
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: "#ffffff",
    borderColor: "#ffffff",
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
  },
  termsLink: {
    color: "#ffffff",
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  signUpButton: {
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
  },
  signUpButtonDisabled: {
    opacity: 0.7,
  },
  signUpButtonText: {
    color: "#4A90E2",
    fontWeight: "600",
    fontSize: 16,
  },
  loginContainer: {
    alignItems: "center",
    marginVertical: 24,
  },
  login: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
  },
  loginLink: {
    color: "#ffffff",
    fontWeight: "600",
  },
})