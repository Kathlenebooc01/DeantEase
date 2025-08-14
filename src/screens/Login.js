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

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [secureText, setSecureText] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [emailFocused, setEmailFocused] = useState(false)
  const [passwordFocused, setPasswordFocused] = useState(false)
  const [emailError, setEmailError] = useState("")
  const [passwordError, setPasswordError] = useState("")

  // Button animation only
  const buttonScale = useRef(new Animated.Value(1)).current

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleLogin = async () => {
    // Reset errors
    setEmailError("")
    setPasswordError("")

    // Validation
    let hasError = false
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
      
      // Navigate to Profile screen after successful login
      if (navigation) {
        navigation.navigate("Profile")
      } else {
        console.log("Navigate to Profile screen")
        Alert.alert("Success", "Login successful! Navigating to Profile...")
      }
    }, 2000)
  }

  const handleForgotPassword = () => {
    navigation.navigate("ForgotPassword")
  }

  const handleSignUp = () => {
    // Navigate to SignUp screen
    if (navigation) {
      navigation.navigate("SignUp")
    } else {
      console.log("Navigation to SignUp screen")
      // For testing purposes, you can add:
      Alert.alert("Navigation", "Would navigate to Sign Up screen")
    }
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.mainContainer}>
            {/* Header Section */}
            <View style={styles.header}>
              <View style={styles.headerContent}>
                <Text style={styles.hello}>Hello!</Text>
                <Text style={styles.welcome}>
                  Welcome to <Text style={styles.brand}>DentEase</Text>
                </Text>
              </View>
            </View>

            {/* Full Screen White Card */}
            <View style={styles.card}>
              <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
              >
                <ScrollView
                  style={{ flex: 1 }}
                  contentContainerStyle={styles.scrollContent}
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}
                  bounces={false}
                  overScrollMode="never"
                >
                  {/* Logo/Picture */}
                  <View style={styles.logoContainer}>
                    <View style={styles.logoImageContainer}>
                      {/* Replace with your image */}
                      <Image 
                        source={require('../../assets/Login/illustration.png')} // Local image
                        // OR
                        // source={{ uri: 'https://your-image-url.com/image.png' }} // Remote image
                        style={styles.logoImage}
                        resizeMode="contain"
                      />
                    </View>
                  </View>

                  {/* Login title */}
                  <Text style={styles.loginTitle}>Login</Text>

                  {/* Email Input */}
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Email</Text>
                    <View
                      style={[styles.inputWrapper, emailFocused && styles.inputFocused, emailError && styles.inputError]}
                    >
                      <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="Enter your email"
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
                        selectionColor="#4A90E2"
                        textContentType="emailAddress"
                        placeholderTextColor="#999"
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
                      <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="Enter your password"
                        value={password}
                        onChangeText={(text) => {
                          setPassword(text)
                          if (passwordError) setPasswordError("")
                        }}
                        onFocus={() => setPasswordFocused(true)}
                        onBlur={() => setPasswordFocused(false)}
                        secureTextEntry={secureText}
                        underlineColorAndroid="transparent"
                        selectionColor="#4A90E2"
                        textContentType="password"
                        placeholderTextColor="#999"
                        accessibilityLabel="Password input"
                        accessibilityHint="Enter your password"
                        returnKeyType="done"
                        onSubmitEditing={handleLogin}
                      />
                      <TouchableOpacity
                        onPress={() => setSecureText(!secureText)}
                        style={styles.eyeIcon}
                        accessibilityLabel={secureText ? "Show password" : "Hide password"}
                      >
                        <Ionicons name={secureText ? "eye-off-outline" : "eye-outline"} size={20} color="#666" />
                      </TouchableOpacity>
                    </View>
                    {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
                  </View>

                  {/* Forgot Password */}
                  <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotContainer}>
                    <Text style={styles.forgot}>Forgot password?</Text>
                  </TouchableOpacity>

                  {/* Login Button */}
                  <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                    <TouchableOpacity
                      style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
                      onPress={handleLogin}
                      disabled={isLoading}
                      accessibilityLabel="Login button"
                      accessibilityHint="Tap to login with your credentials"
                    >
                      {isLoading ? (
                        <ActivityIndicator color="#fff" size="small" />
                      ) : (
                        <Text style={styles.loginButtonText}>Login</Text>
                      )}
                    </TouchableOpacity>
                  </Animated.View>

                  {/* Sign up link */}
                  <TouchableOpacity 
                    onPress={handleSignUp} 
                    style={styles.signupContainer}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.signup}>
                      Don't have an account? <Text style={styles.signupLink}>Sign up here</Text>
                    </Text>
                  </TouchableOpacity>
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
  },
  headerContent: {
    marginTop: 20,
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
    paddingTop: 32,
    paddingBottom: 24,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 8, // Reduced from 16 to compensate for larger logo
  },
  logoImageContainer: {
    width: 140, // Increased from 120
    height: 140, // Increased from 120
    backgroundColor: "#ffffff",
    borderRadius: 70, // Half of width/height
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#ffffff",
    shadowColor: "#ffffff",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  logoImage: {
    width: 100, // Increased from 80
    height: 100, // Increased from 80
    borderRadius: 50, // Half of width/height
  },
  loginTitle: {
    textAlign: "center",
    fontWeight: "600",
    fontSize: 24,
    color: "#4A90E2",
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 20,
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
    color: "#FF6B6B",
    fontSize: 14,
    marginTop: 4,
    marginLeft: 4,
  },
  forgotContainer: {
    alignSelf: "flex-end",
    marginBottom: 24,
  },
  forgot: {
    color: "#4A90E2",
    fontSize: 14,
    fontWeight: "500",
  },
  loginButton: {
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
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  signupContainer: {
    alignItems: "center",
    marginVertical: 24,
  },
  signup: {
    fontSize: 14,
    color: "#666",
  },
  signupLink: {
    color: "#4A90E2",
    fontWeight: "600",
  },
})