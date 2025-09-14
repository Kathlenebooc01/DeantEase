import React, { useEffect, useRef } from 'react';
import { View, Image, StyleSheet, SafeAreaView, Animated } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function Opening({ navigation }) {
  // Use a ref to hold the Animated.Value for opacity.
  const logoOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start the animation after 1.5 seconds.
    const animationTimer = setTimeout(() => {
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start(() => {
        // After the animation finishes (1 second), automatically navigate.
        navigation.navigate('GetStarted');
      });
    }, 1500);

    // Clean up the timer to prevent memory leaks if the component unmounts.
    return () => clearTimeout(animationTimer);
  }, [navigation, logoOpacity]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.inner}>
        {/*
          Using `require` for local assets, so we can't show a live preview.
          The `tooth.png` image is a placeholder for your actual asset.
        */}
        <Image
          source={require('../../assets/opening/tooth.png')}
          style={styles.tooth}
          resizeMode="contain"
        />
        <Animated.Image
          source={require('../../assets/opening/logo.png')}
          style={[styles.logo, { opacity: logoOpacity }]}
          resizeMode="contain"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inner: {
    alignItems: 'center',
  },
  tooth: {
    width: 200,
    height: 200,
    marginBottom: -135,
  },
  logo: {
    width: 200,
    height: 180,
    marginRight: -5,
  },
});
