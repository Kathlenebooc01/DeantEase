import React, { useState, useMemo, useEffect } from "react";

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
  TextInput,
  Modal,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaProvider } from "react-native-safe-area-context";

// Import Firebase functions
import { db } from '../config/firebaseConfig';
import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore';

// Updated image map - make sure these match your Firebase localImage fields exactly
const serviceImages = {
  'Consulation.png': require('../../assets/ServicesScreen/Consulation.png'),
  'atay.png': require('../../assets/ServicesScreen/atay.png'),
  'image 32.png': require('../../assets/ServicesScreen/image 32.png'), // Tooth Extraction
  'pit.png': require('../../assets/ServicesScreen/pit.png'), // Pit and Fissure
  'image 36.png': require('../../assets/ServicesScreen/image 36.png'), 
  'image 37.png': require('../../assets/ServicesScreen/image 37.png'), // Fluoride Varnish
  'image 38.png': require('../../assets/ServicesScreen/image 38.png'), // Denture
  'image 41.png': require('../../assets/ServicesScreen/image 41.png'), // Dental Filling
  'image 42.png': require('../../assets/ServicesScreen/image 42.png'), // Frenectomy
  'image 43.png': require('../../assets/ServicesScreen/image 43.png'), // Gingivectomy
  'image 44.png': require('../../assets/ServicesScreen/image 44.png'), // Dental Crown
  'image 45.png': require('../../assets/ServicesScreen/image 45.png'), // Teeth Whitening
  'image 54.png': require('../../assets/ServicesScreen/image 54.png'), // Orthodontic Braces
  'Root.png': require('../../assets/ServicesScreen/Root.png'), // Root Canal
  'Braces.png': require('../../assets/ServicesScreen/Braces.png'), // If you have this
};

// Category mapping: Display name -> Firebase value
const categoryMapping = {
  "All": "All",
  "Preventive & General Care": "preventive",
  "Restorative Care": "restorative", 
  "Cosmetic Dentistry": "cosmetic",
  "Surgical Procedures": "surgical",
  "Orthodontics & Specialties": "orthodontics"
};

// Categories for display in the filter
const serviceCategories = Object.keys(categoryMapping);

export default function ServicesScreen({ navigation }) {
  const [selectedService, setSelectedService] = useState(null);
  const [expandedServices, setExpandedServices] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filterCategory, setFilterCategory] = useState("All");
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showServiceDetailsModal, setShowServiceDetailsModal] = useState(false);
  
  // Firebase states
  const [services, setServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  
  const itemsPerPage = 6;

  // Fetch services from Firebase - Same logic as AppointmentScreen
  useEffect(() => {
    const servicesRef = collection(db, 'services');
    const q = query(
      servicesRef,
      where('isActive', '==', true),
      orderBy('order', 'asc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedServices = [];
      querySnapshot.forEach((doc) => {
        const serviceData = {
          id: doc.id,
          ...doc.data()
        };
        fetchedServices.push(serviceData);
      });
      
      // Debug logging to see what services are being fetched
      console.log('ServicesScreen - Fetched services count:', fetchedServices.length);
      fetchedServices.forEach((service, index) => {
        console.log(`ServicesScreen - Service ${index + 1}:`, {
          id: service.id,
          name: service.name,
          localImage: service.localImage,
          price: service.price,
          category: service.category
        });
      });
      
      setServices(fetchedServices);
      setServicesLoading(false);
    }, (error) => {
      console.error('ServicesScreen - Error fetching services:', error);
      setServicesLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleServicePress = (serviceId) => {
    setSelectedService(serviceId);
    console.log("Service selected:", serviceId);
    // Enable expansion for all services that have details
    const service = services.find(s => s.id === serviceId);
    if (service && service.description) {
      setExpandedServices((prev) => ({
        ...prev,
        [serviceId]: !prev[serviceId],
      }));
    }
  };

  // New function to handle opening service details modal
  const handleServiceDetailsPress = (serviceId) => {
    setSelectedService(serviceId);
    setShowServiceDetailsModal(true);
  };

  const handleBackPress = () => {
    if (navigation) {
      navigation.goBack();
    } else {
      console.log("Navigate back");
    }
  };

  const handleFilterPress = () => {
    setShowFilterModal(true);
  };

  const handleSelectFilter = (category) => {
    setFilterCategory(category);
    setShowFilterModal(false);
    setCurrentPage(1);
  };

  // Function to get display name for category
  const getCategoryDisplayName = (firebaseCategory) => {
    // Find the display name for a Firebase category value
    const entry = Object.entries(categoryMapping).find(([displayName, fbValue]) => fbValue === firebaseCategory);
    return entry ? entry[0] : firebaseCategory;
  };

  const filteredServices = useMemo(() => {
    return services
      .filter((service) => {
        const matchesSearch = (service.name || '')
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
        
        // Handle category filtering with mapping
        let matchesFilter;
        if (filterCategory === "All") {
          matchesFilter = true;
        } else {
          const firebaseCategory = categoryMapping[filterCategory];
          matchesFilter = service.category === firebaseCategory;
        }
        
        console.log('Filter debug:', {
          serviceName: service.name,
          serviceCategory: service.category,
          filterCategory: filterCategory,
          firebaseCategory: categoryMapping[filterCategory],
          matchesFilter: matchesFilter
        });
        
        return matchesSearch && matchesFilter;
      })
      .sort((a, b) => (a.order || 0) - (b.order || 0)); // Sort by order field from Firebase
  }, [searchQuery, filterCategory, services]);

  const totalPages = Math.ceil(filteredServices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentServices = filteredServices.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const selectedServiceDetails = services.find(
    (service) => service.id === selectedService
  );

  // Function to format price from Firebase
  const formatPrice = (price) => {
    if (!price) return 'Contact for pricing';
    if (typeof price === 'string') return price;
    return `₱${price.toLocaleString()}`;
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
            <Ionicons name="chevron-back-outline" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>All Services</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.searchAndFilterContainer}>
          <View style={styles.searchContainer}>
            <Ionicons
              name="search"
              size={20}
              color="#666"
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search"
              placeholderTextColor="#888"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={handleFilterPress}
          >
            <Ionicons name="options-outline" size={24} color="#1290D5" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {servicesLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#1290D5" />
              <Text style={styles.loadingText}>Loading services...</Text>
            </View>
          ) : services.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No services available</Text>
            </View>
          ) : filteredServices.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No services found for "{filterCategory}"</Text>
              <TouchableOpacity 
                style={styles.clearFilterButton}
                onPress={() => setFilterCategory("All")}
              >
                <Text style={styles.clearFilterText}>Show All Services</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.servicesGrid}>
              {currentServices.map((service) => {
                // Get the image source, fallback to consultation image if not found
                const imageSource = serviceImages[service.localImage] || serviceImages['Consulation.png'];
                
                return (
                  <View key={service.id} style={styles.serviceWrapper}>
                    <TouchableOpacity
                      style={[
                        styles.serviceCard,
                        selectedService === service.id && styles.serviceCardActive,
                      ]}
                      onPress={() => {
                        handleServicePress(service.id);
                        handleServiceDetailsPress(service.id);
                      }}
                      activeOpacity={0.8}
                    >
                      <View style={styles.serviceContent}>
                        <Image
                          source={imageSource}
                          style={styles.serviceImage}
                          resizeMode="contain"
                          onError={(error) => {
                            console.log('ServicesScreen - Image load error for', service.localImage, error);
                          }}
                        />
                        <Text style={styles.serviceName}>{service.name || 'Unnamed Service'}</Text>
                        <Text style={styles.servicePrice}>{formatPrice(service.price)}</Text>
                      </View>
                     
                      {/* View More button inside the card */}
                      <View style={styles.viewMoreButtonInside}>
                        <Text style={styles.viewMoreTextInside}>view more</Text>
                        <Ionicons name="chevron-forward" size={16} color="#1290D5" />
                      </View>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>

        {!servicesLoading && services.length > 0 && filteredServices.length > 0 && (
          <View style={styles.paginationContainer}>
            <TouchableOpacity
              style={[
                styles.paginationButton,
                currentPage === 1 && styles.disabledButton,
              ]}
              onPress={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <Text style={styles.paginationText}>Previous Page</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.paginationButton,
                currentPage === totalPages && styles.disabledButton,
              ]}
              onPress={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
              disabled={currentPage === totalPages}
            >
              <Text style={styles.paginationText}>Next Page</Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>

      {/* Filter Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showFilterModal}
        onRequestClose={() => setShowFilterModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowFilterModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filter Services</Text>
            {serviceCategories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.modalFilterButton,
                  filterCategory === category && styles.modalFilterButtonActive,
                ]}
                onPress={() => handleSelectFilter(category)}
              >
                <Text
                  style={[
                    styles.modalFilterText,
                    filterCategory === category &&
                      styles.modalFilterTextActive,
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Service Details Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showServiceDetailsModal}
        onRequestClose={() => setShowServiceDetailsModal(false)}
      >
        <View style={styles.detailsModalOverlay}>
          <View style={styles.detailsModalContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowServiceDetailsModal(false)}
            >
              <Ionicons name="close-circle" size={30} color="#1290D5" />
            </TouchableOpacity>

            {selectedServiceDetails && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <Image
                  source={serviceImages[selectedServiceDetails.localImage] || serviceImages['Consulation.png']}
                  style={styles.detailsModalImage}
                  resizeMode="contain"
                />
                <Text style={styles.detailsModalName}>
                  {selectedServiceDetails.name || 'Unnamed Service'}
                </Text>
                <Text style={styles.detailsModalDescription}>
                  {selectedServiceDetails.description || 'No description available.'}
                </Text>

                {/* Price section */}
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>Price:</Text>
                  <Text style={styles.detailSectionText}>
                    {formatPrice(selectedServiceDetails.price)}
                  </Text>
                </View>

                {/* Category section if available */}
                {selectedServiceDetails.category && (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailSectionTitle}>Category:</Text>
                    <Text style={styles.detailSectionText}>
                      {getCategoryDisplayName(selectedServiceDetails.category)}
                    </Text>
                  </View>
                )}

                {/* Additional info section */}
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>About this service:</Text>
                  <Text style={styles.detailSectionText}>
                    This service is provided by our experienced dental team. 
                    For more detailed information or to ask specific questions about this treatment, 
                    please contact our clinic or book a consultation.
                  </Text>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1290D5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#fff",
  },
  placeholder: {
    width: 34,
  },
  searchAndFilterContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 20,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginRight: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  filterButton: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  clearFilterButton: {
    backgroundColor: '#1290D5',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  clearFilterText: {
    color: '#fff',
    fontWeight: '600',
  },
  servicesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  serviceWrapper: {
    width: "48%",
    marginBottom: 20,
    alignItems: "center",
  },
  serviceCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 15,
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    height: 220,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 2,
    borderColor: "transparent",
  },
  serviceCardActive: {
    borderColor: "#1290D5",
  },
  serviceContent: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  serviceImage: {
    width: 60,
    height: 60,
    marginBottom: 10,
  },
  serviceName: {
    marginTop: 5,
    fontSize: 14,
    color: "#333",
    textAlign: "center",
    fontWeight: "bold",
    lineHeight: 16,
  },
  servicePrice: {
    marginTop: 5,
    fontSize: 12,
    color: "#1290D5",
    textAlign: "center",
    fontWeight: "600",
  },
  // New styles for the inside view more button
  viewMoreButtonInside: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    paddingVertical: 5,
  },
  viewMoreTextInside: {
    color: "#1290D5",
    fontSize: 14,
    fontWeight: "500",
    marginRight: 5,
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#f8f9fa",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  paginationButton: {
    backgroundColor: "#1290D5",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 50,
    width: "48%",
    alignItems: "center",
  },
  paginationText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  modalFilterButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    marginBottom: 10,
    alignItems: "center",
  },
  modalFilterButtonActive: {
    backgroundColor: "#1290D5",
  },
  modalFilterText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  modalFilterTextActive: {
    color: "#fff",
  },
  // Details modal styles
  detailsModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  detailsModalContent: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    width: "90%",
    maxHeight: "80%",
    alignItems: "center",
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 1,
  },
  detailsModalImage: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  detailsModalName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1290D5",
    marginBottom: 10,
    textAlign: "center",
  },
  detailsModalDescription: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 22,
  },
  // Additional styles for detailed sections
  detailSection: {
    marginBottom: 15,
    width: "100%",
  },
  detailSectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1290D5",
    marginBottom: 5,
  },
  detailSectionText: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
});