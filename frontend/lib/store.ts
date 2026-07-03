'use client';

import { create } from 'zustand';
import { mockUsers, User } from '@/lib/mock/users';
import { mockNotifications, Notification } from '@/lib/mock/notifications';
import { mockRooms, Room } from '@/lib/mock/rooms';
import { mockRequests, RentRequest } from '@/lib/mock/requests';

interface AppState {
  currentUser: User | null;
  currentRole: 'tenant' | 'owner' | 'admin';
  notifications: Notification[];
  savedRooms: string[];
  rooms: Room[];
  requests: RentRequest[];
  sidebarOpen: boolean;
  ownerListings: Room[];

  setCurrentUser: (user: User | null) => void;
  setCurrentRole: (role: 'tenant' | 'owner' | 'admin') => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  toggleSaveRoom: (roomId: string) => void;
  setSidebarOpen: (open: boolean) => void;
  login: (role: 'tenant' | 'owner' | 'admin') => void;
  loginWithEmail: (email: string, password: string) => Promise<User>;
  registerWithEmail: (data: any) => Promise<User>;
  logout: () => void;
  logoutUser: () => void;
  checkAuth: () => Promise<void>;
  fetchOwnerListings: () => Promise<void>;
  createListing: (formData: any) => Promise<Room>;
  uploadListingImage: (file: File) => Promise<string>;
  fetchRooms: (city?: string) => Promise<void>;
  fetchRequests: () => Promise<void>;
  submitRequest: (roomId: string, message: string) => Promise<void>;
  updateRequestStatus: (id: string, status: string, note?: string) => Promise<void>;
  updateProfile: (profileData: any) => Promise<User>;
}

export const useAppStore = create<AppState>((set) => ({
  currentUser: null, // Start as null for actual backend authentication
  currentRole: 'tenant',
  notifications: mockNotifications,
  savedRooms: ['r1', 'r3'],
  rooms: mockRooms,
  requests: mockRequests,
  sidebarOpen: false,

  setCurrentUser: (user) => set({ currentUser: user }),
  setCurrentRole: (role) => set({ currentRole: role }),

  markNotificationRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    })),

  markAllNotificationsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    })),

  toggleSaveRoom: (roomId) =>
    set((state) => ({
      savedRooms: state.savedRooms.includes(roomId)
        ? state.savedRooms.filter((id) => id !== roomId)
        : [...state.savedRooms, roomId],
    })),

  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  login: (role) => {
    set((state) => {
      // If the current user is an admin, let them change active view role without changing the user object
      if (state.currentUser?.role === 'admin') {
        return { currentRole: role };
      }
      // Fallback for demo/mock behavior
      const roleUserMap = { tenant: 'u1', owner: 'u2', admin: 'u8' };
      const user = mockUsers.find((u) => u.id === roleUserMap[role]) || null;
      return { currentUser: user, currentRole: role };
    });
  },

  loginWithEmail: async (email, password) => {
    const response = await fetch('http://localhost:8000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Login failed');
    }

    const data = await response.json();
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', data.access_token);
    }
    set({ currentUser: data.user, currentRole: data.user.role });
    return data.user;
  },

  registerWithEmail: async (registerData) => {
    const response = await fetch('http://localhost:8000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(registerData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Registration failed');
    }

    const user = await response.json();
    
    // Automatically log the user in after registration
    const loginResponse = await fetch('http://localhost:8000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: registerData.email, password: registerData.password }),
    });

    if (loginResponse.ok) {
      const data = await loginResponse.json();
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', data.access_token);
      }
      set({ currentUser: data.user, currentRole: data.user.role });
    }
    return user;
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
    set({ currentUser: null });
  },

  logoutUser: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
    set({ currentUser: null });
  },

  checkAuth: async () => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('token');
    if (!token) {
      set({ currentUser: null });
      return;
    }
    try {
      const res = await fetch('http://localhost:8000/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const user = await res.json();
        set({ currentUser: user, currentRole: user.role });
      } else {
        localStorage.removeItem('token');
        set({ currentUser: null });
      }
    } catch (e) {
      console.error("Auth check failed:", e);
      // Don't clear token on network error to allow retrying, but set currentUser null
      set({ currentUser: null });
    }
  },

  ownerListings: [],

  fetchOwnerListings: async () => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch('http://localhost:8000/api/rooms/owner', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        set({ ownerListings: data });
      } else {
        console.error("Failed to fetch owner listings");
      }
    } catch (e) {
      console.error("Error fetching owner listings:", e);
    }
  },

  createListing: async (formData) => {
    if (typeof window === 'undefined') throw new Error("No client environment found");
    const token = localStorage.getItem('token');
    if (!token) throw new Error("Not authenticated");
    
    const res = await fetch('http://localhost:8000/api/rooms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(formData)
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Failed to create listing');
    }

    const newRoom = await res.json();
    set((state) => ({
      ownerListings: [newRoom, ...state.ownerListings],
      rooms: [newRoom, ...state.rooms]
    }));
    return newRoom;
  },

  uploadListingImage: async (file) => {
    if (typeof window === 'undefined') throw new Error("No client environment found");
    const token = localStorage.getItem('token');
    if (!token) throw new Error("Not authenticated");

    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('http://localhost:8000/api/rooms/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Failed to upload image');
    }

    const data = await res.json();
    return data.url;
  },

  fetchRooms: async (city) => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      let url = 'http://localhost:8000/api/rooms';
      if (city && city.trim() !== '') {
        url += `?city=${encodeURIComponent(city.trim())}`;
      }
      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        set({ rooms: data });
      } else {
        console.error("Failed to fetch rooms");
      }
    } catch (e) {
      console.error("Error fetching rooms:", e);
    }
  },

  fetchRequests: async () => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const role = useAppStore.getState().currentRole;
      const endpoint = role === 'tenant' ? 'tenant' : 'owner';
      const res = await fetch(`http://localhost:8000/api/requests/${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        set({ requests: data });
      } else {
        console.error("Failed to fetch requests");
      }
    } catch (e) {
      console.error("Error fetching requests:", e);
    }
  },

  submitRequest: async (roomId, message) => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('token');
    if (!token) throw new Error("Not authenticated");
    const res = await fetch('http://localhost:8000/api/requests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ roomId, message })
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || "Failed to submit interest request.");
    }
    const newRequest = await res.json();
    set((state) => ({
      requests: [newRequest, ...state.requests]
    }));
  },

  updateRequestStatus: async (id, status, note) => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('token');
    if (!token) throw new Error("Not authenticated");
    const res = await fetch(`http://localhost:8000/api/requests/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status, ownerNote: note })
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || "Failed to update request status.");
    }
    const updatedRequest = await res.json();
    set((state) => ({
      requests: state.requests.map((r) => r.id === id ? updatedRequest : r)
    }));
  },

  updateProfile: async (profileData) => {
    if (typeof window === 'undefined') throw new Error("No client environment found");
    const token = localStorage.getItem('token');
    if (!token) throw new Error("Not authenticated");

    const res = await fetch('http://localhost:8000/api/auth/me', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(profileData)
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || "Failed to update profile");
    }

    const updatedUser = await res.json();
    set({ currentUser: updatedUser });
    return updatedUser;
  }
}));
