import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView,
  Image,
  Dimensions 
} from 'react-native';

const { width, height } = Dimensions.get('window');

export default function FeedbackScreen({ navigation }) {
  const handleFillSurvey = () => {
    // Navigate to the SurveyScreen component
    console.log("Fill out survey pressed");
    if (navigation && navigation.navigate) {
      navigation.navigate("SurveyScreen");
    } else {
      console.log("Navigation prop is not available");
    }
  };

  const handleRemindLater = () => {
    // Navigate to the ProfileScreen
    console.log("Remind me later pressed. Navigating to ProfileScreen.");
    navigation.navigate("Profile");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Logo/Icon at top */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/Feedback/logo.png')} // Replace with your logo
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Your Custom Image */}
        <View style={styles.imageContainer}>
          <Image
            source={require('../../assets/Feedback/main.png')} // Replace with your image path
            style={styles.mainImage}
            resizeMode="contain"
          />
        </View>

        {/* Main text */}
        <View style={styles.textContainer}>
          <Text style={styles.mainText}>Your response matters.</Text>
        </View>

        {/* Buttons */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity style={styles.primaryButton} onPress={handleFillSurvey}>
            <Text style={styles.primaryButtonText}>Fill out survey</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.secondaryButton} onPress={handleRemindLater}>
            <Text style={styles.secondaryButtonText}>Remind me later</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4A90E2',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 60,
  },
  logoContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  logo: {
    width: 135,
    height: 135,
    tintColor: 'white',
    marginBottom: -80,
    marginTop: -10,
  },
  customImage: {
    width: 120,
    height: 120,
    // Add any styling you want for your custom image
    // Remove tintColor if you want the original colors
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 40,
  },
  mainImage: {
    width: 350,
    height: 350,
    marginBottom: -20,
    // Adjust dimensions based on your image
    // Add shadow if desired
    shadowColor: '#5a1313ff',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  textContainer: {
    paddingHorizontal: 40,
    marginBottom: 38,
  },
  mainText: {
    fontSize: 26,
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
    lineHeight: 40,
  },
  buttonsContainer: {
    width: '100%',
    paddingHorizontal: 40,
    gap: 15,
  },
  primaryButton: {
    backgroundColor: 'white',
    borderRadius: 25,
    paddingVertical: 16,
    paddingHorizontal: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryButtonText: {
    color: '#4A90E2',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 25,
    paddingVertical: 16,
    paddingHorizontal: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  secondaryButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '500',
  },
});
