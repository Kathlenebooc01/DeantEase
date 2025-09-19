import { useState, useRef, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Image, TextInput, KeyboardAvoidingView, Platform, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db, auth } from '../config/firebaseConfig' // Adjust this path to your firebaseConfig.js location

// The path to your local clinic logo image
const FANODENTAL_LOGO = require("../../assets/Login/q.png")

export default function Nextsurvey({ navigation, route }) {
  const [waitingTimeRating, setWaitingTimeRating] = useState(0)
  const [clinicEnvRating, setClinicEnvRating] = useState(0)
  const [treatmentRating, setTreatmentRating] = useState(0)
  const [openFeedback, setOpenFeedback] = useState("")
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Get the survey ID from navigation params
  const { surveyId } = route.params || {}

  // Create a ref for the ScrollView to enable manual scrolling
  const scrollViewRef = useRef(null)

  // Array to make rendering the rating circles dynamic
  const ratingOptions = [1, 2, 3, 4, 5]

  const handleRatingPress = (setter, value) => {
    setter(value)
  }

  const updateSurveyInFirebase = async (additionalData) => {
    try {
      setIsLoading(true)
      
      if (!surveyId) {
        throw new Error("Survey ID not found")
      }

      const surveyRef = doc(db, 'surveys', surveyId)
      
      await updateDoc(surveyRef, {
        ...additionalData,
        completedAt: serverTimestamp(),
        surveyStage: 'completed',
        isComplete: true
      })
      
      console.log("Survey updated successfully")
      return true
    } catch (error) {
      console.error("Error updating survey: ", error)
      Alert.alert("Error", "Failed to save survey data. Please try again.")
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async () => {
    // Validation
    if (waitingTimeRating === 0 || clinicEnvRating === 0 || treatmentRating === 0) {
      Alert.alert("Incomplete Survey", "Please rate all questions before submitting.")
      return
    }

    console.log("Survey submitted!")
    console.log("Waiting Time Rating:", waitingTimeRating)
    console.log("Clinic Environment Rating:", clinicEnvRating)
    console.log("Treatment Satisfaction Rating:", treatmentRating)
    console.log("Open Feedback:", openFeedback)

    // Prepare additional data for Firebase
    const additionalData = {
      waitingTime: waitingTimeRating,
      clinicEnvironment: clinicEnvRating,
      treatmentSatisfaction: treatmentRating,
      openFeedback: openFeedback.trim(),
      feedbackLength: openFeedback.trim().length
    }

    // Update the survey in Firebase
    const success = await updateSurveyInFirebase(additionalData)
    
    if (success) {
      // Show the confirmation pop-up
      setShowConfirmation(true)
    }
  }
  
  const handleReturnToHome = () => {
    // Hide the modal
    setShowConfirmation(false)
    // Navigate back to the home screen using the correct name 'Profile'.
    navigation.navigate("Profile")
  }

  // A reusable component for each survey question
  const SurveyQuestion = ({ title, subtitle, rating, onRatingPress }) => (
    <View style={styles.questionContainer}>
      <Text style={styles.questionTitle}>{title}</Text>
      <Text style={styles.questionSubtitle}>{subtitle}</Text>
      <View style={styles.ratingRow}>
        {ratingOptions.map((value) => (
          <TouchableOpacity
            key={value}
            style={[
              styles.ratingCircle,
              rating === value && styles.ratingCircleSelected,
            ]}
            onPress={() => onRatingPress(value)}
          >
            <Text
              style={[
                styles.ratingNumber,
                rating === value && styles.ratingNumberSelected,
              ]}
            >
              {value}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  )

  return (
    <SafeAreaProvider>
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: '#fff' }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <SafeAreaView style={styles.container}>
          <ScrollView 
            ref={scrollViewRef}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header Section */}
            <View style={styles.header}>
              <Image
                source={FANODENTAL_LOGO}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>

            {/* Survey Questions */}
            <SurveyQuestion
              title="Waiting Time"
              subtitle="How satisfied are you with the waiting time before your appointment?"
              rating={waitingTimeRating}
              onRatingPress={(value) => handleRatingPress(setWaitingTimeRating, value)}
            />

            <SurveyQuestion
              title="Clinic Environment"
              subtitle="How satisfied are you with the clinic environment and cleanliness?"
              rating={clinicEnvRating}
              onRatingPress={(value) => handleRatingPress(setClinicEnvRating, value)}
            />

            <SurveyQuestion
              title="Treatment Satisfaction"
              subtitle="How satisfied are you with the treatment you received?"
              rating={treatmentRating}
              onRatingPress={(value) => handleRatingPress(setTreatmentRating, value)}
            />

            {/* Open Feedback Section */}
            <View style={styles.questionContainer}>
              <Text style={styles.questionTitle}>Open Feedback</Text>
              <Text style={styles.questionSubtitle}>What did you like the most about your visit?</Text>
              <TextInput
                style={styles.textInput}
                multiline
                onChangeText={setOpenFeedback}
                value={openFeedback}
                placeholder="Type your feedback here..."
                placeholderTextColor="#ccc"
                maxLength={500} // Limit feedback length
              />
              <Text style={styles.characterCount}>{openFeedback.length}/500</Text>
            </View>

            {/* Submit Button */}
            <View style={styles.submitButtonContainer}>
              <TouchableOpacity 
                style={[styles.submitButton, isLoading && styles.submitButtonDisabled]} 
                onPress={handleSubmit}
                disabled={isLoading}
              >
                <Text style={styles.submitButtonText}>
                  {isLoading ? "Submitting..." : "Submit"}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Ionicons name="checkmark-circle" size={80} color="#4A90E2" style={styles.checkmarkIcon} />
            <Text style={styles.modalTitle}>We thank you for your time spent taking this survey.</Text>
            <Text style={styles.modalText}>Your response has been recorded.</Text>
            <TouchableOpacity style={styles.returnButton} onPress={handleReturnToHome}>
              <Text style={styles.returnButtonText}>Return to Home</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaProvider>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 80,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 20,
  },
  questionContainer: {
    marginBottom: 30,
  },
  questionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginBottom: 5,
  },
  questionSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
  },
  ratingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  ratingCircle: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    borderWidth: 1,
    borderColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
  },
  ratingCircleSelected: {
    backgroundColor: "#4A90E2",
    borderColor: "#4A90E2",
  },
  ratingNumber: {
    fontSize: 14,
    color: "#666",
  },
  ratingNumberSelected: {
    color: "#fff",
    fontWeight: "bold",
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 15,
    minHeight: 120,
    fontSize: 16,
    color: "#333",
    textAlignVertical: "top",
  },
  characterCount: {
    textAlign: "right",
    fontSize: 12,
    color: "#999",
    marginTop: 5,
  },
  submitButtonContainer: {
    alignItems: "center",
    marginTop: 30,
  },
  submitButton: {
    backgroundColor: "#4A90E2",
    width: 120,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#4A90E2",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  submitButtonDisabled: {
    backgroundColor: "#ccc",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 40,
    borderRadius: 20,
    alignItems: 'center',
    width: '80%',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  checkmarkIcon: {
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  modalText: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
    marginBottom: 20,
  },
  returnButton: {
    backgroundColor: '#4A90E2',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  returnButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
})