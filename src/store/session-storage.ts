import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import type { PersistStorage, StorageValue } from "zustand/middleware";

/** SecureStore keys accept only alphanumerics, ".", "-" and "_". */
export const ACCESS_TOKEN_KEY = "caverna.accessToken";

type TokenCarrier = { user: { accessToken: string | null } };

/** SecureStore has no web implementation (Expo SDK 57: Android, iOS, tvOS). */
export function usesSecureStore(): boolean {
  return Platform.OS !== "web";
}

function withToken<S extends TokenCarrier>(
  value: StorageValue<S>,
  accessToken: string | null,
): StorageValue<S> {
  return {
    ...value,
    state: { ...value.state, user: { ...value.state.user, accessToken } },
  };
}

function warn(action: string, error: unknown): void {
  // Never log values: only the failure reason.
  if (__DEV__) {
    console.warn(
      `[session-storage] ${action} failed:`,
      error instanceof Error ? error.message : String(error),
    );
  }
}

/**
 * zustand persist storage that keeps the access token out of AsyncStorage.
 *
 * - Native: the token lives in SecureStore and the rest of the blob in
 *   AsyncStorage (with `accessToken: null`). A legacy blob that still holds
 *   the token is migrated on the first read.
 * - Web: the whole blob stays in AsyncStorage (localStorage), as before.
 *
 * `getItem` never rejects: a rejected read would leave the store
 * un-hydrated forever and the RoleGuard stuck on its loader.
 */
export function createSessionStorage<
  S extends TokenCarrier,
>(): PersistStorage<S> {
  let readCompleted = false;
  // Last token known to be in SecureStore; `undefined` means unknown.
  let storedToken: string | null | undefined;
  let tokenWrites: Promise<void> = Promise.resolve();

  function persistToken(token: string | null): Promise<void> {
    if (token === storedToken) return tokenWrites;
    storedToken = token;
    // Serialized so a quick logout → login keeps the last value.
    tokenWrites = tokenWrites.then(async () => {
      try {
        if (token) {
          await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
        } else {
          await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
        }
      } catch (error) {
        storedToken = undefined; // the next write retries
        warn("token write", error);
      }
    });
    return tokenWrites;
  }

  async function readToken(): Promise<string | null> {
    try {
      const token = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
      storedToken = token;
      return token;
    } catch (error) {
      warn("token read", error);
      return null;
    }
  }

  async function read(name: string): Promise<StorageValue<S> | null> {
    const raw = await AsyncStorage.getItem(name);
    const stored = raw ? (JSON.parse(raw) as StorageValue<S>) : null;
    if (!usesSecureStore()) return stored;

    if (!stored?.state?.user) {
      // No identity left (fresh install, cleared data, iOS reinstall that
      // kept the keychain): an orphan token must not survive it.
      await persistToken(null);
      return null;
    }

    const legacyToken = stored.state.user.accessToken;
    if (legacyToken) {
      // Blob written by an older build: move the token to SecureStore and
      // strip it from AsyncStorage, even if the SecureStore write fails
      // (the session keeps the token in memory and the next write retries).
      await persistToken(legacyToken);
      await AsyncStorage.setItem(name, JSON.stringify(withToken(stored, null)));
      return stored;
    }

    return withToken(stored, await readToken());
  }

  return {
    async getItem(name) {
      try {
        return await read(name);
      } catch (error) {
        warn("read", error);
        return null;
      } finally {
        readCompleted = true;
      }
    },

    async setItem(name, value) {
      // A write before the first read would overwrite the saved session.
      if (!readCompleted) return;
      try {
        if (!usesSecureStore()) {
          await AsyncStorage.setItem(name, JSON.stringify(value));
          return;
        }
        await Promise.all([
          AsyncStorage.setItem(name, JSON.stringify(withToken(value, null))),
          persistToken(value.state.user.accessToken),
        ]);
      } catch (error) {
        warn("write", error);
      }
    },

    async removeItem(name) {
      try {
        await AsyncStorage.removeItem(name);
        if (usesSecureStore()) await persistToken(null);
      } catch (error) {
        warn("remove", error);
      }
    },
  };
}
