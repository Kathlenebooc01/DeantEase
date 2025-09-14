import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
  Platform,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';

const ContactUs = ({ navigation }) => {
  // Exact coordinates for 961 Consolacion-Tayud-Liloan Rd., Landing Catarman, Liloan, Cebu
  const clinicLocation = {
    latitude: 10.3627,
    longitude: 123.9820,
    latitudeDelta: 0.008,
    longitudeDelta: 0.008,
  };

  const handlePhoneCall = () => {
    const phoneNumber = '+639065754148';
    Linking.canOpenURL(`tel:${phoneNumber}`)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(`tel:${phoneNumber}`);
        } else {
          Alert.alert('Error', 'Phone calls are not supported on this device');
        }
      })
      .catch((err) => console.error('Error opening phone dialer:', err));
  };

  const handleEmail = () => {
    const email = 'jfanodentalclinic@gmail.com';
    Linking.canOpenURL(`mailto:${email}`)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(`mailto:${email}`);
        } else {
          Alert.alert('Error', 'Email is not supported on this device');
        }
      })
      .catch((err) => console.error('Error opening email:', err));
  };

  const handleFacebook = () => {
    // Replace with actual Facebook page URL
    const facebookUrl = 'https://facebook.com/jfanodentalclinic';
    Linking.canOpenURL(facebookUrl)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(facebookUrl);
        } else {
          Alert.alert('Error', 'Cannot open Facebook');
        }
      })
      .catch((err) => console.error('Error opening Facebook:', err));
  };

  const openInMaps = () => {
    openMap({
      latitude: clinicLocation.latitude,
      longitude: clinicLocation.longitude,
      query: 'JF Ano Dental Clinic',
    });
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation?.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Title Section */}
      <View style={styles.titleSection}>
        <Text style={styles.title}>Contact Us</Text>
        <Text style={styles.subtitle}>
          Please feel free to contact us and we will get back to you as soon as we can.
        </Text>
      </View>

      {/* Visit Us Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Visit Us</Text>
        <View style={styles.contactItem}>
          <Ionicons name="location" size={20} color="#3B82F6" />
          <View style={styles.contactText}>
            <Text style={styles.addressText}>961 Consolacion-Tayud-Liloan Rd.</Text>
            <Text style={styles.addressText}>Landing Catarman Liloan,</Text>
            <Text style={styles.addressText}>Cebu, Liloan, Philippines</Text>
          </View>
        </View>
      </View>

      {/* Talk to Us Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Talk to Us</Text>
        
        <TouchableOpacity style={styles.contactItem} onPress={handlePhoneCall}>
          <Ionicons name="call" size={20} color="#10B981" />
          <Text style={[styles.contactText, styles.linkText]}>+639065754148</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.contactItem} onPress={handleEmail}>
          <Ionicons name="mail" size={20} color="#EF4444" />
          <Text style={[styles.contactText, styles.linkText]}>
            jfanodentalclinic@gmail.com
          </Text>
        </TouchableOpacity>
      </View>

      {/* Social Media Section */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.facebookButton} onPress={handleFacebook}>
          <Ionicons name="logo-facebook" size={20} color="white" />
          <Text style={styles.facebookText}>Follow us on Facebook</Text>
        </TouchableOpacity>
      </View>

      {/* Map Section */}
      <View style={styles.section}>
        <View style={styles.mapHeader}>
          <Text style={styles.sectionTitle}>Location</Text>
          <TouchableOpacity style={styles.openMapsButton} onPress={openInMaps}>
            <Ionicons name="open-outline" size={16} color="#3B82F6" />
            <Text style={styles.openMapsText}>Open in Maps</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            initialRegion={clinicLocation}
            showsUserLocation={true}
            showsMyLocationButton={true}
            zoomEnabled={true}
            scrollEnabled={true}
            pitchEnabled={true}
            rotateEnabled={true}
          >
            <Marker
              coordinate={{
                latitude: clinicLocation.latitude,
                longitude: clinicLocation.longitude,
              }}
              title="JF Ano Dental Clinic"
              description="961 Consolacion-Tayud-Liloan Rd., Landing Catarman Liloan, Cebu"
            >
              <View style={styles.markerContainer}>
                <Ionicons name="medical" size={24} color="white" />
              </View>
            </Marker>
          </MapView>
        </View>
      </View>

      {/* Footer spacing */}
      <View style={styles.footer} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    alignSelf: 'flex-start',
  },
  titleSection: {
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
    maxWidth: 300,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingVertical: 8,
  },
  contactText: {
    marginLeft: 12,
    flex: 1,
  },
  addressText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 20,
  },
  linkText: {
    fontSize: 16,
    color: '#3B82F6',
    textDecorationLine: 'underline',
  },
  facebookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  facebookText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  mapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  openMapsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: 'white',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  openMapsText: {
    fontSize: 14,
    color: '#3B82F6',
    marginLeft: 4,
  },
  mapContainer: {
    height: 250,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    backgroundColor: '#EF4444',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
  },
  footer: {
    height: 32,
  },
});

export default ContactUs;