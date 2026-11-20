import type * as Location from "expo-location";
import { router } from "expo-router";

import { queryClient } from "@/api/bootstrap/query-client";
import { SESSION_EXPIRED_MESSAGE } from "@/constants/error-messages";
import { useAppStore } from "@/store/useAppStore";
import { useErrorStore } from "@/store/useErrorStore";
import {
  CHOOSE_MODE,
  enterMode,
  expireSession,
  homeRouteFor,
  logout,
  logoutToRecovery,
  STUDENT_HOME,
  TEACHER_HOME,
} from "@/utils/session";

jest.mock("expo-router", () => ({ router: { replace: jest.fn() } }));

jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(async () => null),
  setItemAsync: jest.fn(async () => undefined),
  deleteItemAsync: jest.fn(async () => undefined),
}));

const location = {
  coords: { latitude: -23.5, longitude: -46.6 },
  timestamp: 0,
} as Location.LocationObject;

function signIn() {
  const store = useAppStore.getState();
  store.setUserLocation(location);
  store.setLocationPermissionGranted(true);
  store.setAuthIdentity({
    accessToken: "token-u1",
    userId: "u1",
    practitionerId: "p1",
    teacherId: "t1",
    roles: ["STUDENT", "TEACHER"],
  });
  store.setActiveMode("teacher");
  store.setProfile({ nome: "Aluno", email: "aluno@teste.caverna" });
  store.setBeltValidationId("bv1");
  queryClient.setQueryData(["profile", "p1"], { name: "Aluno" });
}

const signedOutUser = {
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
};

beforeEach(async () => {
  await useAppStore.persist.rehydrate();
  jest.clearAllMocks();
});

afterEach(() => {
  useErrorStore.getState().hide();
  queryClient.clear();
});

describe("homeRouteFor", () => {
  it.each([
    [["STUDENT"], null, STUDENT_HOME],
    [["TEACHER"], null, TEACHER_HOME],
    [["STUDENT", "TEACHER"], null, CHOOSE_MODE],
    [["STUDENT", "TEACHER"], "student", STUDENT_HOME],
    [["STUDENT", "TEACHER"], "teacher", TEACHER_HOME],
    [["CAVE_ADMIN"], null, null],
  ] as const)("%j / %s → %s", (roles, mode, expected) => {
    expect(homeRouteFor([...roles], mode)).toBe(expected);
  });
});

describe("enterMode", () => {
  it("stores the mode and opens its home with replace", () => {
    enterMode("teacher");

    expect(useAppStore.getState().user.activeMode).toBe("teacher");
    expect(router.replace).toHaveBeenCalledWith(TEACHER_HOME);
  });
});

describe("logout", () => {
  it("clears identity and cache, keeps the location and opens login without a toast", () => {
    signIn();

    logout();

    expect(useAppStore.getState().user).toEqual(signedOutUser);
    expect(queryClient.getQueryData(["profile", "p1"])).toBeUndefined();
    expect(router.replace).toHaveBeenCalledTimes(1);
    expect(router.replace).toHaveBeenCalledWith("/onboarding/login");
    expect(useErrorStore.getState().visible).toBe(false);
  });
});

describe("logoutToRecovery", () => {
  it("drops credentials and cache and opens the public email confirmation", () => {
    signIn();
    logoutToRecovery();

    expect(useAppStore.getState().user).toEqual(signedOutUser);
    expect(queryClient.getQueryData(["profile", "p1"])).toBeUndefined();
    expect(router.replace).toHaveBeenCalledWith("/onboarding/check-email");
  });
});

describe("expireSession", () => {
  it("does what logout does and shows the expired-session toast", () => {
    signIn();

    expireSession();

    expect(useAppStore.getState().user).toEqual(signedOutUser);
    expect(queryClient.getQueryData(["profile", "p1"])).toBeUndefined();
    expect(router.replace).toHaveBeenCalledWith("/onboarding/login");
    expect(useErrorStore.getState()).toMatchObject({
      visible: true,
      message: SESSION_EXPIRED_MESSAGE,
    });
  });
});
