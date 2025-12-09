import { publicApi, protectedApi } from "./api";
import type {
  LoginRequest,
  LoginResponse,
  CurrentUserResponse,
} from "@/types/auth";

export const authService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await publicApi.post<LoginResponse>(
      "/auth/login",
      credentials
    );
    return response.data;
  },

  getCurrentUser: async (): Promise<CurrentUserResponse> => {
    const response = await protectedApi.get<CurrentUserResponse>("/auth/me");
    return response.data;
  },

  logout: (): void => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },
};
