import { useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Image } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { SafeAreaProvider } from "react-native-safe-area-context"

// The path to your local clinic logo image
const FANODENTAL_LOGO = require("../../assets/Login/q.png")


export default function SurveyScreen({ navigation }) {
  const [overallRating, setOverallRating] = useState(0)
  const [dentistRating, setDentistRating] = useState(0)
  const [staffRating, setStaffRating] = useState(0)

  // Array to make rendering the rating circles dynamic
  const ratingOptions = [1, 2, 3, 4, 5]

  const handleRatingPress = (setter, value) => {
    setter(value)
  }

  const handleSubmit = () => {
    console.log("Survey submitted!")
    console.log("Overall Rating:", overallRating)
    console.log("Dentist Rating:", dentistRating)
    console.log("Staff Rating:", staffRating)

    // Navigate to the next survey screen
    navigation.navigate("Nextsurvey");
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
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header Section */}
          <View style={styles.header}>
            <Image
              source={FANODENTAL_LOGO}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.headerText}>
              Thank you for visiting{" "}
              <Text style={styles.clinicName}>Fano Dental Clinic</Text> today! We
              value your opinion and we love to ask for your feedback
            </Text>
          </View>

          {/* Survey Questions */}
          <SurveyQuestion
            title="Overall Satisfaction"
            subtitle="How satisfied are you with your recent dental appointment?"
            rating={overallRating}
            onRatingPress={(value) => handleRatingPress(setOverallRating, value)}
          />

          <SurveyQuestion
            title="Dentist Professionalism"
            subtitle="How would you rate the professionalism and friendliness of your dentist?"
            rating={dentistRating}
            onRatingPress={(value) => handleRatingPress(setDentistRating, value)}
          />

          <SurveyQuestion
            title="Staff Assistance"
            subtitle="How would you rate the helpfulness and courtesy of the clinic staff?"
            rating={staffRating}
            onRatingPress={(value) => handleRatingPress(setStaffRating, value)}
          />

          {/* Submit Button */}
          <View style={styles.submitButtonContainer}>
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
              <Text style={styles.submitButtonText}>Next</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
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
  headerText: {
    textAlign: "center",
    fontSize: 16,
    color: "#666",
    lineHeight: 24,
  },
  clinicName: {
    fontWeight: "bold",
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
  submitButtonContainer: {
    alignItems: "center",
    marginTop: 10,
  },
  submitButton: {
    backgroundColor: "#4A90E2",
    width: 100,
    height: 45,
    borderRadius: 30,
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
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
})
