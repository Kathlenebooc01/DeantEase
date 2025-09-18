// addAllServices.js
// Create this file in your project folder and run it once

import { db } from './config/firebaseConfig'; // Adjust path if needed
import { collection, addDoc } from 'firebase/firestore';

const allServices = [
  {
    name: "Dental Consultation",
    description: "Full check-up of teeth, gums, and mouth with advice and treatment options.",
    price: "₱500",
    icon: "medkit-outline",
    order: 1,
    isActive: true,
    category: "consultation",
    localImage: "Consulation.png"
  },
  {
    name: "Oral Prophylaxis (Cleaning)",
    description: "Professional cleaning to remove buildup, keep your smile fresh, and prevent gum disease.",
    price: "₱800 - ₱2,500",
    icon: "sparkles-outline",
    order: 2,
    isActive: true,
    category: "cleaning",
    localImage: "Oral.png"
  },
  {
    name: "Dental Filling (Pasta)",
    description: "Tooth-colored fillings matched to your natural teeth for a seamless smile.",
    price: "₱1,000 - ₱2,500",
    icon: "cut-outline",
    order: 3,
    isActive: true,
    category: "restorative",
    localImage: "image 41.png"
  },
  {
    name: "Fluoride Varnish",
    description: "Fluoride varnish coats teeth to strengthen enamel and protect against cavities.",
    price: "₱500",
    icon: "shield-outline",
    order: 4,
    isActive: true,
    category: "preventive",
    localImage: "image 37.png"
  },
  {
    name: "Pit and Fissure Sealant",
    description: "Protective coating applied to molars to seal grooves and prevent cavities.",
    price: "₱500",
    icon: "shield-outline",
    order: 5,
    isActive: true,
    category: "preventive",
    localImage: "image 35.png"
  },
  {
    name: "Root Canal Treatment",
    description: "Root Canal Treatment removes an infected tooth nerve and seals it to prevent reinfection.",
    price: "₱500",
    icon: "pulse-outline",
    order: 6,
    isActive: true,
    category: "endodontic",
    localImage: "Root.png"
  },
  {
    name: "Tooth Extraction (Odontectomy)",
    description: "If you have a tooth that is damaged by trauma or decay, it may require extraction.",
    price: "₱500",
    icon: "flash-outline",
    order: 7,
    isActive: true,
    category: "surgical",
    localImage: "image 32.png"
  },
  {
    name: "Orthodontics Braces",
    description: "Braces straighten misaligned teeth and correct bite issues, improving appearance and oral health.",
    price: "₱500",
    icon: "grid-outline",
    order: 8,
    isActive: true,
    category: "orthodontic",
    localImage: "image 54.png"
  },
  {
    name: "Teeth Whitening",
    description: "A cosmetic treatment that lightens teeth and removes stains, giving you a whiter and more confident smile.",
    price: "₱500",
    icon: "color-palette-outline",
    order: 9,
    isActive: true,
    category: "cosmetic",
    localImage: "image 45.png"
  },
  {
    name: "Gingivectomy",
    description: "A minor surgery that removes excess or diseased gum tissue, improving gum health and smile appearance.",
    price: "₱500",
    icon: "bandage-outline",
    order: 10,
    isActive: true,
    category: "surgical",
    localImage: "image 43.png"
  },
  {
    name: "Fhahahomy",
    description: "A minor surgery to correct tongue-tie or lip-tie, improving speech, eating, and orthodontic care.",
    price: "₱500",
    icon: "medical-outline",
    order: 11,
    isActive: true,
    category: "surgical",
    localImage: "image 42.png"
  },
  {
    name: "Denture",
    description: "Custom-made dentures replace missing teeth, restoring your smile and chewing function.",
    price: "₱500",
    icon: "happy-outline",
    order: 12,
    isActive: true,
    category: "prosthetic",
    localImage: "image 38.png"
  },
  {
    name: "Dental Crown",
    description: "A crown is a cap that restores a damaged tooth's strength, function, and appearance.",
    price: "₱500",
    icon: "ellipse-outline",
    order: 13,
    isActive: true,
    category: "restorative",
    localImage: "image 44.png"
  }
];

const addAllServicesToFirebase = async () => {
  console.log('Adding all services to Firebase...');
  
  try {
    const servicesRef = collection(db, 'services');
    
    for (let i = 0; i < allServices.length; i++) {
      const service = allServices[i];
      console.log(`Adding service ${i + 1}/13: ${service.name}`);
      
      await addDoc(servicesRef, service);
    }
    
    console.log('✅ All 13 services added successfully!');
  } catch (error) {
    console.error('❌ Error adding services:', error);
  }
};

// Run this function
addAllServicesToFirebase();