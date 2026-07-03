export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  timestamp: string;
  read: boolean;
  type: 'text' | 'image' | 'system';
}

export interface Conversation {
  id: string;
  participantIds: string[];
  participantNames: string[];
  participantAvatars: string[];
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  roomId?: string;
  roomTitle?: string;
  online: boolean;
}

export const mockConversations: Conversation[] = [
  {
    id: 'c1',
    participantIds: ['u1', 'u2'],
    participantNames: ['Aryan Singh', 'Rajesh Malhotra'],
    participantAvatars: [
      'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg',
      'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg',
    ],
    lastMessage: 'Sure, you can visit the property this Saturday at 11 AM.',
    lastMessageTime: '2026-07-03T10:30:00Z',
    unreadCount: 2,
    roomId: 'r1',
    roomTitle: 'Luxury Studio in Bandra West',
    online: true,
  },
  {
    id: 'c2',
    participantIds: ['u1', 'u3'],
    participantNames: ['Aryan Singh', 'Priya Sharma'],
    participantAvatars: [
      'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg',
      'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg',
    ],
    lastMessage: 'The apartment is available from July 1st.',
    lastMessageTime: '2026-07-02T18:45:00Z',
    unreadCount: 0,
    roomId: 'r2',
    roomTitle: 'Modern 1BHK near Koramangala',
    online: false,
  },
  {
    id: 'c3',
    participantIds: ['u1', 'u5'],
    participantNames: ['Aryan Singh', 'Sunita Verma'],
    participantAvatars: [
      'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg',
      'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg',
    ],
    lastMessage: 'I have attached my ID proof for verification.',
    lastMessageTime: '2026-07-01T09:00:00Z',
    unreadCount: 1,
    roomId: 'r4',
    roomTitle: 'Quiet Double Room near IIT Delhi',
    online: false,
  },
];

export const mockMessages: Record<string, Message[]> = {
  c1: [
    { id: 'm1', conversationId: 'c1', senderId: 'u1', content: 'Hi, I saw your listing for the studio in Bandra. I am very interested!', timestamp: '2026-07-03T09:00:00Z', read: true, type: 'text' },
    { id: 'm2', conversationId: 'c1', senderId: 'u2', content: 'Hello Aryan! Thank you for reaching out. The studio is still available. Would you like to know more?', timestamp: '2026-07-03T09:05:00Z', read: true, type: 'text' },
    { id: 'm3', conversationId: 'c1', senderId: 'u1', content: 'Yes, please. What is the security deposit? Also, is parking included?', timestamp: '2026-07-03T09:10:00Z', read: true, type: 'text' },
    { id: 'm4', conversationId: 'c1', senderId: 'u2', content: 'The security deposit is 2 months rent — ₹90,000. Parking for one car is included in the rent. The studio comes fully furnished with a modular kitchen and premium appliances.', timestamp: '2026-07-03T09:15:00Z', read: true, type: 'text' },
    { id: 'm5', conversationId: 'c1', senderId: 'u1', content: 'That sounds great! Can we schedule a visit to see the property?', timestamp: '2026-07-03T09:20:00Z', read: true, type: 'text' },
    { id: 'm6', conversationId: 'c1', senderId: 'u2', content: 'Sure, you can visit the property this Saturday at 11 AM.', timestamp: '2026-07-03T10:30:00Z', read: false, type: 'text' },
    { id: 'm7', conversationId: 'c1', senderId: 'u2', content: 'Here is the address: Flat 8B, Sea Breeze Towers, Bandra West. Let me know if you need directions.', timestamp: '2026-07-03T10:31:00Z', read: false, type: 'text' },
  ],
  c2: [
    { id: 'm8', conversationId: 'c2', senderId: 'u1', content: 'Hi Priya, is the 1BHK in Koramangala still available?', timestamp: '2026-07-02T17:00:00Z', read: true, type: 'text' },
    { id: 'm9', conversationId: 'c2', senderId: 'u3', content: 'Yes it is! Looking for a tenant from July itself.', timestamp: '2026-07-02T17:30:00Z', read: true, type: 'text' },
    { id: 'm10', conversationId: 'c2', senderId: 'u1', content: 'What is the earliest move-in date?', timestamp: '2026-07-02T18:00:00Z', read: true, type: 'text' },
    { id: 'm11', conversationId: 'c2', senderId: 'u3', content: 'The apartment is available from July 1st.', timestamp: '2026-07-02T18:45:00Z', read: true, type: 'text' },
  ],
  c3: [
    { id: 'm12', conversationId: 'c3', senderId: 'u1', content: 'Hello, I am interested in the double room near IIT Delhi.', timestamp: '2026-07-01T08:00:00Z', read: true, type: 'text' },
    { id: 'm13', conversationId: 'c3', senderId: 'u5', content: 'Welcome! I prefer students or working professionals. Can you tell me a bit about yourself?', timestamp: '2026-07-01T08:30:00Z', read: true, type: 'text' },
    { id: 'm14', conversationId: 'c3', senderId: 'u1', content: 'I have attached my ID proof for verification.', timestamp: '2026-07-01T09:00:00Z', read: false, type: 'text' },
  ],
};
