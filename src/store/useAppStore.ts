import { create } from 'zustand';
import type * as Location from 'expo-location';

interface AppState {
  user: {
    location: Location.LocationObject | null;
    locationPermissionGranted: boolean;
  };
  setUserLocation: (location: Location.LocationObject) => void;
  setLocationPermissionGranted: (granted: boolean) => void;
  resetUser: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: {
    location: null,
    locationPermissionGranted: false,
  },
  setUserLocation: (location) =>
    set((state) => ({
      user: { ...state.user, location },
    })),
  setLocationPermissionGranted: (granted) =>
    set((state) => ({
      user: { ...state.user, locationPermissionGranted: granted },
    })),
  resetUser: () =>
    set({
      user: {
        location: null,
        locationPermissionGranted: false,
      },
    }),
}));
