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
  Dimensions,
  ScrollView,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { SafeAreaProvider } from "react-native-safe-area-context"

// Step 1: Import Firebase Auth & Firestore functions and your config
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from '../config/firebaseConfig';


export default function SignUpScreen({ navigation }) {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [secureTextPassword, setSecureTextPassword] = useState(true)
  const [secureTextConfirm, setSecureTextConfirm] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [registrationSuccess, setRegistrationSuccess] = useState(false); // New state for success popup

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
  const [generalError, setGeneralError] = useState("") // For Firebase errors

  // Button animation
  const buttonScale = useRef(new Animated.Value(1)).current

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Step 2: Update the handleSignUp function
  const handleSignUp = async () => {
    // Reset errors
    setFullNameError("")
    setEmailError("")
    setPasswordError("")
    setConfirmPasswordError("")
    setTermsError("")
    setGeneralError("")


    // --- Form Validation (Keep this) ---
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

    // --- Button Animation (Keep this) ---
    Animated.sequence([
      Animated.timing(buttonScale, { toValue: 0.95, duration: 100, useNativeDriver: true }),
      Animated.timing(buttonScale, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start()

    setIsLoading(true)

    // --- Firebase Logic ---
    try {
      // 1. Create the user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. (Optional but recommended) Update the user's profile with their name
      await updateProfile(user, {
        displayName: fullName
      });

      // 3. Create a document in Firestore to store additional user info
      // We use the user's unique ID (uid) as the document ID
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        fullName: fullName,
        email: email,
        createdAt: new Date(),
      });

      console.log("User account created & data saved in Firestore!");

      // 4. On success, hide the loader, then show the registration complete pop-up
      setIsLoading(false);
      setRegistrationSuccess(true);

    } catch (error) {
      console.error("Firebase Sign Up Error:", error.code, error.message);
      // Handle specific Firebase errors
      if (error.code === 'auth/email-already-in-use') {
        setGeneralError('That email address is already in use!');
      } else if (error.code === 'auth/invalid-email') {
        setGeneralError('That email address is invalid!');
      } else if (error.code === 'auth/weak-password') {
        setGeneralError('Password should be at least 6 characters.');
      } else {
        setGeneralError("An unexpected error occurred. Please try again.");
      }
      // Ensure loading state is turned off on error
      setIsLoading(false);
    }
  }

  const handleLogin = () => {
    navigation?.navigate("Login")
  }

  const handleTermsPress = () => {
    // Implement a proper modal or screen for terms in a real app
    console.log("Terms and Conditions pressed");
  }

  // Conditional rendering based on registration success
  if (registrationSuccess) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.container}>
          <View style={styles.successContainer}>
            <Ionicons name="checkmark-circle-outline" size={100} color="#ffffff" style={styles.successIcon} />
            <Text style={styles.successTitle}>Registration Complete!</Text>
            <Text style={styles.successMessage}>
              Your account has been successfully created.
            </Text>
            <TouchableOpacity
              style={styles.goToLoginButton}
              onPress={handleLogin}
            >
              <Text style={styles.goToLoginButtonText}>Go to Login</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  // Original sign up form
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
            >
              <View style={styles.header}>
                <Text style={styles.hello}>Hello!</Text>
                <Text style={styles.welcome}>
                  Welcome to <Text style={styles.brand}>DentEase</Text>
                </Text>
              </View>

              <Text style={styles.signUpTitle}>Sign Up</Text>
              
              {/* Display general error message here */}
              {generalError ? <Text style={styles.generalErrorText}>{generalError}</Text> : null}

              {/* Full Name Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Full Name</Text>
                <View style={[styles.inputWrapper, fullNameFocused && styles.inputFocused, fullNameError && styles.inputError]}>
                  <Ionicons name="person-outline" size={20} color="#ffffff" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your full name"
                    value={fullName}
                    onChangeText={(text) => {
                      setFullName(text)
                      if (fullNameError) setFullNameError("")
                      if (generalError) setGeneralError("")
                    }}
                    onFocus={() => setFullNameFocused(true)}
                    onBlur={() => setFullNameFocused(false)}
                    autoCapitalize="words"
                    placeholderTextColor="rgba(255,255,255,0.7)"
                    returnKeyType="next"
                  />
                </View>
                {fullNameError ? <Text style={styles.errorText}>{fullNameError}</Text> : null}
              </View>

              {/* Email Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email</Text>
                <View style={[styles.inputWrapper, emailFocused && styles.inputFocused, emailError && styles.inputError]}>
                  <Ionicons name="mail-outline" size={20} color="#ffffff" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your email"
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text)
                      if (emailError) setEmailError("")
                      if (generalError) setGeneralError("")
                    }}
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholderTextColor="rgba(255,255,255,0.7)"
                    returnKeyType="next"
                  />
                </View>
                {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
              </View>

              {/* Password Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Password</Text>
                <View style={[styles.inputWrapper, passwordFocused && styles.inputFocused, passwordError && styles.inputError]}>
                  <Ionicons name="lock-closed-outline" size={20} color="#ffffff" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your password"
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text)
                      if (passwordError) setPasswordError("")
                      if (generalError) setGeneralError("")
                    }}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                    secureTextEntry={secureTextPassword}
                    placeholderTextColor="rgba(255,255,255,0.7)"
                    returnKeyType="next"
                  />
                  <TouchableOpacity onPress={() => setSecureTextPassword(!secureTextPassword)} style={styles.eyeIcon}>
                    <Ionicons name={secureTextPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#ffffff" />
                  </TouchableOpacity>
                </View>
                {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
              </View>

              {/* Confirm Password Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Confirm Password</Text>
                <View style={[styles.inputWrapper, confirmPasswordFocused && styles.inputFocused, confirmPasswordError && styles.inputError]}>
                  <Ionicons name="lock-closed-outline" size={20} color="#ffffff" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChangeText={(text) => {
                      setConfirmPassword(text)
                      if (confirmPasswordError) setConfirmPasswordError("")
                      if (generalError) setGeneralError("")
                    }}
                    onFocus={() => setConfirmPasswordFocused(true)}
                    onBlur={() => setConfirmPasswordFocused(false)}
                    secureTextEntry={secureTextConfirm}
                    placeholderTextColor="rgba(255,255,255,0.7)"
                    returnKeyType="done"
                    onSubmitEditing={handleSignUp}
                  />
                  <TouchableOpacity onPress={() => setSecureTextConfirm(!secureTextConfirm)} style={styles.eyeIcon}>
                    <Ionicons name={secureTextConfirm ? "eye-off-outline" : "eye-outline"} size={20} color="#ffffff" />
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
                {termsError ? <Text style={[styles.errorText, { marginLeft: 0 }]}>{termsError}</Text> : null}
              </View>


              <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                <TouchableOpacity
                  style={[styles.signUpButton, isLoading && styles.signUpButtonDisabled]}
                  onPress={handleSignUp}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#3F8FBA" size="small" />
                  ) : (
                    <Text style={styles.signUpButtonText}>Sign Up</Text>
                  )}
                </TouchableOpacity>
              </Animated.View>

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
  // ... (Your existing styles remain unchanged)
  container: {
    flex: 1,
    backgroundColor: "#3F8FBA",
  },
  mainContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === "ios" ? 60 : 80,
    paddingBottom: 40,
    justifyContent: 'center'
  },
  header: {
    marginBottom: 30,
    alignItems: 'center'
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
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 16,
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
  eyeIcon: {
    padding: 4,
    marginLeft: 8,
  },
  errorText: {
    color: "#FFE6E6",
    fontSize: 14,
    marginTop: 6,
    marginLeft: 4,
  },
  generalErrorText: {
    color: '#FFE6E6',
    textAlign: 'center',
    marginBottom: 16,
    fontSize: 15,
    fontWeight: '500'
  },
  termsContainer: {
    marginBottom: 24,
    marginTop: 4,
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
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  signUpButtonDisabled: {
    opacity: 0.7,
  },
  signUpButtonText: {
    color: "#3F8FBA",
    fontWeight: "600",
    fontSize: 16,
  },
  loginContainer: {
    alignItems: "center",
    marginTop: 24,
  },
  login: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
  },
  loginLink: {
    color: "#ffffff",
    fontWeight: "600",
  },
  // New styles for the success screen
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  successIcon: {
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 10,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: 30,
  },
  goToLoginButton: {
    backgroundColor: "#ffffff",
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  goToLoginButtonText: {
    color: "#3F8FBA",
    fontWeight: "600",
    fontSize: 16,
  },
})
