"use client"

import React, { useState, useContext, useEffect } from "react"
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
  Modal,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { SafeAreaProvider } from "react-native-safe-area-context"
import * as ImagePicker from "expo-image-picker"
import { uploadToCloudinaryRN } from '../config/cloudinaryConfig';

// Firebase imports
import { db, auth } from '../config/firebaseConfig'
import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore'
import { updateProfile } from 'firebase/auth'

// Make sure the path to your UserContext.js file is correct
import { UserContext } from '../context/UserContext'

// Custom Success Modal Component
const SuccessModal = ({ isVisible, onClose }) => {
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
            <Ionicons name="checkmark-circle-outline" size={60} color="#3F8FBA" />
          </View>
          <Text style={modalStyles.modalTitle}>Profile Updated!</Text>
          <Text style={modalStyles.modalText}>
            Your account details have been successfully saved.
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

// Image Picker Options Modal
const ImagePickerModal = ({ isVisible, onClose, onCamera, onGallery }) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={imagePickerModalStyles.overlay}>
        <View style={imagePickerModalStyles.container}>
          <View style={imagePickerModalStyles.header}>
            <Text style={imagePickerModalStyles.title}>Select Profile Picture</Text>
            <TouchableOpacity onPress={onClose} style={imagePickerModalStyles.closeButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          <View style={imagePickerModalStyles.optionsContainer}>
            <TouchableOpacity style={imagePickerModalStyles.option} onPress={onCamera}>
              <View style={imagePickerModalStyles.optionIconContainer}>
                <Ionicons name="camera" size={32} color="#007AFF" />
              </View>
              <Text style={imagePickerModalStyles.optionTitle}>Take Photo</Text>
              <Text style={imagePickerModalStyles.optionSubtitle}>Use camera to capture a new photo</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={imagePickerModalStyles.option} onPress={onGallery}>
              <View style={imagePickerModalStyles.optionIconContainer}>
                <Ionicons name="images" size={32} color="#007AFF" />
              </View>
              <Text style={imagePickerModalStyles.optionTitle}>Choose from Gallery</Text>
              <Text style={imagePickerModalStyles.optionSubtitle}>Select an existing photo from your device</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

export default function AccountSettings({ navigation }) {
  const { userProfile, setUserProfile } = useContext(UserContext)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [profileImageUri, setProfileImageUri] = useState(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [showImagePicker, setShowImagePicker] = useState(false)

  const currentUser = auth.currentUser

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    if (!currentUser) {
      setIsLoading(false)
      return
    }

    try {
      const userDocRef = doc(db, 'users', currentUser.uid)
      const userDoc = await getDoc(userDocRef)
      
      if (userDoc.exists()) {
        const userData = userDoc.data()
        setName(userData.displayName || userData.name || currentUser.displayName || '')
        setEmail(userData.email || currentUser.email || '')
        setPhoneNumber(userData.phoneNumber || userData.phone || '')
        setProfileImageUri(userData.photoURL || userData.profilePicture || currentUser.photoURL)
      } else {
        setName(currentUser.displayName || '')
        setEmail(currentUser.email || '')
        setPhoneNumber('')
        setProfileImageUri(currentUser.photoURL)
      }
    } catch (error) {
      console.error("Error loading user data:", error)
      Alert.alert("Error", "Failed to load user data")
    } finally {
      setIsLoading(false)
    }
  }

  const handleImagePicker = () => {
    setShowImagePicker(true)
  }

  const requestCameraPermissions = async () => {
    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync()
    if (cameraPermission.status !== 'granted') {
      Alert.alert("Permission Required", "Please grant camera permission to take photos")
      return false
    }
    return true
  }

  const requestGalleryPermissions = async () => {
    const galleryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (galleryPermission.status !== 'granted') {
      Alert.alert("Permission Required", "Please grant permission to access photos")
      return false
    }
    return true
  }

  const handleTakePhoto = async () => {
    setShowImagePicker(false)
    
    const hasPermission = await requestCameraPermissions()
    if (!hasPermission) return

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: false,
      })

      console.log("Camera result:", result)

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newImageUri = result.assets[0].uri
        console.log("Captured image URI:", newImageUri)
        
        setProfileImageUri(newImageUri)
        
        setUserProfile({ 
          ...userProfile, 
          profileImage: { uri: newImageUri }
        })
      }
    } catch (error) {
      console.error("Error taking photo:", error)
      Alert.alert("Error", "Failed to take photo")
    }
  }

  const handleChooseFromGallery = async () => {
    setShowImagePicker(false)
    
    const hasPermission = await requestGalleryPermissions()
    if (!hasPermission) return

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: false,
      })

      console.log("Gallery result:", result)

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newImageUri = result.assets[0].uri
        console.log("Selected image URI:", newImageUri)
        
        setProfileImageUri(newImageUri)
        
        setUserProfile({ 
          ...userProfile, 
          profileImage: { uri: newImageUri }
        })
      }
    } catch (error) {
      console.error("Error picking image:", error)
      Alert.alert("Error", "Failed to pick image")
    }
  }

  const handleSaveChanges = async () => {
    if (!currentUser) {
      Alert.alert("Error", "No user logged in")
      return
    }

    if (!name.trim()) {
      Alert.alert("Validation Error", "Name cannot be empty")
      return
    }

    if (!email.trim()) {
      Alert.alert("Validation Error", "Email cannot be empty")
      return
    }

    setIsSaving(true)

    try {
      let photoURL = profileImageUri

      if (profileImageUri && (profileImageUri.startsWith('file://') || profileImageUri.startsWith('content://') || profileImageUri.includes('ImagePicker'))) {
        console.log("Uploading new profile image to Cloudinary...")
        console.log("Image URI to upload:", profileImageUri)
        
        try {
          const imagePickerResult = {
            assets: [{
              uri: profileImageUri,
              type: 'image/jpeg',
              fileName: `profile-${currentUser.uid}-${Date.now()}.jpg`
            }]
          }
          
          const uploadResult = await uploadToCloudinaryRN(imagePickerResult)
          photoURL = uploadResult.url
          console.log("New photo URL from Cloudinary:", photoURL)
        } catch (uploadError) {
          console.error("Image upload failed:", uploadError)
          throw new Error(`Image upload failed: ${uploadError.message}`)
        }
      }

      const userData = {
        displayName: name.trim(),
        name: name.trim(),
        email: email.trim(),
        phoneNumber: phoneNumber.trim(),
        photoURL: photoURL,
        profilePicture: photoURL,
        updatedAt: new Date(),
      }

      console.log("Saving user data to Firestore...")
      const userDocRef = doc(db, 'users', currentUser.uid)
      await setDoc(userDocRef, userData, { merge: true })

      console.log("Updating Firebase Auth profile...")
      await updateProfile(currentUser, {
        displayName: name.trim(),
        photoURL: photoURL,
      })

      setUserProfile({
        ...userProfile,
        name: name.trim(),
        email: email.trim(),
        phoneNumber: phoneNumber.trim(),
        profileImage: photoURL ? { uri: photoURL } : null,
      })

      console.log("Profile updated successfully")
      setIsSuccess(true)
    } catch (error) {
      console.error("Error saving changes:", error)
      
      let errorMessage = "Failed to save changes. Please try again."
      if (error.message) {
        errorMessage = error.message
      }
      
      Alert.alert("Error", errorMessage)
    } finally {
      setIsSaving(false)
    }
  }

  const handleChangePasswordPress = () => {
    navigation.navigate("ChangePassword")
  }

  const handleGoBack = () => {
    navigation.goBack()
  }

  const handleCloseModal = () => {
    setIsSuccess(false)
    navigation.navigate("SettingsScreen")
  }

  if (isLoading) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={[styles.container, styles.loadingContainer]}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </SafeAreaView>
      </SafeAreaProvider>
    )
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Account Settings</Text>
          </View>

          {/* Profile Picture Section */}
          <View style={styles.profileSection}>
            <TouchableOpacity onPress={handleImagePicker} disabled={isSaving}>
              <View style={styles.profileImageContainer}>
                {profileImageUri ? (
                  <Image 
                    source={{ uri: profileImageUri }} 
                    style={styles.profileImage}
                  />
                ) : (
                  <View style={styles.profileImagePlaceholder}>
                    <Ionicons name="camera" size={70} color="#fff" />
                  </View>
                )}
                <View style={styles.editIconContainer}>
                  <Ionicons name="camera" size={20} color="#fff" />
                </View>
              </View>
            </TouchableOpacity>
          </View>

          {/* Profile Details Section */}
          <View style={styles.detailsSection}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Name *</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter your full name"
                placeholderTextColor="#999"
                editable={!isSaving}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email *</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                keyboardType="email-address"
                placeholderTextColor="#999"
                editable={!isSaving}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                style={styles.input}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholder="Enter your phone number"
                keyboardType="phone-pad"
                placeholderTextColor="#999"
                editable={!isSaving}
              />
            </View>
          </View>

          {/* Change Password */}
          <View style={styles.passwordSection}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleChangePasswordPress}
              disabled={isSaving}
            >
              <View style={styles.menuLeft}>
                <View style={styles.iconContainer}>
                  <Ionicons name="key-outline" size={20} color="#666" />
                </View>
                <Text style={styles.menuText}>Change Password</Text>
              </View>
              <Ionicons name="chevron-forward-outline" size={20} color="#999" />
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Save Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
            onPress={handleSaveChanges}
            disabled={isSaving}
          >
            {isSaving ? (
              <View style={styles.savingContainer}>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={styles.savingText}>Saving...</Text>
              </View>
            ) : (
              <Text style={styles.saveButtonText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
      
      <SuccessModal isVisible={isSuccess} onClose={handleCloseModal} />
      <ImagePickerModal 
        isVisible={showImagePicker}
        onClose={() => setShowImagePicker(false)}
        onCamera={handleTakePhoto}
        onGallery={handleChooseFromGallery}
      />
    </SafeAreaProvider>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 50,
    marginBottom: 30,
    position: "relative",
    justifyContent: "center",
  },
  backButton: {
    position: "absolute",
    left: 20,
    zIndex: 1,
    paddingTop: 50,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
  },
  content: {
    paddingHorizontal: 20,
  },
  profileSection: {
    alignItems: "center",
    marginBottom: 40,
  },
  profileImageContainer: {
    marginBottom: 10,
    position: "relative",
    borderWidth: 3,
    borderColor: "#007AFF",
    borderRadius: 75,
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  profileImagePlaceholder: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "#ccc",
    justifyContent: 'center',
    alignItems: 'center',
  },
  editIconContainer: {
    position: "absolute",
    bottom: 5,
    right: 5,
    backgroundColor: "#007AFF",
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#fff",
  },
  detailsSection: {
    marginBottom: 30,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 14,
    fontSize: 16,
    color: "#333",
    backgroundColor: "#fff",
  },
  passwordSection: {
    borderTopWidth: 0.5,
    borderTopColor: "#E0E0E0",
    paddingTop: 20,
    marginBottom: 20,
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    marginTop: -25,
  },
  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 30,
    alignItems: "center",
    marginRight: 10,
  },
  menuText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  saveButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: "center",
  },
  saveButtonDisabled: {
    backgroundColor: "#999",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  savingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  savingText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 10,
  },
})

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

const imagePickerModalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  container: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  closeButton: {
    padding: 5,
  },
  optionsContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 15,
    marginBottom: 10,
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  optionIconContainer: {
    width: 50,
    height: 50,
    backgroundColor: "#E3F2FD",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
    flex: 1,
  },
  optionSubtitle: {
    fontSize: 14,
    color: "#666",
    flex: 1,
  },
})