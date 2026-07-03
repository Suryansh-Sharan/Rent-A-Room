export type RequestStatus = 'pending' | 'accepted' | 'rejected' | 'withdrawn';

export interface RentRequest {
  id: string;
  tenantId: string;
  tenantName: string;
  tenantAvatar: string;
  ownerId: string;
  ownerName: string;
  roomId: string;
  roomTitle: string;
  roomImage: string;
  roomLocation: string;
  rent: number;
  status: RequestStatus;
  createdAt: string;
  updatedAt: string;
  message?: string;
  ownerNote?: string;
  compatibilityScore?: number;
}

export const mockRequests: RentRequest[] = [
  {
    id: 'req1',
    tenantId: 'u1',
    tenantName: 'Aryan Singh',
    tenantAvatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg',
    ownerId: 'u2',
    ownerName: 'Rajesh Malhotra',
    roomId: 'r1',
    roomTitle: 'Luxury Studio in Bandra West',
    roomImage: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg',
    roomLocation: 'Bandra West, Mumbai',
    rent: 45000,
    status: 'accepted',
    createdAt: '2026-06-28T10:00:00Z',
    updatedAt: '2026-07-01T14:00:00Z',
    message: 'I am a working professional and have been looking for a place in Bandra. I love the property!',
    ownerNote: 'Aryan seems like a great tenant. Schedule visit confirmed.',
    compatibilityScore: 94,
  },
  {
    id: 'req2',
    tenantId: 'u1',
    tenantName: 'Aryan Singh',
    tenantAvatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg',
    ownerId: 'u5',
    ownerName: 'Sunita Verma',
    roomId: 'r4',
    roomTitle: 'Quiet Double Room near IIT Delhi',
    roomImage: 'https://images.pexels.com/photos/2029667/pexels-photo-2029667.jpeg',
    roomLocation: 'Hauz Khas, Delhi',
    rent: 18000,
    status: 'pending',
    createdAt: '2026-07-01T09:00:00Z',
    updatedAt: '2026-07-01T09:00:00Z',
    message: 'I am a software engineer who values a quiet working environment. This room looks perfect.',
    compatibilityScore: 91,
  },
  {
    id: 'req3',
    tenantId: 'u1',
    tenantName: 'Aryan Singh',
    tenantAvatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg',
    ownerId: 'u6',
    ownerName: 'Karan Mehta',
    roomId: 'r5',
    roomTitle: 'Shared Premium Flat in HSR Layout',
    roomImage: 'https://images.pexels.com/photos/1918291/pexels-photo-1918291.jpeg',
    roomLocation: 'HSR Layout, Bangalore',
    rent: 15000,
    status: 'rejected',
    createdAt: '2026-06-20T10:00:00Z',
    updatedAt: '2026-06-22T16:00:00Z',
    message: 'Interested in the shared flat.',
    ownerNote: 'All rooms currently filled. Will notify when vacancy opens.',
    compatibilityScore: 82,
  },
  {
    id: 'req4',
    tenantId: 'u9',
    tenantName: 'Neha Patel',
    tenantAvatar: 'https://images.pexels.com/photos/1181519/pexels-photo-1181519.jpeg',
    ownerId: 'u2',
    ownerName: 'Rajesh Malhotra',
    roomId: 'r1',
    roomTitle: 'Luxury Studio in Bandra West',
    roomImage: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg',
    roomLocation: 'Bandra West, Mumbai',
    rent: 45000,
    status: 'pending',
    createdAt: '2026-07-02T12:00:00Z',
    updatedAt: '2026-07-02T12:00:00Z',
    message: 'MBA student here, very interested in the studio. I work quietly and keep the space clean.',
    compatibilityScore: 78,
  },
  {
    id: 'req5',
    tenantId: 'u10',
    tenantName: 'Vivek Nair',
    tenantAvatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg',
    ownerId: 'u3',
    ownerName: 'Priya Sharma',
    roomId: 'r2',
    roomTitle: 'Modern 1BHK near Koramangala',
    roomImage: 'https://images.pexels.com/photos/1643384/pexels-photo-1643384.jpeg',
    roomLocation: 'Koramangala, Bangalore',
    rent: 28000,
    status: 'pending',
    createdAt: '2026-07-03T07:00:00Z',
    updatedAt: '2026-07-03T07:00:00Z',
    message: 'Data scientist, love cooking. Looking to move in ASAP.',
    compatibilityScore: 85,
  },
];
