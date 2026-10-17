import { create } from "axios";
import { API_URL } from "@/constants/api";

export const apiClient = create({
  baseURL: API_URL,
});

export default apiClient;
