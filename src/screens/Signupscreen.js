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
  Image,
  Modal,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { SafeAreaProvider } from "react-native-safe-area-context"
import DateTimePicker from "@react-native-community/datetimepicker"
import { Picker } from "@react-native-picker/picker"

import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"
import { auth, db } from "../config/firebaseConfig"

export default function SignUpScreen({ navigation }) {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [birthDate, setBirthDate] = useState(new Date())
  const [gender, setGender] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [address, setAddress] = useState("")
  const [secureTextPassword, setSecureTextPassword] = useState(true)
  const [secureTextConfirm, setSecureTextConfirm] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [registrationSuccess, setRegistrationSuccess] = useState(false)
  const [showTermsModal, setShowTermsModal] = useState(false)

  // Focus states
  const [firstNameFocused, setFirstNameFocused] = useState(false)
  const [lastNameFocused, setLastNameFocused] = useState(false)
  const [emailFocused, setEmailFocused] = useState(false)
  const [passwordFocused, setPasswordFocused] = useState(false)
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false)
  const [birthDateFocused, setBirthDateFocused] = useState(false)
  const [phoneNumberFocused, setPhoneNumberFocused] = useState(false)
  const [addressFocused, setAddressFocused] = useState(false)

  // Error states
  const [firstNameError, setFirstNameError] = useState("")
  const [lastNameError, setLastNameError] = useState("")
  const [emailError, setEmailError] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [confirmPasswordError, setConfirmPasswordError] = useState("")
  const [birthDateError, setBirthDateError] = useState("")
  const [genderError, setGenderError] = useState("")
  const [phoneNumberError, setPhoneNumberError] = useState("")
  const [addressError, setAddressError] = useState("")
  const [termsError, setTermsError] = useState("")
  const [generalError, setGeneralError] = useState("")

  // Date picker state
  const [showDatePicker, setShowDatePicker] = useState(false)

  // Button animation
  const buttonScale = useRef(new Animated.Value(1)).current

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Enhanced password validation function
  const validatePassword = (password) => {
    const minLength = 12
    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumbers = /\d/.test(password)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)
    
    const requirements = {
      minLength: password.length >= minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChar
    }
    
    const isValid = Object.values(requirements).every(req => req === true)
    
    return { isValid, requirements }
  }

  // Get password requirements for display
  const getPasswordRequirements = () => {
    if (!password) return null
    
    const { requirements } = validatePassword(password)
    
    return [
      { text: "At least 12 characters", met: requirements.minLength },
      { text: "One uppercase letter (A-Z)", met: requirements.hasUpperCase },
      { text: "One lowercase letter (a-z)", met: requirements.hasLowerCase },
      { text: "One number (0-9)", met: requirements.hasNumbers },
      { text: "One special character (!@#$%^&*)", met: requirements.hasSpecialChar }
    ]
  }

  // Date picker handler
  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || birthDate
    setShowDatePicker(Platform.OS === "ios")
    setBirthDate(currentDate)
    if (birthDateError) setBirthDateError("")
  }

  const handleSignUp = async () => {
    // Reset errors
    setFirstNameError("")
    setLastNameError("")
    setEmailError("")
    setPasswordError("")
    setConfirmPasswordError("")
    setBirthDateError("")
    setGenderError("")
    setPhoneNumberError("")
    setAddressError("")
    setTermsError("")
    setGeneralError("")

    // Form Validation
    let hasError = false
    if (!firstName.trim()) {
      setFirstNameError("First name is required")
      hasError = true
    }
    if (!lastName.trim()) {
      setLastNameError("Last name is required")
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
    } else {
      const { isValid } = validatePassword(password)
      if (!isValid) {
        setPasswordError("Password does not meet all requirements")
        hasError = true
      }
    }
    if (!confirmPassword.trim()) {
      setConfirmPasswordError("Please confirm your password")
      hasError = true
    } else if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match")
      hasError = true
    }
    if (!birthDate) {
      setBirthDateError("Birth date is required")
      hasError = true
    }
    if (!gender) {
      setGenderError("Sex is required")
      hasError = true
    }
    if (!phoneNumber.trim()) {
      setPhoneNumberError("Phone number is required")
      hasError = true
    } else if (phoneNumber.length !== 10) {
      setPhoneNumberError("Phone number must be exactly 10 digits")
      hasError = true
    } else if (!phoneNumber.startsWith('9')) {
      setPhoneNumberError("Phone number must start with 9")
      hasError = true
    }
    if (!address.trim()) {
      setAddressError("Address is required")
      hasError = true
    }
    if (!acceptTerms) {
      setTermsError("Please accept the Terms and Conditions")
      hasError = true
    }
    if (hasError) return

    // Combine first and last name for display name
    const fullName = `${firstName.trim()} ${lastName.trim()}`

    // Button Animation
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

    // Firebase Logic
    try {
      // 1. Create the user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      )
      const user = userCredential.user

      // 2. Update the user's profile with their name
      await updateProfile(user, {
        displayName: fullName,
      })

      // 3. Create a document in Firestore to store additional user info
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        firstName: firstName,
        lastName: lastName,
        email: email,
        birthDate: birthDate.toISOString(),
        gender: gender,
        phoneNumber: `+63${phoneNumber}`, // Save with country code
        address: address,
        createdAt: new Date(),
      })

      console.log("User account created & data saved in Firestore!")

      // 4. On success, hide the loader, then show the registration complete pop-up
      setIsLoading(false)
      setRegistrationSuccess(true)
    } catch (error) {
      console.error("Firebase Sign Up Error:", error.code, error.message)
      if (error.code === "auth/email-already-in-use") {
        setGeneralError("That email address is already in use!")
      } else if (error.code === "auth/invalid-email") {
        setGeneralError("That email address is invalid!")
      } else if (error.code === "auth/weak-password") {
        setGeneralError("Password does not meet security requirements.")
      } else if (error.code === "auth/invalid-password") {
        setGeneralError("Password must meet all security requirements.")
      } else {
        setGeneralError("An unexpected error occurred. Please try again.")
      }
      setIsLoading(false)
    }
  }

  const handleLogin = () => {
    navigation?.navigate("Login")
  }

  const handleTermsPress = () => {
    setShowTermsModal(true)
  }

  // Terms Modal Component
  const TermsModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showTermsModal}
      onRequestClose={() => setShowTermsModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Terms and Conditions</Text>
            <TouchableOpacity
              onPress={() => setShowTermsModal(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <View style={styles.termsSection}>
              <Text style={styles.termsSectionTitle}>1. Use of Service</Text>
              <Text style={styles.termsSectionText}>
                Our system is designed to help patients book appointments and access dental records securely. By using this platform, you agree to provide accurate information and use the system responsibly.
              </Text>
            </View>

            <View style={styles.termsSection}>
              <Text style={styles.termsSectionTitle}>2. Privacy and Security</Text>
              <Text style={styles.termsSectionText}>
                All patient information is protected and handled with confidentiality. Users must keep their login credentials secure and not share them with others.
              </Text>
            </View>

            <View style={styles.termsSection}>
              <Text style={styles.termsSectionTitle}>3. Appointments</Text>
              <Text style={styles.termsSectionText}>
                Appointments booked through the system are subject to confirmation by the clinic. Patients are encouraged to arrive on time or cancel in advance if unable to attend.
              </Text>
            </View>

            <View style={styles.termsSection}>
              <Text style={styles.termsSectionTitle}>4. Prohibited Activities</Text>
              <Text style={styles.termsSectionText}>
                Users must not misuse the system, attempt to access unauthorized data, or disrupt the platform's operation.
              </Text>
            </View>

            <View style={styles.termsSection}>
              <Text style={styles.termsSectionTitle}>5. Liability</Text>
              <Text style={styles.termsSectionText}>
                The clinic and developers are not responsible for delays, errors, or issues caused by misuse of the system or technical problems beyond our control.
              </Text>
            </View>

            <View style={styles.termsSection}>
              <Text style={styles.termsSectionTitle}>6. Changes to Terms</Text>
              <Text style={styles.termsSectionText}>
                The clinic may update these terms anytime, and continued use of the system means you accept the updated terms.
              </Text>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.acceptButton}
              onPress={() => {
                setAcceptTerms(true)
                setShowTermsModal(false)
                if (termsError) setTermsError("")
              }}
            >
              <Text style={styles.acceptButtonText}>Accept Terms</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.declineButton}
              onPress={() => setShowTermsModal(false)}
            >
              <Text style={styles.declineButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )

  if (registrationSuccess) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.container}>
          <View style={styles.successContainer}>
            <Ionicons
              name="checkmark-circle-outline"
              size={100}
              color="#ffffff"
              style={styles.successIcon}
            />
            <Text style={styles.successTitle}>Registration Complete!</Text>
            <Text style={styles.successMessage}>
              Your account has been successfully created.
            </Text>
            <TouchableOpacity
              style={styles.goToLoginButton}
              onPress={() => navigation?.navigate("Profile")}
            >
              <Text style={styles.goToLoginButtonText}>Okay</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    )
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
            >
              <View style={styles.header}>
                <Text style={styles.hello}></Text>
                <Text style={styles.welcome}>
                  <Text style={styles.brand}></Text>
                </Text>
              </View>

              <Image
                source={require("../../assets/Login/t.png")}
                style={styles.signUpImage}
              />
              <Text style={styles.signUpTitle}>Sign Up</Text>

              {generalError ? (
                <Text style={styles.generalErrorText}>{generalError}</Text>
              ) : null}

              {/* FIRST NAME INPUT */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>
                  First Name<Text style={styles.required}>*</Text>
                </Text>
                <View
                  style={[
                    styles.inputWrapper,
                    firstNameFocused && styles.inputFocused,
                    firstNameError && styles.inputError,
                  ]}
                >
                  <Ionicons
                    name="person-outline"
                    size={20}
                    color="#ffffff"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your first name"
                    value={firstName}
                    onChangeText={(text) => {
                      setFirstName(text)
                      if (firstNameError) setFirstNameError("")
                      if (generalError) setGeneralError("")
                    }}
                    onFocus={() => setFirstNameFocused(true)}
                    onBlur={() => setFirstNameFocused(false)}
                    autoCapitalize="words"
                    placeholderTextColor="rgba(255,255,255,0.7)"
                    returnKeyType="next"
                  />
                </View>
                {firstNameError ? (
                  <Text style={styles.errorText}>{firstNameError}</Text>
                ) : null}
              </View>

              {/* LAST NAME INPUT */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>
                  Last Name<Text style={styles.required}>*</Text>
                </Text>
                <View
                  style={[
                    styles.inputWrapper,
                    lastNameFocused && styles.inputFocused,
                    lastNameError && styles.inputError,
                  ]}
                >
                  <Ionicons
                    name="person-outline"
                    size={20}
                    color="#ffffff"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your last name"
                    value={lastName}
                    onChangeText={(text) => {
                      setLastName(text)
                      if (lastNameError) setLastNameError("")
                      if (generalError) setGeneralError("")
                    }}
                    onFocus={() => setLastNameFocused(true)}
                    onBlur={() => setLastNameFocused(false)}
                    autoCapitalize="words"
                    placeholderTextColor="rgba(255,255,255,0.7)"
                    returnKeyType="next"
                  />
                </View>
                {lastNameError ? (
                  <Text style={styles.errorText}>{lastNameError}</Text>
                ) : null}
              </View>

              {/* EMAIL INPUT */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>
                  Email<Text style={styles.required}>*</Text>
                </Text>
                <View
                  style={[
                    styles.inputWrapper,
                    emailFocused && styles.inputFocused,
                    emailError && styles.inputError,
                  ]}
                >
                  <Ionicons
                    name="mail-outline"
                    size={20}
                    color="#ffffff"
                    style={styles.inputIcon}
                  />
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
                {emailError ? (
                  <Text style={styles.errorText}>{emailError}</Text>
                ) : null}
              </View>

              {/* PASSWORD INPUT */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>
                  Password<Text style={styles.required}>*</Text>
                </Text>
                <View
                  style={[
                    styles.inputWrapper,
                    passwordFocused && styles.inputFocused,
                    passwordError && styles.inputError,
                  ]}
                >
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color="#ffffff"
                    style={styles.inputIcon}
                  />
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
                  <TouchableOpacity
                    onPress={() => setSecureTextPassword(!secureTextPassword)}
                    style={styles.eyeIcon}
                  >
                    <Ionicons
                      name={secureTextPassword ? "eye-off-outline" : "eye-outline"}
                      size={20}
                      color="#ffffff"
                    />
                  </TouchableOpacity>
                </View>
                {passwordError ? (
                  <Text style={styles.errorText}>{passwordError}</Text>
                ) : null}
                
                {/* Password Requirements Display */}
                {password ? (
                  <View style={styles.passwordRequirements}>
                    <Text style={styles.passwordRequirementsTitle}>
                      Password Requirements:
                    </Text>
                    <View style={styles.requirementsList}>
                      {getPasswordRequirements()?.map((req, index) => (
                        <View key={index} style={styles.requirementItem}>
                          <Ionicons 
                            name={req.met ? "checkmark-circle" : "close-circle"} 
                            size={16} 
                            color={req.met ? "#4ADE80" : "#EF4444"} 
                          />
                          <Text 
                            style={[
                              styles.requirementText, 
                              { color: req.met ? "#4ADE80" : "#EF4444" }
                            ]}
                          >
                            {req.text}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                ) : null}
              </View>

              {/* CONFIRM PASSWORD INPUT */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>
                  Confirm Password<Text style={styles.required}>*</Text>
                </Text>
                <View
                  style={[
                    styles.inputWrapper,
                    confirmPasswordFocused && styles.inputFocused,
                    confirmPasswordError && styles.inputError,
                  ]}
                >
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color="#ffffff"
                    style={styles.inputIcon}
                  />
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
                  <TouchableOpacity
                    onPress={() => setSecureTextConfirm(!secureTextConfirm)}
                    style={styles.eyeIcon}
                  >
                    <Ionicons
                      name={secureTextConfirm ? "eye-off-outline" : "eye-outline"}
                      size={20}
                      color="#ffffff"
                    />
                  </TouchableOpacity>
                </View>
                {confirmPasswordError ? (
                  <Text style={styles.errorText}>{confirmPasswordError}</Text>
                ) : null}
              </View>

              {/* BIRTH DATE INPUT */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>
                  Birth Date<Text style={styles.required}>*</Text>
                </Text>
                <TouchableOpacity
                  style={[
                    styles.inputWrapper,
                    birthDateFocused && styles.inputFocused,
                    birthDateError && styles.inputError,
                  ]}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Ionicons
                    name="calendar-outline"
                    size={20}
                    color="#ffffff"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.dateInput}
                    value={birthDate ? birthDate.toLocaleDateString() : ""}
                    editable={false}
                    onFocus={() => setBirthDateFocused(true)}
                    onBlur={() => setBirthDateFocused(false)}
                    placeholder="Select your birth date"
                    placeholderTextColor="rgba(255,255,255,0.7)"
                  />
                </TouchableOpacity>
                {birthDateError ? (
                  <Text style={styles.errorText}>{birthDateError}</Text>
                ) : null}
                {showDatePicker && (
                  <DateTimePicker
                    testID="dateTimePicker"
                    value={birthDate || new Date()}
                    mode="date"
                    display="default"
                    onChange={onDateChange}
                    maximumDate={new Date()}
                  />
                )}
              </View>

              {/* GENDER PICKER */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>
                  Sex<Text style={styles.required}>*</Text>
                </Text>
                <View
                  style={[
                    styles.inputWrapper,
                    { paddingHorizontal: 0 },
                    genderError && styles.inputError,
                  ]}
                >
                  <Ionicons
                    name="transgender-outline"
                    size={20}
                    color="#ffffff"
                    style={[styles.inputIcon, { marginLeft: 16 }]}
                  />
                  <Picker
                    selectedValue={gender}
                    style={styles.picker}
                    onValueChange={(itemValue) => {
                      setGender(itemValue)
                      if (genderError) setGenderError("")
                    }}
                    dropdownIconColor="#ffffff"
                    mode="dropdown"
                  >
                    <Picker.Item
                      label="Select your gender"
                      value=""
                      style={styles.pickerPlaceholder}
                    />
                    <Picker.Item label="Male" value="Male" />
                    <Picker.Item label="Female" value="Female" />
                    <Picker.Item
                      label="Prefer Not To Say"
                      value="Prefer Not To Say"
                    />
                  </Picker>
                </View>
                {genderError ? (
                  <Text style={styles.errorText}>{genderError}</Text>
                ) : null}
              </View>

              {/* PHONE NUMBER INPUT - FIXED VERSION */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>
                  Phone Number<Text style={styles.required}>*</Text>
                </Text>
                <View
                  style={[
                    styles.inputWrapper,
                    phoneNumberFocused && styles.inputFocused,
                    phoneNumberError && styles.inputError,
                  ]}
                >
                  <Ionicons
                    name="call-outline"
                    size={20}
                    color="#ffffff"
                    style={styles.inputIcon}
                  />
                  <Text style={styles.countryCode}>+63</Text>
                  <TextInput
                    style={[styles.input, { marginLeft: 8 }]}
                    placeholder="9XX XXX XXXX"
                    placeholderTextColor="rgba(255,255,255,0.7)"
                    value={phoneNumber}
                    onChangeText={(text) => {
                      // Remove any non-numeric characters
                      const numericOnly = text.replace(/[^0-9]/g, '');
                      
                      // Limit to 10 digits
                      if (numericOnly.length <= 10) {
                        setPhoneNumber(numericOnly);
                        if (phoneNumberError) setPhoneNumberError("");
                      }
                    }}
                    onFocus={() => setPhoneNumberFocused(true)}
                    onBlur={() => setPhoneNumberFocused(false)}
                    keyboardType="numeric"
                    maxLength={10}
                    returnKeyType="done"
                  />
                </View>
                {phoneNumberError ? (
                  <Text style={styles.errorText}>{phoneNumberError}</Text>
                ) : null}
              </View>

              {/* ADDRESS INPUT */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>
                  Address<Text style={styles.required}>*</Text>
                </Text>
                <View
                  style={[
                    styles.inputWrapper,
                    addressFocused && styles.inputFocused,
                    addressError && styles.inputError,
                  ]}
                >
                  <Ionicons
                    name="location-outline"
                    size={20}
                    color="#ffffff"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your address"
                    value={address}
                    onChangeText={(text) => {
                      setAddress(text)
                      if (addressError) setAddressError("")
                    }}
                    onFocus={() => setAddressFocused(true)}
                    onBlur={() => setAddressFocused(false)}
                    autoCapitalize="words"
                    placeholderTextColor="rgba(255,255,255,0.7)"
                    returnKeyType="done"
                    onSubmitEditing={handleSignUp}
                  />
                </View>
                {addressError ? (
                  <Text style={styles.errorText}>{addressError}</Text>
                ) : null}
              </View>

              {/* TERMS AND CONDITIONS */}
              <View style={styles.termsContainer}>
                <TouchableOpacity
                  onPress={() => {
                    setAcceptTerms(!acceptTerms)
                    if (termsError) setTermsError("")
                  }}
                  style={styles.checkboxContainer}
                >
                  <View
                    style={[
                      styles.checkbox,
                      acceptTerms && styles.checkboxChecked,
                    ]}
                  >
                    {acceptTerms && (
                      <Ionicons name="checkmark" size={14} color="#3F8FBA" />
                    )}
                  </View>
                  <Text style={styles.termsText}>
                    I accept{" "}
                    <Text style={styles.termsLink} onPress={handleTermsPress}>
                      Terms and Conditions
                    </Text>
                    <Text style={styles.required}>*</Text>
                  </Text>
                </TouchableOpacity>
                {termsError ? (
                  <Text style={[styles.errorText, { marginLeft: 0 }]}>
                    {termsError}
                  </Text>
                ) : null}
              </View>

              {/* SIGN UP BUTTON */}
              <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                <TouchableOpacity
                  style={[
                    styles.signUpButton,
                    isLoading && styles.signUpButtonDisabled,
                  ]}
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

              {/* LOGIN LINK */}
              <TouchableOpacity
                onPress={handleLogin}
                style={styles.loginContainer}
              >
                <Text style={styles.login}>
                  Already have an account?{" "}
                  <Text style={styles.loginLink}>Login here</Text>
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>

        {/* TERMS MODAL */}
        <TermsModal />
      </SafeAreaView>
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
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === "ios" ? 60 : 80,
    paddingBottom: 40,
    justifyContent: "center",
  },
  header: {
    marginBottom: 30,
    alignItems: "center",
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
  signUpImage: {
    width: 140,
    height: 140,
    alignSelf: "center",
    marginBottom: -30,
    marginTop: -140,
    borderRadius: 50,
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
  required: {
    color: "#FF6B6B",
    fontSize: 16,
    fontWeight: "600",
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
  countryCode: {
    fontSize: 16,
    color: "#ffffff",
    fontWeight: "600",
    paddingRight: 4,
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
    color: "#FFE6E6",
    textAlign: "center",
    marginBottom: 16,
    fontSize: 15,
    fontWeight: "500",
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
  successContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  successIcon: {
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 10,
    textAlign: "center",
  },
  successMessage: {
    fontSize: 16,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
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
  dateInput: {
    flex: 1,
    color: "#ffffff",
    fontSize: 16,
    paddingVertical: 0,
  },
  picker: {
    flex: 1,
    color: "white",
    height: 52,
  },
  pickerPlaceholder: {
    color: "rgba(255,255,255,0.7)",
  },
  // Terms Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    width: "100%",
    maxHeight: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
  },
  closeButton: {
    padding: 5,
    borderRadius: 15,
    backgroundColor: "#F5F5F5",
  },
  modalContent: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    maxHeight: 400,
  },
  termsSection: {
    marginBottom: 20,
  },
  termsSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  termsSectionText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    textAlign: "justify",
  },
  modalFooter: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
    gap: 12,
  },
  acceptButton: {
    flex: 1,
    backgroundColor: "#3B82F6",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  acceptButtonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 16,
  },
  declineButton: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  declineButtonText: {
    color: "#666",
    fontWeight: "600",
    fontSize: 16,
  },
  // Enhanced Password Requirements Styles
  passwordRequirements: {
    marginTop: 8,
    padding: 12,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  passwordRequirementsTitle: {
    fontSize: 12,
    color: "#ffffff",
    fontWeight: "600",
    marginBottom: 6,
  },
  requirementsList: {
    gap: 4,
  },
  requirementItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  requirementText: {
    fontSize: 12,
    fontWeight: "500",
  },
})