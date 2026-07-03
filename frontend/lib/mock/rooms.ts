export type RoomType = 'single' | 'double' | 'studio' | 'shared' | 'penthouse';
export type FurnishingType = 'furnished' | 'semi-furnished' | 'unfurnished';
export type ListingStatus = 'active' | 'filled' | 'pending' | 'inactive';

export interface Room {
  id: string;
  title: string;
  description: string;
  rent: number;
  deposit: number;
  location: string;
  city: string;
  area: string;
  roomType: RoomType;
  furnishing: FurnishingType;
  images: string[];
  availableFrom: string;
  amenities: string[];
  ownerId: string;
  ownerName: string;
  ownerAvatar: string;
  ownerRating: number;
  compatibilityScore?: number;
  status: ListingStatus;
  postedDate: string;
  views: number;
  saves: number;
  coordinates: { lat: number; lng: number };
  floorArea: number;
  floor: number;
  totalFloors: number;
  highlights: string[];
}

export const mockRooms: Room[] = [
  {
    id: 'r1',
    title: 'Luxury Studio in Bandra West',
    description: 'A premium fully furnished studio apartment with stunning sea views, high-end appliances, and premium finishes throughout. Perfect for working professionals seeking comfort and style in the heart of Mumbai.',
    rent: 45000,
    deposit: 90000,
    location: 'Bandra West, Mumbai',
    city: 'Mumbai',
    area: 'Bandra West',
    roomType: 'studio',
    furnishing: 'furnished',
    images: [
      'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg',
      'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg',
      'https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg',
      'https://images.pexels.com/photos/1648776/pexels-photo-1648776.jpeg',
    ],
    availableFrom: '2026-07-15',
    amenities: ['WiFi', 'Parking', 'Balcony', 'Kitchen', 'Attached Bathroom', 'Laundry', 'Sunlight', 'Near Metro'],
    ownerId: 'u2',
    ownerName: 'Rajesh Malhotra',
    ownerAvatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg',
    ownerRating: 4.8,
    compatibilityScore: 94,
    status: 'active',
    postedDate: '2026-06-20',
    views: 342,
    saves: 28,
    coordinates: { lat: 19.0596, lng: 72.8295 },
    floorArea: 650,
    floor: 8,
    totalFloors: 15,
    highlights: ['Sea View', 'Premium Finishes', 'Smart Home'],
  },
  {
    id: 'r2',
    title: 'Modern 1BHK near Koramangala',
    description: 'Spacious 1BHK in the heart of Koramangala with premium amenities, ideal for tech professionals. Walking distance to major IT parks and excellent cafes and restaurants.',
    rent: 28000,
    deposit: 56000,
    location: 'Koramangala, Bangalore',
    city: 'Bangalore',
    area: 'Koramangala',
    roomType: 'single',
    furnishing: 'semi-furnished',
    images: [
      'https://images.pexels.com/photos/1643384/pexels-photo-1643384.jpeg',
      'https://images.pexels.com/photos/2062431/pexels-photo-2062431.jpeg',
      'https://images.pexels.com/photos/1454806/pexels-photo-1454806.jpeg',
    ],
    availableFrom: '2026-07-01',
    amenities: ['WiFi', 'Kitchen', 'Attached Bathroom', 'Study Friendly', 'Non Smoking', 'Near Metro'],
    ownerId: 'u3',
    ownerName: 'Priya Sharma',
    ownerAvatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg',
    ownerRating: 4.6,
    compatibilityScore: 88,
    status: 'active',
    postedDate: '2026-06-18',
    views: 218,
    saves: 19,
    coordinates: { lat: 12.9352, lng: 77.6245 },
    floorArea: 750,
    floor: 3,
    totalFloors: 6,
    highlights: ['Tech Hub Location', 'Study Friendly', 'High Speed WiFi'],
  },
  {
    id: 'r3',
    title: 'Penthouse Room with Terrace - Juhu',
    description: 'Exclusive penthouse room with private terrace in the prestigious Juhu neighborhood. Unparalleled views, top-tier amenities and a vibrant social atmosphere.',
    rent: 65000,
    deposit: 130000,
    location: 'Juhu, Mumbai',
    city: 'Mumbai',
    area: 'Juhu',
    roomType: 'penthouse',
    furnishing: 'furnished',
    images: [
      'https://images.pexels.com/photos/2724749/pexels-photo-2724749.jpeg',
      'https://images.pexels.com/photos/1080696/pexels-photo-1080696.jpeg',
      'https://images.pexels.com/photos/2635038/pexels-photo-2635038.jpeg',
      'https://images.pexels.com/photos/1571468/pexels-photo-1571468.jpeg',
    ],
    availableFrom: '2026-08-01',
    amenities: ['WiFi', 'Parking', 'Balcony', 'Kitchen', 'Attached Bathroom', 'Laundry', 'Pet Friendly', 'Sunlight'],
    ownerId: 'u4',
    ownerName: 'Arjun Kapoor',
    ownerAvatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
    ownerRating: 4.9,
    compatibilityScore: 76,
    status: 'active',
    postedDate: '2026-06-22',
    views: 456,
    saves: 41,
    coordinates: { lat: 19.0948, lng: 72.8258 },
    floorArea: 1200,
    floor: 18,
    totalFloors: 18,
    highlights: ['Private Terrace', 'Beach View', 'Luxury Amenities'],
  },
  {
    id: 'r4',
    title: 'Quiet Double Room near IIT Delhi',
    description: 'Well-maintained double room in a peaceful residential colony near IIT Delhi. Perfect for students and researchers who value a quiet, focused environment.',
    rent: 18000,
    deposit: 36000,
    location: 'Hauz Khas, Delhi',
    city: 'Delhi',
    area: 'Hauz Khas',
    roomType: 'double',
    furnishing: 'semi-furnished',
    images: [
      'https://images.pexels.com/photos/2029667/pexels-photo-2029667.jpeg',
      'https://images.pexels.com/photos/1770775/pexels-photo-1770775.jpeg',
    ],
    availableFrom: '2026-07-10',
    amenities: ['WiFi', 'Study Friendly', 'Quiet Area', 'Near College', 'Vegetarian', 'Non Smoking'],
    ownerId: 'u5',
    ownerName: 'Sunita Verma',
    ownerAvatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg',
    ownerRating: 4.5,
    compatibilityScore: 91,
    status: 'active',
    postedDate: '2026-06-15',
    views: 187,
    saves: 22,
    coordinates: { lat: 28.5489, lng: 77.2066 },
    floorArea: 420,
    floor: 1,
    totalFloors: 3,
    highlights: ['Near IIT Delhi', 'Study Zone', 'Vegetarian Kitchen'],
  },
  {
    id: 'r5',
    title: 'Shared Premium Flat in HSR Layout',
    description: 'Premium shared accommodation in the trendy HSR Layout. You get a private room in a co-living style setup with shared common areas. Great community vibe.',
    rent: 15000,
    deposit: 30000,
    location: 'HSR Layout, Bangalore',
    city: 'Bangalore',
    area: 'HSR Layout',
    roomType: 'shared',
    furnishing: 'furnished',
    images: [
      'https://images.pexels.com/photos/1918291/pexels-photo-1918291.jpeg',
      'https://images.pexels.com/photos/2631746/pexels-photo-2631746.jpeg',
      'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg',
    ],
    availableFrom: '2026-07-05',
    amenities: ['WiFi', 'Kitchen', 'Laundry', 'Near Metro', 'Study Friendly', 'Non Smoking'],
    ownerId: 'u6',
    ownerName: 'Karan Mehta',
    ownerAvatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg',
    ownerRating: 4.3,
    compatibilityScore: 82,
    status: 'active',
    postedDate: '2026-06-25',
    views: 134,
    saves: 11,
    coordinates: { lat: 12.9081, lng: 77.6476 },
    floorArea: 300,
    floor: 2,
    totalFloors: 4,
    highlights: ['Co-living Vibes', 'Great Community', 'Metro Nearby'],
  },
  {
    id: 'r6',
    title: 'Heritage Apartment in Connaught Place',
    description: 'Classic heritage apartment in the iconic Connaught Place area. Blend of old-world charm and modern comforts. Unbeatable location in the heart of New Delhi.',
    rent: 35000,
    deposit: 70000,
    location: 'Connaught Place, Delhi',
    city: 'Delhi',
    area: 'Connaught Place',
    roomType: 'single',
    furnishing: 'furnished',
    images: [
      'https://images.pexels.com/photos/2089698/pexels-photo-2089698.jpeg',
      'https://images.pexels.com/photos/1428348/pexels-photo-1428348.jpeg',
      'https://images.pexels.com/photos/276583/pexels-photo-276583.jpeg',
    ],
    availableFrom: '2026-08-15',
    amenities: ['WiFi', 'Parking', 'Kitchen', 'Attached Bathroom', 'Near Metro', 'Sunlight'],
    ownerId: 'u7',
    ownerName: 'Ritu Agarwal',
    ownerAvatar: 'https://images.pexels.com/photos/1181424/pexels-photo-1181424.jpeg',
    ownerRating: 4.7,
    compatibilityScore: 79,
    status: 'active',
    postedDate: '2026-06-28',
    views: 290,
    saves: 33,
    coordinates: { lat: 28.6315, lng: 77.2167 },
    floorArea: 550,
    floor: 4,
    totalFloors: 5,
    highlights: ['Central Location', 'Heritage Building', 'Metro Access'],
  },
];

export const allAmenities = [
  'WiFi', 'Parking', 'Balcony', 'Kitchen', 'Laundry', 'Attached Bathroom',
  'Pet Friendly', 'Near College', 'Near Metro', 'Quiet Area', 'Study Friendly',
  'Vegetarian', 'Non Smoking', 'Sunlight',
];
