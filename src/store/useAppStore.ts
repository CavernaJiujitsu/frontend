import AsyncStorage from "@react-native-async-storage/async-storage";
import type * as Location from "expo-location";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

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

const initialUser: AppState["user"] = {
  location: null,
  locationPermissionGranted: false,
  profile: null,
  practitionerId: null,
  beltValidationId: null,
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      user: initialUser,
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
      resetUser: () => set({ user: initialUser }),
    }),
    {
      name: "caverna-user-store",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
