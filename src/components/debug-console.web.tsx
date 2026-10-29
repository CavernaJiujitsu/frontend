import { useEffect } from "react";

export function DebugConsole() {
  useEffect(() => {
    if (
      typeof window === "undefined" ||
      (!__DEV__ && process.env.EXPO_PUBLIC_ENABLE_VCONSOLE !== "true")
    ) {
      return;
    }

    let disposed = false;
    let instance: { destroy: () => void } | undefined;

    void import("vconsole")
      .then(({ default: VConsole }) => {
        if (!disposed) instance = new VConsole();
      })
      .catch((error: unknown) => {
        console.error("Failed to initialize the web debug console", error);
      });

    return () => {
      disposed = true;
      instance?.destroy();
    };
  }, []);

  return null;
}
