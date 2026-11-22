import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import type { StorageValue } from "zustand/middleware";

import { ACCESS_TOKEN_KEY, createSessionStorage } from "@/store/session-storage";

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

type State = {
  user: { accessToken: string | null; userId: string | null };
};

const NAME = "caverna-user-store";
const TOKEN = "eyJhbGciOiJIUzI1NiJ9.payload.signature";

const value = (
  accessToken: string | null,
  userId: string | null = "u1",
): StorageValue<State> => ({
  state: { user: { accessToken, userId } },
  version: 0,
});

async function storedBlob(): Promise<StorageValue<State> | null> {
  const raw = await AsyncStorage.getItem(NAME);
  return raw ? (JSON.parse(raw) as StorageValue<State>) : null;
}

const secure = jest.mocked(SecureStore);

beforeEach(async () => {
  await AsyncStorage.clear();
  mockSecureValues.clear();
  jest.clearAllMocks();
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("native (Platform.OS = ios)", () => {
  it("writes the token to SecureStore and the blob to AsyncStorage without it", async () => {
    const storage = createSessionStorage<State>();
    await storage.getItem(NAME);

    await storage.setItem(NAME, value(TOKEN));

    expect(mockSecureValues.get(ACCESS_TOKEN_KEY)).toBe(TOKEN);
    expect(await storedBlob()).toEqual(value(null));
    expect(await AsyncStorage.getItem(NAME)).not.toContain(TOKEN);
  });

  it("hydrates the blob with the token read from SecureStore", async () => {
    await AsyncStorage.setItem(NAME, JSON.stringify(value(null)));
    mockSecureValues.set(ACCESS_TOKEN_KEY, TOKEN);

    const storage = createSessionStorage<State>();

    expect(await storage.getItem(NAME)).toEqual(value(TOKEN));
  });

  it("deletes the token from SecureStore when the session ends", async () => {
    mockSecureValues.set(ACCESS_TOKEN_KEY, TOKEN);
    await AsyncStorage.setItem(NAME, JSON.stringify(value(null)));
    const storage = createSessionStorage<State>();
    await storage.getItem(NAME);

    await storage.setItem(NAME, value(null, "u1"));

    expect(mockSecureValues.has(ACCESS_TOKEN_KEY)).toBe(false);
  });

  it("does not rewrite SecureStore when the token did not change", async () => {
    const storage = createSessionStorage<State>();
    await storage.getItem(NAME);

    await storage.setItem(NAME, value(TOKEN));
    await storage.setItem(NAME, value(TOKEN, "u1"));

    expect(secure.setItemAsync).toHaveBeenCalledTimes(1);
  });

  it("keeps the last token when writes overlap (login → logout → login)", async () => {
    const storage = createSessionStorage<State>();
    await storage.getItem(NAME);
    // The first write is slow: without serialization it would land last.
    secure.setItemAsync.mockImplementationOnce(
      (key: string, token: string) =>
        new Promise<void>((resolve) =>
          setTimeout(() => {
            mockSecureValues.set(key, token);
            resolve();
          }, 20),
        ),
    );

    await Promise.all([
      storage.setItem(NAME, value("token-a")),
      storage.setItem(NAME, value(null)),
      storage.setItem(NAME, value("token-b")),
    ]);

    expect(mockSecureValues.get(ACCESS_TOKEN_KEY)).toBe("token-b");
  });

  it("ignores writes made before the first read (they would wipe the session)", async () => {
    mockSecureValues.set(ACCESS_TOKEN_KEY, TOKEN);
    await AsyncStorage.setItem(NAME, JSON.stringify(value(null)));
    const storage = createSessionStorage<State>();

    await storage.setItem(NAME, value(null, null));

    expect(mockSecureValues.get(ACCESS_TOKEN_KEY)).toBe(TOKEN);
    expect(await storage.getItem(NAME)).toEqual(value(TOKEN));
  });

  it("drops an orphan token when there is no persisted identity", async () => {
    mockSecureValues.set(ACCESS_TOKEN_KEY, TOKEN);
    const storage = createSessionStorage<State>();

    expect(await storage.getItem(NAME)).toBeNull();
    expect(mockSecureValues.has(ACCESS_TOKEN_KEY)).toBe(false);
  });

  it("removeItem clears the blob and the token", async () => {
    const storage = createSessionStorage<State>();
    await storage.getItem(NAME);
    await storage.setItem(NAME, value(TOKEN));

    await storage.removeItem(NAME);

    expect(await AsyncStorage.getItem(NAME)).toBeNull();
    expect(mockSecureValues.has(ACCESS_TOKEN_KEY)).toBe(false);
  });
});

describe("migration of the legacy AsyncStorage blob", () => {
  it("moves the token to SecureStore and removes it from AsyncStorage", async () => {
    await AsyncStorage.setItem(NAME, JSON.stringify(value(TOKEN)));
    const storage = createSessionStorage<State>();

    expect(await storage.getItem(NAME)).toEqual(value(TOKEN));
    expect(mockSecureValues.get(ACCESS_TOKEN_KEY)).toBe(TOKEN);
    expect(await storedBlob()).toEqual(value(null));
    expect(await AsyncStorage.getItem(NAME)).not.toContain(TOKEN);
  });

  it("still strips AsyncStorage when the SecureStore write fails, and retries later", async () => {
    jest.spyOn(console, "warn").mockImplementation(() => undefined);
    secure.setItemAsync.mockRejectedValueOnce(new Error("keychain locked"));
    await AsyncStorage.setItem(NAME, JSON.stringify(value(TOKEN)));
    const storage = createSessionStorage<State>();

    // The session survives in memory, but the token is not left behind.
    expect(await storage.getItem(NAME)).toEqual(value(TOKEN));
    expect(await AsyncStorage.getItem(NAME)).not.toContain(TOKEN);
    expect(mockSecureValues.has(ACCESS_TOKEN_KEY)).toBe(false);

    await storage.setItem(NAME, value(TOKEN));

    expect(mockSecureValues.get(ACCESS_TOKEN_KEY)).toBe(TOKEN);
  });
});

describe("read failures never reject (the store would never hydrate)", () => {
  it("SecureStore read error → hydrates without a token", async () => {
    jest.spyOn(console, "warn").mockImplementation(() => undefined);
    secure.getItemAsync.mockRejectedValueOnce(new Error("decrypt failed"));
    await AsyncStorage.setItem(NAME, JSON.stringify(value(null)));
    const storage = createSessionStorage<State>();

    await expect(storage.getItem(NAME)).resolves.toEqual(value(null));
  });

  it("corrupted AsyncStorage blob → hydrates as logged out", async () => {
    jest.spyOn(console, "warn").mockImplementation(() => undefined);
    await AsyncStorage.setItem(NAME, "{not json");
    const storage = createSessionStorage<State>();

    await expect(storage.getItem(NAME)).resolves.toBeNull();
  });
});

describe("web (Platform.OS = web)", () => {
  beforeEach(() => {
    jest.replaceProperty(Platform, "OS", "web");
  });

  it("keeps the whole blob, token included, in AsyncStorage", async () => {
    const storage = createSessionStorage<State>();
    await storage.getItem(NAME);

    await storage.setItem(NAME, value(TOKEN));

    expect(await storedBlob()).toEqual(value(TOKEN));
    expect(secure.setItemAsync).not.toHaveBeenCalled();
  });

  it("hydrates straight from AsyncStorage without touching SecureStore", async () => {
    await AsyncStorage.setItem(NAME, JSON.stringify(value(TOKEN)));
    const storage = createSessionStorage<State>();

    expect(await storage.getItem(NAME)).toEqual(value(TOKEN));
    expect(secure.getItemAsync).not.toHaveBeenCalled();
    expect(secure.deleteItemAsync).not.toHaveBeenCalled();
  });
});
