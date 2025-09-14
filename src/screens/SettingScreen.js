"use client"
import React, { useContext, useEffect, useState, useCallback } from "react"
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Image, ScrollView, ActivityIndicator } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { useFocusEffect } from '@react-navigation/native'
import Navbar from "../navigations/navbar"
import { UserContext } from '../context/UserContext'
import { uploadToCloudinary } from '../config/cloudinaryConfig';

// Firebase imports
import { db, auth } from '../config/firebaseConfig'
import { doc, getDoc, onSnapshot } from 'firebase/firestore'

export default function SettingsScreen({ navigation }) {
  const { userProfile, setUserProfile } = useContext(UserContext)
  const [isLoading, setIsLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState(null)

  // Auth state listener
  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(user => {
      setCurrentUser(user)
    })
    return () => unsubscribeAuth()
  }, [])

  // Load user data from Firebase
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
        setUserProfile({
          ...userProfile,
          name: userData.displayName || userData.name || currentUser.displayName || 'User',
          email: userData.email || currentUser.email || '',
          phoneNumber: userData.phoneNumber || userData.phone || '',
          profileImage: userData.photoURL || userData.profilePicture ? 
            { uri: userData.photoURL || userData.profilePicture } : 
            null
        })
      } else {
        setUserProfile({
          ...userProfile,
          name: currentUser.displayName || 'User',
          email: currentUser.email || '',
          phoneNumber: '',
          profileImage: currentUser.photoURL ? 
            { uri: currentUser.photoURL } : 
            null
        })
      }
    } catch (error) {
      console.error("Error loading user data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Real-time listener for user profile changes
  useEffect(() => {
    if (!currentUser) return

    const userDocRef = doc(db, 'users', currentUser.uid)
    const unsubscribeUser = onSnapshot(userDocRef, (doc) => {
      if (doc.exists()) {
        const userData = doc.data()
        setUserProfile(prev => ({
          ...prev,
          name: userData.displayName || userData.name || currentUser.displayName || 'User',
          email: userData.email || currentUser.email || '',
          phoneNumber: userData.phoneNumber || userData.phone || '',
          profileImage: userData.photoURL || userData.profilePicture ? 
            { uri: userData.photoURL || userData.profilePicture } : 
            null
        }))
      }
    }, (error) => {
      console.error("Error listening to user profile changes:", error)
    })

    return () => unsubscribeUser()
  }, [currentUser])

  // Load data on component mount
  useEffect(() => {
    loadUserData()
  }, [currentUser])

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (currentUser) {
        loadUserData()
      }
    }, [currentUser])
  )

  const handleMenuPress = (menuItem) => {
    console.log("Menu pressed:", menuItem)
    if (menuItem === "Account") {
      navigation?.navigate("AccountSettings");
    } else if (menuItem === "Notifications") {
      navigation?.navigate("NotificationScreen");
    } else if (menuItem === "ContactSupport") {
      navigation?.navigate("ContactUs");
    }
  }

  const handleLogout = async () => {
    try {
      console.log("Logout pressed")
      await auth.signOut()
      
      setUserProfile({
        name: '',
        email: '',
        phoneNumber: '',
        profileImage: null
      })
      
      navigation.navigate("Login")
    } catch (error) {
      console.error("Error signing out:", error)
    }
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
          showsVerticalScrollIndicator={true}
          bounces={true}
          scrollEventThrottle={16}
          contentContainerStyle={styles.scrollContainer}
        >
          
          {/* Profile Section */}
          <TouchableOpacity 
            style={styles.profileSection}
            onPress={() => handleMenuPress("Account")}
          >
            <View style={styles.profileImageContainer}>
              {userProfile.profileImage && userProfile.profileImage.uri ? (
                <Image 
                  source={userProfile.profileImage}
                  style={styles.profileImage}
                />
              ) : (
                <View style={styles.profileImagePlaceholder}>
                  <Ionicons name="person" size={50} color="#666" />
                </View>
              )}
            </View>
            <Text style={styles.profileName}>{userProfile.name || 'User'}</Text>
            <Text style={styles.profileEmail}>{userProfile.email || 'No email'}</Text>
          </TouchableOpacity>

          {/* Settings Title */}
          <Text style={styles.sectionTitle}>Settings</Text>
          
          {/* Account */}
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => handleMenuPress("Account")}
          >
            <View style={styles.menuLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="person-outline" size={20} color="#666" />
              </View>
              <Text style={styles.menuText}>Account</Text>
            </View>
            <Ionicons name="chevron-forward-outline" size={20} color="#999" />
          </TouchableOpacity>

          {/* Notifications */}
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => handleMenuPress("Notifications")}
          >
            <View style={styles.menuLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="notifications-outline" size={20} color="#666" />
              </View>
              <Text style={styles.menuText}>Notifications</Text>
            </View>
            <Ionicons name="chevron-forward-outline" size={20} color="#999" />
          </TouchableOpacity>

          {/* Contact Support */}
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => handleMenuPress("ContactSupport")}
          >
            <View style={styles.menuLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="help-circle-outline" size={20} color="#666" />
              </View>
              <Text style={styles.menuText}>Contact support</Text>
            </View>
            <Ionicons name="chevron-forward-outline" size={20} color="#999" />
          </TouchableOpacity>

          {/* Logout */}
          <TouchableOpacity 
            style={[styles.menuItem, styles.logoutItem]}
            onPress={handleLogout}
          >
            <View style={styles.menuLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="log-out-outline" size={20} color="#666" />
              </View>
              <Text style={styles.menuText}>Logout</Text>
            </View>
          </TouchableOpacity>

          {/* Extra space at bottom for better scrolling */}
          <View style={styles.bottomSpacer} />

        </ScrollView>

        <Navbar navigation={navigation} activeTab="Settings" />
      </SafeAreaView>
    </SafeAreaProvider>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
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
  content: {
    flex: 1,
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingBottom: 120, // Increased bottom padding for navbar clearance
    flexGrow: 1,
  },
  profileSection: {
    alignItems: "center",
    paddingVertical: 90,
  },
  profileImageContainer: {
    marginBottom: 15,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#e0e0e0",
  },
  profileImagePlaceholder: { // New style for the placeholder
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#e0e0e0",
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileName: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: "#666",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 20,
    marginTop: -20,
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e0e0e0",
  },
  logoutItem: {
    borderBottomWidth: 0,
  },
  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 24,
    alignItems: "center",
    marginRight: 16,
  },
  menuText: {
    fontSize: 16,
    color: "#333",
  },
  bottomSpacer: {
    height: 20,
  },
})