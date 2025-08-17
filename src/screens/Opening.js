import React, { useEffect, useRef } from 'react';
import { View, Image, StyleSheet, SafeAreaView, Animated, TouchableWithoutFeedback } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function Opening({ navigation }) {
  const logoOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start();
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <TouchableWithoutFeedback onPress={() => navigation.navigate('GetStarted')}>
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.inner}>
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
    </TouchableWithoutFeedback>
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
    marginRight: -6,
  },
});