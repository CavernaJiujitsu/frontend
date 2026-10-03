import { create } from 'zustand';
import type * as Location from 'expo-location';

interface AppState {
  user: {
    location: Location.LocationObject | null;
    locationPermissionGranted: boolean;
    profile: { nome: string; email: string } | null;
  };
  setUserLocation: (location: Location.LocationObject) => void;
  setLocationPermissionGranted: (granted: boolean) => void;
  setProfile: (profile: { nome: string; email: string }) => void;
  resetUser: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: {
    location: null,
    locationPermissionGranted: false,
    profile: null,
  },
  setUserLocation: (location) =>
    set((state) => ({
      user: { ...state.user, location },
    })),
  setLocationPermissionGranted: (granted) =>
    set((state) => ({
      user: { ...state.user, locationPermissionGranted: granted },
    })),
  setProfile: (profile) =>
    set((state) => ({
      user: { ...state.user, profile },
    })),
  resetUser: () =>
    set({
      user: {
        location: null,
        locationPermissionGranted: false,
        profile: null,
      },
    }),
}));
