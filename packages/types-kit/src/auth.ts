import { SafeUser } from "./user";

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  email: string;
  password: string;
  name: string;
};

export type AuthResponse = {
  user: SafeUser;
  accessToken: string;
  refreshToken: string;
};
