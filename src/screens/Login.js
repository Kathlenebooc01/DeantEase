import { useState, useRef, useEffect } from "react";
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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "../config/firebaseConfig";

const { width, height } = Dimensions.get("window");

export default function LoginScreen({ navigation }) {
  // Your existing state variables...
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secureText, setSecureText] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [generalError, setGeneralError] = useState("");

  const [rememberMe, setRememberMe] = useState(false);
  const buttonScale = useRef(new Animated.Value(1)).current;

  // New useEffect to check for an existing session
  useEffect(() => {
    const loadRememberMeAndCheckAuth = async () => {
      try {
        const storedEmail = await AsyncStorage.getItem("userEmail");
        const storedRememberMe = await AsyncStorage.getItem("rememberMe");
        if (storedEmail !== null && storedRememberMe === "true") {
          setEmail(storedEmail);
          setRememberMe(true);
        }
      } catch (e) {
        console.error("Failed to load remember me preference:", e);
      }
      // Check if a user is already authenticated
      onAuthStateChanged(auth, (user) => {
        if (user) {
          console.log("User already authenticated:", user.email);
          if (navigation) {
            // If a user is found, navigate directly to the profile screen
            navigation.navigate("Profile");
          }
        }
      });
    };
    loadRememberMeAndCheckAuth();
  }, []);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async () => {
    // Reset errors
    setEmailError("");
    setPasswordError("");
    setGeneralError("");

    let hasError = false;
    if (!email.trim()) {
      setEmailError("Email is required");
      hasError = true;
    } else if (!validateEmail(email)) {
      setEmailError("Please enter a valid email");
      hasError = true;
    }

    if (!password.trim()) {
      setPasswordError("Password is required");
      hasError = true;
    } else if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      hasError = true;
    }

    if (hasError) return;

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
    ]).start();

    setIsLoading(true);

    try {
      // --- Main Logic Change Here ---
      // Use AsyncStorage to manage the "rememberMe" preference.
      if (rememberMe) {
        await AsyncStorage.setItem("rememberMe", "true");
        await AsyncStorage.setItem("userEmail", email);
      } else {
        await AsyncStorage.removeItem("rememberMe");
        await AsyncStorage.removeItem("userEmail");
      }

      // Sign in the user. Firebase handles the session persistence.
      await signInWithEmailAndPassword(auth, email, password);

      console.log("User logged in successfully!");
      if (navigation) {
        navigation.navigate("Profile");
      } else {
        console.log("Navigate to Profile screen");
      }
    } catch (error) {
      console.error("Firebase Login Error:", error.code, error.message);

      if (
        error.code === "auth/user-not-found" ||
        error.code === "auth/wrong-password" ||
        error.code === "auth/invalid-credential"
      ) {
        setGeneralError("Invalid email or password. Please try again.");
      } else {
        setGeneralError(
          "An unexpected error occurred. Please try again later."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate("ForgotPassword");
  };

  const handleSignUp = () => {
    if (navigation) {
      navigation.navigate("SignUp");
    } else {
      console.log("Navigation to SignUp screen");
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.mainContainer}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
          >
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              bounces={false}
              overScrollMode="never"
            >
              <View style={styles.headerContent}>
                <Text style={styles.hello}>Hello!</Text>
                <Text style={styles.welcome}>
                  Welcome to <Text style={styles.brand}>DentEase</Text>
                </Text>
              </View>

              <View style={styles.imageContainer}>
                <Image
                  source={require("../../assets/Login/t.png")}
                  style={styles.logoImage}
                  resizeMode="contain"
                />
              </View>

              <Text style={styles.loginTitle}>Login</Text>

              {generalError ? (
                <Text style={styles.generalErrorText}>{generalError}</Text>
              ) : null}

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
                  <Ionicons
                    name="mail-outline"
                    size={20}
                    color="#ffffffff"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your email"
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      if (emailError) setEmailError("");
                      if (generalError) setGeneralError("");
                    }}
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    underlineColorAndroid="transparent"
                    selectionColor="#ffffffff"
                    textContentType="emailAddress"
                    placeholderTextColor="#ffffff"
                    accessibilityLabel="Email input"
                    accessibilityHint="Enter your email address"
                    returnKeyType="next"
                  />
                </View>
                {emailError ? (
                  <Text style={styles.errorText}>{emailError}</Text>
                ) : null}
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
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color="#ffffffff"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your password"
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      if (passwordError) setPasswordError("");
                      if (generalError) setGeneralError("");
                    }}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                    secureTextEntry={secureText}
                    underlineColorAndroid="transparent"
                    selectionColor="#ffffffff"
                    textContentType="password"
                    placeholderTextColor="#ffffffff"
                    accessibilityLabel="Password input"
                    accessibilityHint="Enter your password"
                    returnKeyType="done"
                    onSubmitEditing={handleLogin}
                  />
                  <TouchableOpacity
                    onPress={() => setSecureText(!secureText)}
                    style={styles.eyeIcon}
                    accessibilityLabel={
                      secureText ? "Show password" : "Hide password"
                    }
                  >
                    <Ionicons
                      name={secureText ? "eye-off-outline" : "eye-outline"}
                      size={20}
                      color="#ffffffff"
                    />
                  </TouchableOpacity>
                </View>
                {passwordError ? (
                  <Text style={styles.errorText}>{passwordError}</Text>
                ) : null}
              </View>

              <View style={styles.rememberMeForgotContainer}>
                {/* Remember Me Checkbox */}
                <TouchableOpacity
                  onPress={() => setRememberMe(!rememberMe)}
                  style={styles.rememberMeContainer}
                >
                  <View
                    style={[
                      styles.checkbox,
                      rememberMe && styles.checkboxChecked,
                    ]}
                  >
                    {rememberMe && (
                      <Ionicons name="checkmark" size={16} color="#3B82F6" />
                    )}
                  </View>
                  <Text style={styles.rememberMeText}>Remember me</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleForgotPassword}
                  style={styles.forgotContainer}
                >
                  <Text style={styles.forgot}>Forgot password?</Text>
                </TouchableOpacity>
              </View>

              <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                <TouchableOpacity
                  style={[
                    styles.loginButton,
                    isLoading && styles.loginButtonDisabled,
                  ]}
                  onPress={handleLogin}
                  disabled={isLoading}
                  accessibilityLabel="Login button"
                  accessibilityHint="Tap to login with your credentials"
                >
                  {isLoading ? (
                    <ActivityIndicator color="#3B82F6" size="small" />
                  ) : (
                    <Text style={styles.loginButtonText}>Login</Text>
                  )}
                </TouchableOpacity>
              </Animated.View>

              <TouchableOpacity
                onPress={handleSignUp}
                style={styles.signupContainer}
                activeOpacity={0.7}
              >
                <Text style={styles.signup}>
                  Don't have an account?{" "}
                  <Text style={styles.signupLink}>Sign up here</Text>
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  // Your existing styles
  container: {
    flex: 1,
    backgroundColor: "#3B82F6",
  },
  mainContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: Platform.OS === "ios" ? 60 : 80,
    paddingBottom: 24,
    flexGrow: 1,
    justifyContent: "center",
  },
  headerContent: {
    marginBottom: 40,
    alignItems: "center",
  },
  hello: {
    fontSize: 32,
    color: "#fff",
    fontWeight: "700",
    marginBottom: 8,
    fontFamily: "System",
  },
  welcome: {
    fontSize: 18,
    color: "#fff",
    opacity: 0.9,
    textAlign: "center",
  },
  brand: {
    fontWeight: "700",
  },
  imageContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  logoImage: {
    marginBottom: -40,
    marginTop: -50,
    width: 150,
    height: 150,
    tintColor: "#ffffff",
  },
  loginTitle: {
    textAlign: "center",
    fontWeight: "600",
    fontSize: 24,
    color: "#ffffff",
    marginBottom: 24,
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
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 16,
    minHeight: 52,
  },
  inputFocused: {
    borderColor: "#ffffff",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  inputError: {
    borderColor: "#FF6B6B",
    backgroundColor: "rgba(255, 107, 107, 0.1)",
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
    color: "#FFD6D6",
    fontSize: 14,
    marginTop: 4,
    marginLeft: 4,
  },
  generalErrorText: {
    color: "#FFD6D6",
    textAlign: "center",
    marginBottom: 16,
    fontSize: 15,
    fontWeight: "500",
  },
  rememberMeForgotContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  rememberMeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    backgroundColor: "transparent",
  },
  checkboxChecked: {
    backgroundColor: "#ffffff",
    borderColor: "#ffffff",
  },
  rememberMeText: {
    color: "#ffffff",
    fontSize: 14,
  },
  forgotContainer: {
    alignSelf: "flex-end",
  },
  forgot: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "500",
  },
  loginButton: {
    backgroundColor: "#ffffffff",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 52,
    shadowColor: "#000",
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
    color: "#3F8FBA",
    fontWeight: "600",
    fontSize: 16,
  },
  signupContainer: {
    alignItems: "center",
    marginTop: 24,
  },
  signup: {
    fontSize: 14,
    color: "#ffffff",
  },
  signupLink: {
    color: "#ffffff",
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});