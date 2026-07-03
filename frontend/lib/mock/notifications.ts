export type NotificationType = 'success' | 'warning' | 'info' | 'error';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  link?: string;
}

export const mockNotifications: Notification[] = [
  {
    id: 'n1',
    type: 'success',
    title: 'Request Accepted!',
    message: 'Rajesh Malhotra has accepted your interest request for "Luxury Studio in Bandra West".',
    timestamp: '2026-07-03T08:00:00Z',
    read: false,
    link: '/tenant/requests',
  },
  {
    id: 'n2',
    type: 'success',
    title: 'Listing Published',
    message: 'Your listing "Modern 1BHK near Koramangala" is now live and visible to tenants.',
    timestamp: '2026-07-02T14:30:00Z',
    read: false,
    link: '/owner/listings',
  },
  {
    id: 'n3',
    type: 'info',
    title: 'New Interest Request',
    message: 'Aryan Singh has expressed interest in your listing "Luxury Studio in Bandra West".',
    timestamp: '2026-07-02T11:00:00Z',
    read: false,
    link: '/owner/requests',
  },
  {
    id: 'n4',
    type: 'warning',
    title: 'AI Service Notice',
    message: 'Compatibility AI service is temporarily unavailable. Showing rule-based compatibility scores.',
    timestamp: '2026-07-02T09:15:00Z',
    read: true,
  },
  {
    id: 'n5',
    type: 'success',
    title: 'Interest Sent',
    message: 'Your interest request for "Quiet Double Room near IIT Delhi" has been sent to the owner.',
    timestamp: '2026-07-01T16:00:00Z',
    read: true,
    link: '/tenant/requests',
  },
  {
    id: 'n6',
    type: 'error',
    title: 'Upload Failed',
    message: 'Image upload failed. Please check your internet connection and try again.',
    timestamp: '2026-06-30T12:45:00Z',
    read: true,
  },
  {
    id: 'n7',
    type: 'info',
    title: 'Profile Incomplete',
    message: 'Complete your profile to improve your compatibility matching with room owners.',
    timestamp: '2026-06-29T10:00:00Z',
    read: true,
    link: '/tenant/profile',
  },
  {
    id: 'n8',
    type: 'error',
    title: 'Network Error',
    message: 'Failed to load search results. Please check your connection.',
    timestamp: '2026-06-28T15:30:00Z',
    read: true,
  },
  {
    id: 'n9',
    type: 'warning',
    title: 'Session Expiring',
    message: 'Your session will expire in 30 minutes. Please save your work and re-login.',
    timestamp: '2026-06-27T18:00:00Z',
    read: true,
  },
  {
    id: 'n10',
    type: 'success',
    title: 'Account Verified',
    message: 'Your identity verification has been approved. You now have a verified badge.',
    timestamp: '2026-06-25T11:00:00Z',
    read: true,
    link: '/tenant/profile',
  },
];
