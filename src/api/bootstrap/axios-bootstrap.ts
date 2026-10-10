import { create } from "axios";
import Constants from "expo-constants";

const API_URL = Constants.expoConfig?.extra?.API_URL ?? "http://localhost:4000";

export const apiClient = create({
  baseURL: API_URL,
});

export default apiClient;
