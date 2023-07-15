// Animal Shelters
// Pet Breeders
// Pet Burial Services
// Dog Walking
// Pet Grooming
// Pet Supplies and Accessories
// Pet Art and Crafts
// Pet Photography
// Pet Boarding
// Pet Friendly Accommodation
// Pet Insurance and Legal Services
// Cat Cafe
// Pet Search and Rescue Services
// Pet Sitting
// Pet Training
// Pet Transportation
// Pet Expo
// Veterinary Services
// Other Services

// db.getCollection("services").insertMany([
//     {
//         name: "Pet Sitting",
//         description: "Professional pet sitting services for your beloved pets.",
//         icon: "pet-sitting-icon.png",
//       },
//       {
//         name: "Pet Training",
//         description: "Expert pet training services to teach your pets new skills.",
//         icon: "pet-training-icon.png",
//       },
//       // Add more service objects here...

// ])

db.getCollection('services').insertMany([
  {
    name: 'Animal Shelters',
    description: 'Dedicated shelters that provide temporary homes and care for abandoned or stray animals until they can be adopted.',
    icon: 'animal-shelters-icon.png',
  },
  {
    name: 'Pet Breeders',
    description: 'Professional breeders who selectively breed and raise specific breeds or types of pets.',
    icon: 'pet-breeders-icon.png',
  },
  {
    name: 'Pet Burial Services',
    description: 'Services that offer respectful and compassionate handling of pet burials and cremations.',
    icon: 'pet-burial-services-icon.png',
  },
  {
    name: 'Dog Walking',
    description: 'Professional dog walkers who provide exercise and companionship for dogs during regular walks.',
    icon: 'dog-walking-icon.png',
  },
  {
    name: 'Pet Grooming',
    description: 'Services that offer grooming, bathing, and styling for pets to keep them clean and well-groomed.',
    icon: 'pet-grooming-icon.png',
  },
  {
    name: 'Pet Supplies and Accessories',
    description: 'Stores or services that provide a wide range of pet supplies, including food, toys, and accessories.',
    icon: 'pet-supplies-and-accessories-icon.png',
  },
  {
    name: 'Pet Art and Crafts',
    description: 'Artists or businesses that create artwork and crafts inspired by pets, such as portraits, sculptures, or customized pet accessories.',
    icon: 'pet-art-and-crafts-icon.png',
  },
  {
    name: 'Pet Photography',
    description: 'Professional photographers specializing in capturing beautiful and memorable images of pets.',
    icon: 'pet-photography-icon.png',
  },
  {
    name: 'Pet Boarding',
    description: 'Facilities or services that offer temporary boarding and care for pets when their owners are away.',
    icon: 'pet-boarding-icon.png',
  },
  {
    name: 'Pet Friendly Accommodation',
    description: 'Hotels, vacation rentals, or accommodations that welcome pets and provide suitable amenities and services for them.',
    icon: 'pet-friendly-accommodation-icon.png',
  },
  {
    name: 'Pet Insurance and Legal Services',
    description: 'Services that provide insurance coverage for pets and legal assistance related to pet ownership and welfare.',
    icon: 'pet-insurance-and-legal-services-icon.png',
  },
  {
    name: 'Cat Cafe',
    description: 'Cafes or establishments where customers can enjoy a beverage and interact with resident cats in a relaxed environment.',
    icon: 'cat-cafe-icon.png',
  },
  {
    name: 'Pet Search and Rescue Services',
    description: 'Organizations or services dedicated to locating and rescuing lost or missing pets.',
    icon: 'pet-search-and-rescue-services-icon.png',
  },
  {
    name: 'Pet Sitting',
    description: 'Professional pet sitters who offer in-home care and companionship for pets when their owners are away.',
    icon: 'pet-sitting-icon.png',
  },
  {
    name: 'Pet Training',
    description: 'Training programs and services to help pets develop good behavior, obedience, and social skills.',
    icon: 'pet-training-icon.png',
  },
  {
    name: 'Pet Transportation',
    description: 'Specialized transportation services for pets, including pet taxi, relocation, and safe travel arrangements.',
    icon: 'pet-transportation-icon.png',
  },
  {
    name: 'Pet Expo',
    description: 'Exhibitions and events dedicated to showcasing various pet-related products, services, and activities.',
    icon: 'pet-expo-icon.png',
  },
  {
    name: 'Veterinary Services',
    description: 'Medical care, health services, and treatments provided by licensed veterinarians for pets.',
    icon: 'veterinary-services-icon.png',
  },
  {
    name: 'Other Services',
    description: 'A category that includes services not specifically mentioned, covering a range of additional pet-related offerings.',
    icon: 'other-services-icon.png',
  },
]);

db.getCollection('services').insertMany([
  {
    serviceId: 1,
    name: 'Animal Shelters',
    description: 'Dedicated shelters that provide temporary homes and care for abandoned or stray animals until they can be adopted.',
    icon: 'animal-shelters-icon',
  },
  {
    serviceId: 2,
    name: 'Cat Cafe',
    description: 'Cafes or establishments where customers can enjoy a beverage and interact with resident cats in a relaxed environment.',
    icon: 'cat-cafe-icon',
  },
  {
    serviceId: 3,
    name: 'Dog Walking',
    description: 'Professional dog walkers who provide exercise and companionship for dogs during regular walks.',
    icon: 'dog-walking-icon',
  },
  {
    serviceId: 4,
    name: 'Pet Art',
    description: 'Artists or businesses that create customized portraits and crafts inspired by pets.',
    icon: 'pet-art-icon',
  },
  {
    serviceId: 5,
    name: 'Pet Boarding',
    description: 'Facilities or services that offer temporary boarding and care for pets when their owners are away.',
    icon: 'pet-boarding-icon',
  },
  {
    serviceId: 6,
    name: 'Pet Burial Services',
    description: 'Services that offer respectful and compassionate handling of pet burials and cremations.',
    icon: 'pet-burial-services-icon',
  },
  {
    serviceId: 7,
    name: 'Pet Expo',
    description: 'Exhibitions and events dedicated to showcasing various pet-related products, services, and activities.',
    icon: 'pet-expo-icon',
  },
  {
    serviceId: 8,
    name: 'Pet Friendly Accommodation',
    description: 'Hotels, vacation rentals, or accommodations that welcome pets and provide suitable amenities and services for them.',
    icon: 'pet-friendly-accommodation-icon',
  },
  {
    serviceId: 9,
    name: 'Pet Friendly Restaurants',
    description: 'Enjoy dining with your pets at these welcoming establishments.',
    icon: 'pet-friendly-restaurants-icon',
  },
  {
    serviceId: 10,
    name: 'Pet Grooming',
    description: 'Services that offer grooming, bathing, and styling for pets to keep them clean and well-groomed.',
    icon: 'pet-grooming-icon',
  },
  {
    serviceId: 11,
    name: 'Pet Photography',
    description: 'Professional photographers specializing in capturing beautiful and memorable images of pets.',
    icon: 'pet-photography-icon',
  },
  {
    serviceId: 12,
    name: 'Pet Rescue',
    description: 'Organizations or services dedicated to rescuing lost or injured pets.',
    icon: 'pet-rescue-icon',
  },
  {
    serviceId: 13,
    name: 'Pet Search',
    description: 'Organizations or services dedicated to locating lost or missing pets.',
    icon: 'pet-search-icon',
  },
  {
    serviceId: 14,
    name: 'Pet Sitting',
    description: 'Professional pet sitters who offer in-home care and companionship for pets when their owners are away.',
    icon: 'pet-sitting-icon',
  },
  {
    serviceId: 15,
    name: 'Pet Supplies',
    description: 'Stores or services that provide a wide range of pet supplies, including food, toys, and accessories.',
    icon: 'pet-supplies-icon',
  },
  {
    serviceId: 16,
    name: 'Pet Training',
    description: 'Training programs and services to help pets develop good behavior, obedience, and social skills.',
    icon: 'pet-training-icon',
  },
  {
    serviceId: 17,
    name: 'Pet Transportation',
    description: 'Specialized transportation services for pets, including pet taxi, relocation, and safe travel arrangements.',
    icon: 'pet-transportation-icon',
  },
  {
    serviceId: 18,
    name: 'Veterinary Services',
    description: 'Medical care, health services, and treatments provided by licensed veterinarians for pets.',
    icon: 'veterinary-services-icon',
  },
  {
    serviceId: 19,
    name: 'Pet Insurance',
    description: 'Insurance coverage for pets to help with medical expenses and emergencies.',
    icon: 'pet-insurance-icon',
  },
  {
    serviceId: 20,
    name: 'Legal Services',
    description: 'Legal assistance related to pet ownership, contracts, and disputes.',
    icon: 'legal-services-icon',
  },
]);
