// Global Jest setup for jest-expo + React Native Testing Library.
// Keep this file minimal: per-test mocks belong in the test file itself.
jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);

// `src/constants/theme.ts` imports the global stylesheet; Jest has no CSS
// transform, so stub it out.
jest.mock("@/global.css", () => ({}));
