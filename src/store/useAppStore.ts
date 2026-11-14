import AsyncStorage from "@react-native-async-storage/async-storage";
import type * as Location from "expo-location";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { UserRole } from "@/api/services/auth.service";

interface AppState {
  user: {
    location: Location.LocationObject | null;
    locationPermissionGranted: boolean;
    profile: { nome: string; email: string } | null;
    practitionerId: string | null;
    teacherId: string | null;
    userId: string | null;
    roles: UserRole[];
    accessToken: string | null;
    beltValidationId: string | null;
  };
  setUserLocation: (location: Location.LocationObject) => void;
  setLocationPermissionGranted: (granted: boolean) => void;
  setProfile: (profile: { nome: string; email: string }) => void;
  setPractitionerId: (practitionerId: string | null) => void;
  setAuthIdentity: (identity: {
    accessToken: string;
    practitionerId?: string;
    teacherId?: string;
    userId: string;
    roles: UserRole[];
  }) => void;
  setAccessToken: (accessToken: string | null) => void;
  setBeltValidationId: (beltValidationId: string | null) => void;
  resetUser: () => void;
}

const initialUser: AppState["user"] = {
  location: null,
  locationPermissionGranted: false,
  profile: null,
  practitionerId: null,
  teacherId: null,
  userId: null,
  roles: [],
  accessToken: null,
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
      setAuthIdentity: ({ accessToken, practitionerId, teacherId, userId, roles }) =>
        set((state) => ({
          user: {
            ...state.user,
            accessToken,
            practitionerId: practitionerId ?? null,
            teacherId: teacherId ?? null,
            userId,
            roles,
          },
        })),
      setAccessToken: (accessToken) =>
        set((state) => ({
          user: { ...state.user, accessToken },
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
      // Older sessions persisted a `user` object without `roles`, `userId` and
      // `teacherId`; merge nested fields so hydration stays compatible.
      merge: (persisted, current) => {
        const stored = persisted as Partial<AppState> | undefined;
        return {
          ...current,
          ...stored,
          user: { ...current.user, ...stored?.user },
        };
      },
    },
  ),
);
