import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function ServicesScreen({ navigation }) {
  const [selectedService, setSelectedService] = useState(null);
  const [expandedServices, setExpandedServices] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const handleServicePress = (serviceId) => {
    setSelectedService(serviceId);
    console.log("Service selected:", serviceId);
    // Toggle expanded state for services that have additional details
    if (serviceId === "denture" || serviceId === "dental_crown") {
      setExpandedServices((prev) => ({
        ...prev,
        [serviceId]: !prev[serviceId],
      }));
    }
  };

  const handleBackPress = () => {
    if (navigation) {
      navigation.goBack();
    } else {
      console.log("Navigate back");
    }
  };

  // The static list of services
  const services = [
    {
      id: "consultation",
      name: "Dental Consultation",
      description: "Full check-up of teeth, gums, and mouth with advice and treatment options.",
       image: require("../../assets/ServicesScreen/Consulation.png"),
      price: "₱500",
    },
    {
      id: "prophylaxis",
      name: "Oral Prophylaxis (Cleaning)",
      description: "Professional cleaning to remove buildup, keep your smile fresh, and prevent gum disease.",
       image: require("../../assets/ServicesScreen/Oral.png"),
      price: "₱800 - ₱2,500",
    },
    {
      id: "dental_filling",
      name: "Dental Filling (Pasta)",
      description: "Tooth-colored fillings matched to your natural teeth for a seamless smile.",
      image: require("../../assets/ServicesScreen/image 41.png"),
      price: "₱1,000 - ₱2,500",
    },
    {
      id: "fluoride",
      name: "Fluoride Varnish",
      description: "Fluoride varnish coats teeth to strengthen enamel and protect against cavities.",
       image: require("../../assets/ServicesScreen/image 37.png"),
      price: "₱500",
    },
    {
      id: "pit_fissure",
      name: "Pit and Fissure Sealant",
      description: "Protective coating applied to molars to seal grooves and prevent cavities.",
      image: require("../../assets/ServicesScreen/image 35.png"),
      price: "₱500",
    },
    {
      id: "root_canal",
      name: "Root Canal Treatment",
      description: "Root Canal Treatment removes an infected tooth nerve and seals it to prevent reinfection.",
       image: require("../../assets/ServicesScreen/Root.png"),
      price: "₱500",
    },
    {
      id: "tooth_extraction",
      name: "Tooth Extraction (Odontectomy)",
      description: "If you have a tooth that is damaged by trauma or decay, it may require extraction.",
      image: require("../../assets/ServicesScreen/image 32.png"),
      price: "₱500",
    },
    {
      id: "orthodontics",
      name: "Orthodontics Braces",
      description: "Braces straighten misaligned teeth and correct bite issues, improving appearance and oral health.",
      image: require("../../assets/profile/image 54.png"),
      price: "₱500",
    },
    {
      id: "teeth_whitening",
      name: "Teeth Whitening",
      description: "A cosmetic treatment that lightens teeth and removes stains, giving you a whiter and more confident smile.",
      image: require("../../assets/profile/image 45.png"),
      price: "₱500",
    },
    {
      id: "gingivectomy",
      name: "Gingivectomy",
      description: "A minor surgery that removes excess or diseased gum tissue, improving gum health and smile appearance.",
      image: require("../../assets/ServicesScreen/image 43.png"),
      price: "₱500",
    },
    {
      id: "frenectomy",
      name: "Frenectomy",
      description: "A minor surgery to correct tongue-tie or lip-tie, improving speech, eating, and orthodontic care.",
      image: require("../../assets/ServicesScreen/image 42.png"),
      price: "₱500",
    },
    {
      id: "denture",
      name: "Denture",
      description: "Custom-made dentures replace missing teeth, restoring your smile and chewing function.",
      image: require("../../assets/ServicesScreen/image 38.png"),
      price: "₱500",
      details: ["• Partial/Metal", "• Complete", "• Soft Liner", "• Complete denture and etc."],
    },
    {
      id: "dental_crown",
      name: "Dental Crown",
      description: "A crown is a cap that restores a damaged tooth's strength, function, and appearance.",
      image: require("../../assets/ServicesScreen/image 44.png"),
      price: "₱500",
      details: ["• Jacket Crown", "• PFM Crown", "• All Ceramic", "• Zirconia Crown", "• Second Crown"],
    },
  ];

  const filteredServices = useMemo(() => {
    return services.filter((service) =>
      service.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, services]);

  const totalPages = Math.ceil(filteredServices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentServices = filteredServices.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
            <Ionicons name="chevron-back-outline" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>All Services</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            placeholderTextColor="#888"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.servicesGrid}>
            {currentServices.map((service) => (
              <View key={service.id} style={styles.serviceWrapper}>
                <TouchableOpacity
                  style={[
                    styles.serviceCard,
                    selectedService === service.id && styles.serviceCardActive,
                  ]}
                  onPress={() => handleServicePress(service.id)}
                >
                  <Image
                    source={service.image}
                    style={styles.serviceImage}
                    resizeMode="contain"
                  />
                  <Text style={styles.serviceName}>{service.name}</Text>
                  <Text style={styles.servicePrice}>{service.price}</Text>
                </TouchableOpacity>

                {service.details && expandedServices[service.id] && (
                  <View style={styles.serviceDetails}>
                    {service.details.map((detail, detailIndex) => (
                      <Text key={detailIndex} style={styles.detailText}>
                        {detail}
                      </Text>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Pagination Controls */}
        <View style={styles.paginationContainer}>
          <TouchableOpacity
            style={[styles.paginationButton, currentPage === 1 && styles.disabledButton]}
            onPress={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            <Text style={styles.paginationText}>Previous Page</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.paginationButton, currentPage === totalPages && styles.disabledButton]}
            onPress={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            <Text style={styles.paginationText}>Next Page</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
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
    paddingTop: 30,
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
    width: 34, // Same width as back button to center the title
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    marginHorizontal: 20,
    marginBottom: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  content: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
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
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: 180,
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
  serviceImage: {
    width: 60,
    height: 60,
    marginBottom: 5,
  },
  serviceName: {
    marginTop: 10,
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    fontWeight: "bold",
  },
  servicePrice: {
    fontSize: 14,
    color: "#1290D5",
    fontWeight: "bold",
    marginTop: 5,
  },
  serviceDetails: {
    marginTop: 10,
    backgroundColor: "#f0f8ff",
    borderRadius: 10,
    padding: 10,
    width: "100%",
  },
  detailText: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
    textAlign: "left",
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
});
