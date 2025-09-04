// context/UserContext.js

import React, { createContext, useState } from 'react'

// 1. Create the Context
export const UserContext = createContext()

// 2. Create the Provider component
export const UserProvider = ({ children }) => {
  const [userProfile, setUserProfile] = useState({
    profileImage: require("../../assets/profile/photo.png"),
    name: 'Clara Lauren',
    email: 'claralaurent@gmail.com',
    phoneNumber: '09123456789',
  })

  return (
    <UserContext.Provider value={{ userProfile, setUserProfile }}>
      {children}
    </UserContext.Provider>
  )
}