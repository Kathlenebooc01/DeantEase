import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, SafeAreaView } from 'react-native';

export default function GetStartedScreen({ navigation }) {
  const handleGetStarted = () => {
    // Option 1: Navigate with no animation
    navigation.navigate('Login');
    
    // Option 2: Use reset to completely replace screen (uncomment to use)
    // navigation.reset({
    //   index: 0,
    //   routes: [{ name: 'Login' }],
    // });
    
    // Option 3: Use replace to replace current screen (uncomment to use)
    // navigation.replace('Login');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Logo */}
      <Image
        source={require('../../assets/Started/name.png')} // Replace with your DentEase logo
        style={styles.logo}
        resizeMode="contain"
      />

      {/* Doctors + Tooth Illustration */}
      <Image
        source={require('../../assets/Started/image 57.png')} // TEMP placeholder for doctors fixing tooth
        style={styles.illustration}
        resizeMode="contain"
      />

      {/* Title */}
      <Text style={styles.title}>
        Your healthy smile journey starts with our app
      </Text>

      {/* Subtitle */}
      <Text style={styles.subtitle}>
        Enjoy a worry-free smile and the care you deserve — book your visit with us today and discover the difference.
      </Text>

      {/* Button */}
      <TouchableOpacity
        style={styles.button}
        onPress={handleGetStarted}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  logo: {
    width: 120,
    height: 200,
    marginBottom: 190,
    marginLeft: 25,
    marginTop: -50,
  },
  illustration: {
    width: '100%',
    height: 250,
    marginBottom: 20,
    marginTop: -250,
    marginLeft: 25,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#000000ff',
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 15,
  },
  button: {
    backgroundColor: '#fff',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: '#3B82F6',
    fontWeight: '700',
    fontSize: 16,
  },
});