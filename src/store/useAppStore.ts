import { create } from 'zustand';
import type * as Location from 'expo-location';

interface AppState {
  user: {
    location: Location.LocationObject | null;
    locationPermissionGranted: boolean;
    profile: { nome: string; email: string } | null;
    practitionerId: string | null;
    beltValidationId: string | null;
  };
  setUserLocation: (location: Location.LocationObject) => void;
  setLocationPermissionGranted: (granted: boolean) => void;
  setProfile: (profile: { nome: string; email: string }) => void;
  setPractitionerId: (practitionerId: string | null) => void;
  setBeltValidationId: (beltValidationId: string | null) => void;
  resetUser: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: {
    location: null,
    locationPermissionGranted: false,
    profile: null,
    practitionerId: null,
    beltValidationId: null,
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
  setPractitionerId: (practitionerId) =>
    set((state) => ({
      user: { ...state.user, practitionerId },
    })),
  setBeltValidationId: (beltValidationId) =>
    set((state) => ({
      user: { ...state.user, beltValidationId },
    })),
  resetUser: () =>
    set({
      user: {
        location: null,
        locationPermissionGranted: false,
        profile: null,
        practitionerId: null,
        beltValidationId: null,
      },
    }),
}));
