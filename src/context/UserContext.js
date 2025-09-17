// context/UserContext.js
import React, { createContext, useState, useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '../config/firebaseConfig'

export const UserContext = createContext()

export const UserProvider = ({ children }) => {
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Get user data from Firestore
          const userDoc = await getDoc(doc(db, "users", user.uid))
          
          if (userDoc.exists()) {
            const userData = userDoc.data()
            
            // Set user profile with messaging-compatible format
            setUserProfile({
              id: user.uid, // Use Firebase UID as unique ID
              name: `${userData.firstName} ${userData.lastName}`,
              fullName: `${userData.firstName} ${userData.lastName}`,
              email: user.email,
              phoneNumber: userData.phoneNumber || '',
              profileImage: null, // You can add profile image later
              // Additional data from Firestore
              firstName: userData.firstName,
              lastName: userData.lastName,
              address: userData.address,
              birthDate: userData.birthDate,
              gender: userData.gender
            })
          } else {
            // Fallback if no Firestore document exists
            setUserProfile({
              id: user.uid,
              name: user.displayName || 'User',
              fullName: user.displayName || 'User',
              email: user.email,
              phoneNumber: '',
              profileImage: null
            })
          }
        } catch (error) {
          console.error('Error fetching user data:', error)
          // Fallback user profile
          setUserProfile({
            id: user.uid,
            name: user.displayName || 'User',
            fullName: user.displayName || 'User',
            email: user.email,
            phoneNumber: '',
            profileImage: null
          })
        }
      } else {
        setUserProfile(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const logoutUser = () => {
    setUserProfile(null)
  }

  return (
    <UserContext.Provider value={{ userProfile, setUserProfile, loading, logoutUser }}>
      {children}
    </UserContext.Provider>
  )
}