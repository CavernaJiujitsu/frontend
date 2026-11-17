import type * as Location from "expo-location";
import { useSyncExternalStore } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserRole } from "@/api/services/auth.service";
import { createSessionStorage } from "@/store/session-storage";

// Which area the user is browsing when the account has both roles.
export type AppMode = "student" | "teacher";

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
    activeMode: AppMode | null;
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
  setActiveMode: (activeMode: AppMode | null) => void;
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
  activeMode: null,
};

type PersistedAppState = Pick<AppState, "user">;

// Identity without a token is a dead session (older builds dropped only the
// token on 401): keep just the device location.
function withoutIdentity(user: AppState["user"]): AppState["user"] {
  return {
    ...initialUser,
    location: user.location,
    locationPermissionGranted: user.locationPermissionGranted,
  };
}

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
            activeMode: null,
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
      setActiveMode: (activeMode) =>
        set((state) => ({
          user: { ...state.user, activeMode },
        })),
      resetUser: () =>
        // Keep the device location: it is not tied to the account.
        set((state) => ({ user: withoutIdentity(state.user) })),
    }),
    {
      name: "caverna-user-store",
      // Native: token in SecureStore, the rest in AsyncStorage. Web: AsyncStorage.
      storage: createSessionStorage<PersistedAppState>(),
      partialize: (state): PersistedAppState => ({ user: state.user }),
      // Older sessions persisted a `user` object without `roles`, `userId` and
      // `teacherId`; merge nested fields so hydration stays compatible.
      merge: (persisted, current) => {
        const stored = persisted as Partial<PersistedAppState> | undefined;
        const user = { ...current.user, ...stored?.user };
        return {
          ...current,
          user: user.accessToken ? user : withoutIdentity(user),
        };
      },
    },
  ),
);

/**
 * True once the persisted session was read (AsyncStorage + SecureStore on
 * native). Guards must wait for it, otherwise a cold start sees an empty
 * token and bounces to login.
 */
export function useStoreHydrated(): boolean {
  return useSyncExternalStore(
    (onChange) => useAppStore.persist.onFinishHydration(onChange),
    () => useAppStore.persist.hasHydrated(),
    // Static web rendering has no storage: render the loader first.
    () => false,
  );
}
