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
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaProvider } from "react-native-safe-area-context";

// Updated filter categories
const serviceCategories = [
  "All",
  "Preventive & General Care",
  "Restorative Care",
  "Cosmetic Dentistry",
  "Surgical Procedures",
  "Orthodontics & Specialties",
];

export default function ServicesScreen({ navigation }) {
  const [selectedService, setSelectedService] = useState(null);
  const [expandedServices, setExpandedServices] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filterCategory, setFilterCategory] = useState("All");
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showServiceDetailsModal, setShowServiceDetailsModal] = useState(false);
  const itemsPerPage = 6;

  const handleServicePress = (serviceId) => {
    setSelectedService(serviceId);
    console.log("Service selected:", serviceId);
    // Enable expansion for all services that have details
    const service = services.find(s => s.id === serviceId);
    if (service && service.details) {
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

  const services = [
    {
      id: "consultation",
      name: "Dental Consultation",
      description: "Full check-up of teeth, gums, and mouth with advice and treatment options.",
      image: require("../../assets/ServicesScreen/Consulation.png"),
      category: "Preventive & General Care",
      details: {
        whatItIs: "A comprehensive examination and discussion where we assess your oral health, listen to your concerns, and develop a tailored treatment plan.",
        bestFor: "Every new patient and anyone seeking professional advice on their dental health, pain, or options.",
        price: "₱500 - ₱1,000 (often waived if proceeding with treatment)"
      }
    },
    {
      id: "prophylaxis",
      name: "Oral Prophylaxis (Cleaning)",
      description: "Professional cleaning to remove buildup, keep your smile fresh, and prevent gum disease.",
      image: require("../../assets/ServicesScreen/atay.png"),
      category: "Preventive & General Care",
      details: {
        whatItIs: "A professional cleaning to remove hardened plaque (tartar), surface stains, and bacteria from above the gum line.",
        bestFor: "Everyone! Essential for preventing gum disease and cavities. Recommended every 6 months.",
        price: "₱1,500 - ₱2,500"
      }
    },
    {
      id: "dental_filling",
      name: "Dental Filling (Pasta)",
      description: "Tooth-colored fillings matched to your natural teeth for a seamless smile.",
      image: require("../../assets/ServicesScreen/image 41.png"),
      category: "Restorative Care",
      details: {
        whatItIs: "The removal of decayed tooth material and the filling of the cleaned cavity with a durable, tooth-colored composite material.",
        bestFor: "Treating cavities (tooth decay) and repairing minor tooth fractures.",
        price: "₱1,500 - ₱3,500 (depending on size)"
      }
    },
    {
      id: "fluoride",
      name: "Fluoride Varnish",
      description: "Fluoride varnish coats teeth to strengthen enamel and protect against cavities.",
      image: require("../../assets/ServicesScreen/image 37.png"),
      category: "Preventive & General Care",
      details: {
        whatItIs: "The application of a highly concentrated fluoride gel to the teeth to strengthen enamel and make it more resistant to decay.",
        bestFor: "Children, adults with a history of cavities, or those with sensitive teeth.",
        price: "₱300 - ₱800"
      }
    },
    {
      id: "pit_fissure",
      name: "Pit and Fissure Sealant",
      description: "Protective coating applied to molars to seal grooves and prevent cavities.",
      image: require("../../assets/ServicesScreen/pit.png"),
      category: "Preventive & General Care",
      details: {
        whatItIs: "A safe, plastic coating applied to the chewing surfaces of back teeth (molars) to seal deep grooves and prevent food and bacteria from getting stuck.",
        bestFor: "Children and teenagers as soon as their permanent molars come in. Also beneficial for adults with deep grooves.",
        price: "₱800 - ₱1,500 per tooth"
      }
    },
    {
      id: "root_canal",
      name: "Root Canal Treatment",
      description: "Root Canal Treatment removes an infected tooth nerve and seals it to prevent reinfection.",
      image: require("../../assets/ServicesScreen/Root.png"),
      category: "Restorative Care",
      details: {
        whatItIs: "A procedure to remove infected or inflamed pulp from inside the tooth, clean and disinfect the root canals, and then seal them to prevent future infection.",
        bestFor: "Teeth with deep decay, infection, or abscess. It relieves pain and saves the natural tooth.",
        price: "₱8,000 - ₱15,000 (per tooth, varies by tooth type)"
      }
    },
    {
      id: "tooth_extraction",
      name: "Tooth Extraction (Odontectomy)",
      description: "If you have a tooth that is damaged by trauma or decay, it may require extraction.",
      image: require("../../assets/ServicesScreen/image 32.png"),
      category: "Surgical Procedures",
      details: {
        whatItIs: "The careful removal of a tooth that is too damaged, decayed, or crowded to be saved.",
        bestFor: "Severely damaged teeth, wisdom teeth causing pain, or to prepare for braces.",
        price: "Simple Extraction: ₱1,500 - ₱2,500 | Surgical Extraction: ₱3,000+"
      }
    },
    {
      id: "orthodontics",
      name: "Orthodontics Braces",
      description: "Braces straighten misaligned teeth and correct bite issues, improving appearance and oral health.",
      image: require("../../assets/profile/image 54.png"),
      category: "Orthodontics & Specialties",
      details: {
        whatItIs: "The use of fixed or removable appliances (braces, wires, aligners) to correct crooked teeth, misaligned jaws, and bad bites (malocclusion).",
        bestFor: "Children and adults who want to improve their smile, oral function, and long-term dental health.",
        price: "₱50,000 - ₱150,000+ (depending on case complexity)"
      }
    },
    {
      id: "teeth_whitening",
      name: "Teeth Whitening",
      description: "A cosmetic treatment that lightens teeth and removes stains, giving you a whiter and more confident smile.",
      image: require("../../assets/profile/image 45.png"),
      category: "Cosmetic Dentistry",
      details: {
        whatItIs: "A safe and effective cosmetic procedure that uses bleaching agents to lighten the natural color of your teeth without removing any tooth surface.",
        bestFor: "Anyone looking to remove stains from food, drinks, or aging and achieve a brighter, more confident smile.",
        price: "₱8,000 - ₱15,000 (for in-office treatment)"
      }
    },
    {
      id: "gingivectomy",
      name: "Gingivectomy",
      description: "A minor surgery that removes excess or diseased gum tissue, improving gum health and smile appearance.",
      image: require("../../assets/ServicesScreen/image 43.png"),
      category: "Surgical Procedures",
      details: {
        whatItIs: "A surgical procedure to remove and reshape diseased or excess gum tissue (gingiva).",
        bestFor: "Treating advanced gum disease or correcting a 'gummy smile' for cosmetic purposes.",
        price: "₱5,000 - ₱15,000 (depending on area size)"
      }
    },
    {
      id: "frenectomy",
      name: "Frenectomy",
      description: "A minor surgery to correct tongue-tie or lip-tie, improving speech, eating, and orthodontic care.",
      image: require("../../assets/ServicesScreen/image 42.png"),
      category: "Surgical Procedures",
      details: {
        whatItIs: "A minor surgery to loosen or remove a small fold of tissue (frenum) that connects the lips, tongue, or cheeks to the jaw.",
        bestFor: "Correcting a tongue-tie in infants or children, or addressing gum recession or gap between teeth caused by a tight frenum.",
        price: "₱5,000 - ₱10,000"
      }
    },
    {
      id: "denture",
      name: "Denture",
      description: "Custom-made dentures replace missing teeth, restoring your smile and chewing function.",
      image: require("../../assets/ServicesScreen/image 38.png"),
      category: "Restorative Care",
      details: {
        whatItIs: "Custom-made removable replacements for missing teeth and surrounding tissues.",
        types: [
          "Partial Denture (Postiso): Replaces one or several missing teeth.",
          "Complete Denture: Replaces all teeth in an arch.",
          "Retainers: Maintains tooth position after braces."
        ],
        price: "₱15,000 - ₱45,000+ (varies greatly by type and materials)"
      }
    },
    {
      id: "dental_crown",
      name: "Dental Crown",
      description: "A crown is a cap that restores a damaged tooth's strength, function, and appearance.",
      image: require("../../assets/ServicesScreen/image 44.png"),
      category: "Restorative Care",
      details: {
        whatItIs: "A custom-made 'cap' that fits over a damaged tooth to restore its shape, size, strength, and appearance.",
        typesWeOffer: [
          "Jacket Crown: An affordable and aesthetic option.",
          "Porcelain Fused to Metal (PFM) Crown: Strong with a natural look.",
          "Zirconia Crown: The strongest and most natural-looking option."
        ],
        price: "₱8,000 - ₱20,000 (varies by material)"
      }
    },
    // Added new services for completeness based on your categories
    {
      id: "zirconia_crown",
      name: "Zirconia Crown",
      description: "Premium zirconia crowns offering superior strength and natural aesthetics.",
      image: require("../../assets/ServicesScreen/image 44.png"),
      category: "Cosmetic Dentistry",
      details: {
        whatItIs: "A premium dental crown made from zirconia, offering exceptional strength and natural tooth-like appearance.",
        bestFor: "Patients seeking the most durable and aesthetic crown option.",
        price: "₱15,000 - ₱25,000"
      }
    },
    {
      id: "jacket_crown",
      name: "Jacket Crown",
      description: "Affordable and aesthetic crown option for restoring damaged teeth.",
      image: require("../../assets/ServicesScreen/image 44.png"),
      category: "Cosmetic Dentistry",
      details: {
        whatItIs: "An affordable crown option that provides good aesthetics and function for damaged teeth.",
        bestFor: "Patients looking for an economical crown solution with good appearance.",
        price: "₱8,000 - ₱12,000"
      }
    },
    {
      id: "retainers",
      name: "Retainers",
      description: "Custom retainers to maintain tooth position after orthodontic treatment.",
      image: require("../../assets/profile/image 54.png"),
      category: "Orthodontics & Specialties",
      details: {
        whatItIs: "Custom-made appliances designed to maintain the position of teeth after braces or other orthodontic treatment.",
        bestFor: "Anyone who has completed orthodontic treatment to prevent teeth from shifting back.",
        price: "₱5,000 - ₱15,000"
      }
    },
  ];

  const filteredServices = useMemo(() => {
    return services
      .filter((service) => {
        const matchesSearch = service.name
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
        const matchesFilter =
          filterCategory === "All" || service.category === filterCategory;
        return matchesSearch && matchesFilter;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
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
          <View style={styles.servicesGrid}>
            {currentServices.map((service) => (
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
                      source={service.image}
                      style={styles.serviceImage}
                      resizeMode="contain"
                    />
                    <Text style={styles.serviceName}>{service.name}</Text>
                  </View>
                 
                  {/* View More button inside the card */}
                  <View style={styles.viewMoreButtonInside}>
                    <Text style={styles.viewMoreTextInside}>view more</Text>
                    <Ionicons name="chevron-forward" size={16} color="#1290D5" />
                  </View>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </ScrollView>

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
                  source={selectedServiceDetails.image}
                  style={styles.detailsModalImage}
                  resizeMode="contain"
                />
                <Text style={styles.detailsModalName}>
                  {selectedServiceDetails.name}
                </Text>
                <Text style={styles.detailsModalDescription}>
                  {selectedServiceDetails.description}
                </Text>

                {/* What it is section */}
                {selectedServiceDetails.details?.whatItIs && (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailSectionTitle}>What it is:</Text>
                    <Text style={styles.detailSectionText}>
                      {selectedServiceDetails.details.whatItIs}
                    </Text>
                  </View>
                )}

                {/* Best for section */}
                {selectedServiceDetails.details?.bestFor && (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailSectionTitle}>Best for:</Text>
                    <Text style={styles.detailSectionText}>
                      {selectedServiceDetails.details.bestFor}
                    </Text>
                  </View>
                )}

                {/* Types section (for services like dentures) */}
                {selectedServiceDetails.details?.types && (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailSectionTitle}>Types:</Text>
                    {selectedServiceDetails.details.types.map((type, index) => (
                      <Text key={index} style={styles.detailListItem}>
                        • {type}
                      </Text>
                    ))}
                  </View>
                )}

                {/* Types We Offer section (for crowns) */}
                {selectedServiceDetails.details?.typesWeOffer && (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailSectionTitle}>Types We Offer:</Text>
                    {selectedServiceDetails.details.typesWeOffer.map((type, index) => (
                      <Text key={index} style={styles.detailListItem}>
                        • {type}
                      </Text>
                    ))}
                  </View>
                )}

                {/* Price section */}
                {selectedServiceDetails.details?.price && (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailSectionTitle}>Price:</Text>
                    <Text style={styles.detailSectionText}>
                      {selectedServiceDetails.details.price}
                    </Text>
                  </View>
                )}
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
    height: 200,
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
    marginBottom: 5,
  },
  serviceName: {
    marginTop: 10,
    fontSize: 14,
    color: "#333",
    textAlign: "center",
    fontWeight: "bold",
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
  // Remove the old external view more button styles
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
  },
  modalDetailsList: {
    width: "100%",
    paddingLeft: 20,
    alignSelf: "flex-start",
  },
  modalDetailText: {
    fontSize: 14,
    color: "#333",
    marginBottom: 5,
    textAlign: "left",
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
  detailListItem: {
    fontSize: 14,
    color: "#333",
    marginBottom: 3,
    marginLeft: 10,
    lineHeight: 18,
  },
});