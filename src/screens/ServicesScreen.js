import { useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Image } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { SafeAreaProvider } from "react-native-safe-area-context"

export default function ServicesScreen({ navigation }) {
  const [selectedService, setSelectedService] = useState(null)
  const [expandedServices, setExpandedServices] = useState({})

  const handleServicePress = (serviceId) => {
    setSelectedService(serviceId)
    
    // Toggle expanded state for services that have additional details
    if (serviceId === "denture" || serviceId === "dental_crown") {
      setExpandedServices(prev => ({
        ...prev,
        [serviceId]: !prev[serviceId]
      }))
    }
    
    console.log("Service selected:", serviceId)
  }

  const handleBackPress = () => {
    if (navigation) {
      navigation.goBack()
    } else {
      console.log("Navigate back")
    }
  }

  const services = [
    {
      id: "consultation",
      name: "Dental Consultation",
      image: require("../../assets/ServicesScreen/Consulation.png") // Replace with your image
    },
    {
      id: "prophylaxis",
      name: "Oral Prophylaxis (Cleaning)",
      image: require("../../assets/ServicesScreen/Oral.png") // Replace with your image
    },
    {
      id: "dental_filling",
      name: "Dental Filling (Pasta)",
      image: require("../../assets/ServicesScreen/image 41.png") // Replace with your image
    },
    {
      id: "fluoride",
      name: "Fluoride Varnish",
      image: require("../../assets/ServicesScreen/image 37.png") // Replace with your image
    },
    {
      id: "pit_fissure",
      name: "Pit and Fissure Sealant",
      image: require("../../assets/ServicesScreen/image 35.png") // Replace with your image
    },
    {
      id: "root_canal",
      name: "Root Canal Treatment",
      image: require("../../assets/ServicesScreen/Root.png") // Replace with your image
    },
    {
      id: "tooth_extraction",
      name: "Tooth Extraction (Odontectomy)",
      image: require("../../assets/ServicesScreen/image 32.png") // Replace with your image
    },
    {
      id: "orthodontics",
      name: "Orthodontics Braces",
      image: require("../../assets/profile/image 54.png") // Replace with your image
    },
    {
      id: "teeth_whitening",
      name: "Teeth Whitening",
      image: require("../../assets/profile/image 45.png") // Replace with your image
    },
    {
      id: "gingivectomy",
      name: "Gingivectomy",
      image: require("../../assets/ServicesScreen/image 43.png") // Replace with your image
    },
    {
      id: "frenectomy",
      name: "Frenectomy",
      image: require("../../assets/ServicesScreen/image 42.png") // Replace with your image
    },
    {
      id: "denture",
      name: "Denture",
      image: require("../../assets/ServicesScreen/image 38.png"), // Replace with your image
      details: [
        "• Partial/Metal",
        "• Complete",
        "• Soft Liner",
        "• Complete denture and etc."
      ]
    },
    {
      id: "dental_crown",
      name: "Dental Crown",
      image: require("../../assets/ServicesScreen/image 44.png"), // Replace with your image
      details: [
        "• Jacket Crown",
        "• PFM Crown",
        "• All Ceramic",
        "• Zirconia Crown",
        "• Second Crown"
      ]
    }
  ]

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

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.servicesGrid}>
            {services.map((service, index) => (
              <View key={service.id} style={styles.serviceWrapper}>
                <TouchableOpacity
                  style={[
                    styles.serviceCard,
                    selectedService === service.id && styles.serviceCardActive
                  ]}
                  onPress={() => handleServicePress(service.id)}
                >
                  <Image
                    source={service.image}
                    style={styles.serviceImage}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
                <Text style={styles.serviceName}>{service.name}</Text>
                
                {/* Show details for expanded services */}
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
      </SafeAreaView>
    </SafeAreaProvider>
  )
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
    paddingTop: 50,
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
    backgroundColor: "#3F8FBA",
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: 120,
    shadowColor: "#bdb9b9ff",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  serviceCardActive: {
    borderWidth: 2,
    borderColor: "#4A90E2",
  },
  serviceImage: {
    width: 50,
    height: 50,
  },
  serviceName: {
    marginTop: 10,
    fontSize: 14,
    color: "#333",
    textAlign: "center",
    fontWeight: "600",
    lineHeight: 18,
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
})