import AsyncStorage from "@react-native-async-storage/async-storage";
import { act, renderHook } from "@testing-library/react-native";
import type * as Location from "expo-location";
import * as SecureStore from "expo-secure-store";

import { ACCESS_TOKEN_KEY } from "@/store/session-storage";
import { useAppStore, useStoreHydrated } from "@/store/useAppStore";

const mockSecureValues = new Map<string, string>();

jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(async (key: string) => mockSecureValues.get(key) ?? null),
  setItemAsync: jest.fn(async (key: string, value: string) => {
    mockSecureValues.set(key, value);
  }),
  deleteItemAsync: jest.fn(async (key: string) => {
    mockSecureValues.delete(key);
  }),
}));

const STORE_KEY = "caverna-user-store";
const TOKEN = "eyJhbGciOiJIUzI1NiJ9.student.signature";

const location = {
  coords: { latitude: -23.5, longitude: -46.6 },
  timestamp: 0,
} as Location.LocationObject;

// Same shape the app persists (see `partialize`).
const persistedUser = {
  location,
  locationPermissionGranted: true,
  profile: { nome: "Aluno", email: "aluno@teste.caverna" },
  practitionerId: "p1",
  teacherId: null,
  userId: "u1",
  roles: ["STUDENT"],
  beltValidationId: "bv1",
  activeMode: null,
};

const flush = () => new Promise<void>((resolve) => setImmediate(() => resolve()));

async function seed(user: Record<string, unknown> | null, secureToken?: string) {
  if (user) {
    await AsyncStorage.setItem(STORE_KEY, JSON.stringify({ state: { user }, version: 0 }));
  }
  if (secureToken) mockSecureValues.set(ACCESS_TOKEN_KEY, secureToken);
}

beforeEach(async () => {
  useAppStore.getState().resetUser();
  useAppStore.setState((state) => ({
    user: { ...state.user, location: null, locationPermissionGranted: false },
  }));
  await flush();
  await AsyncStorage.clear();
  mockSecureValues.clear();
});

describe("cold start", () => {
  it("restores the token from SecureStore and only then reports hydrated", async () => {
    await seed({ ...persistedUser, accessToken: null });
    // Hold the SecureStore read: hydration must wait for it.
    let releaseToken: (token: string) => void = () => undefined;
    jest.mocked(SecureStore.getItemAsync).mockImplementationOnce(
      () => new Promise<string>((resolve) => (releaseToken = resolve)),
    );

    const hydration = useAppStore.persist.rehydrate();
    const { result } = await renderHook(() => useStoreHydrated());
    expect(result.current).toBe(false);
    expect(useAppStore.getState().user.accessToken).toBeNull();

    await act(async () => {
      releaseToken(TOKEN);
      await hydration;
    });

    expect(result.current).toBe(true);
    expect(useAppStore.getState().user).toMatchObject({
      accessToken: TOKEN,
      userId: "u1",
      roles: ["STUDENT"],
      practitionerId: "p1",
    });
  });

  it("migrates a legacy AsyncStorage token and keeps the session", async () => {
    await seed({ ...persistedUser, accessToken: TOKEN });

    await useAppStore.persist.rehydrate();

    expect(useAppStore.getState().user.accessToken).toBe(TOKEN);
    expect(mockSecureValues.get(ACCESS_TOKEN_KEY)).toBe(TOKEN);
    expect(await AsyncStorage.getItem(STORE_KEY)).not.toContain(TOKEN);
  });

  it("drops a persisted identity that has no token (dead session from older builds)", async () => {
    await seed({ ...persistedUser, accessToken: null });

    await useAppStore.persist.rehydrate();

    expect(useAppStore.getState().user).toEqual({
      location,
      locationPermissionGranted: true,
      profile: null,
      practitionerId: null,
      teacherId: null,
      userId: null,
      roles: [],
      accessToken: null,
      beltValidationId: null,
      activeMode: null,
    });
  });

  it("hydrates as logged out when nothing was saved", async () => {
    await useAppStore.persist.rehydrate();

    expect(useAppStore.persist.hasHydrated()).toBe(true);
    expect(useAppStore.getState().user.accessToken).toBeNull();
  });
});

describe("persistence of the session", () => {
  beforeEach(async () => {
    await useAppStore.persist.rehydrate();
  });

  it("setAuthIdentity stores the token in SecureStore, never in AsyncStorage", async () => {
    useAppStore.getState().setAuthIdentity({
      accessToken: TOKEN,
      userId: "u1",
      practitionerId: "p1",
      roles: ["STUDENT"],
    });
    await flush();

    expect(mockSecureValues.get(ACCESS_TOKEN_KEY)).toBe(TOKEN);
    const blob = await AsyncStorage.getItem(STORE_KEY);
    expect(blob).toContain('"userId":"u1"');
    expect(blob).not.toContain(TOKEN);
  });

  it("resetUser wipes the identity and the stored token but keeps the location", async () => {
    useAppStore.getState().setUserLocation(location);
    useAppStore.getState().setLocationPermissionGranted(true);
    useAppStore.getState().setAuthIdentity({
      accessToken: TOKEN,
      userId: "u1",
      teacherId: "t1",
      roles: ["STUDENT", "TEACHER"],
    });
    useAppStore.getState().setActiveMode("teacher");
    useAppStore.getState().setProfile({ nome: "A", email: "a@teste.caverna" });
    useAppStore.getState().setBeltValidationId("bv1");
    await flush();

    useAppStore.getState().resetUser();
    await flush();

    expect(useAppStore.getState().user).toEqual({
      location,
      locationPermissionGranted: true,
      profile: null,
      practitionerId: null,
      teacherId: null,
      userId: null,
      roles: [],
      accessToken: null,
      beltValidationId: null,
      activeMode: null,
    });
    expect(mockSecureValues.has(ACCESS_TOKEN_KEY)).toBe(false);
    expect(await AsyncStorage.getItem(STORE_KEY)).not.toContain("u1");
  });
});
