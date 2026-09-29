import { LoginPayload, RegisterPayload, SafeUser } from "@grit/types-kit";
import { makeAutoObservable, runInAction } from "mobx";
import type { RootStore } from "./RootStore";
import { authApi } from "@/api/auth";

const ACCESS_KEY = "accessToken";
const REFRESH_KEY = "refreshToken";

export class AuthStore {
  user: SafeUser | null = null;
  isAuth = false;
  isLoading = false;
  error: string | null = null;
  initialized = false;

  constructor(public root: RootStore) {
    makeAutoObservable(this, { root: false });
  }

  private setTokens(access: string, refresh: string) {
    localStorage.setItem(ACCESS_KEY, access);
    localStorage.setItem(REFRESH_KEY, refresh);
  }

  private clearTokens() {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  }

  private async auth(
    fn: () => Promise<{ user: SafeUser; accessToken: string; refreshToken: string }>
  ) {
    this.isLoading = true;
    this.error = null;

    try {
      const { user, accessToken, refreshToken } = await fn();
      this.setTokens(accessToken, refreshToken);

      runInAction(() => {
        this.user = user;
        this.isAuth = true;
        this.isLoading = false;
      });

      this.root.toastStore.success(`Welcome, ${user.name}!`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Something went wrong";
      runInAction(() => {
        this.error = message;
        this.isLoading = false;
      });
      this.root.toastStore.error(message);
      throw error;
    }
  }

  login(payload: LoginPayload) {
    return this.auth(() => authApi.login(payload));
  }

  register(payload: RegisterPayload) {
    return this.auth(() => authApi.register(payload));
  }

  async checkAuth() {
    const token = localStorage.getItem(ACCESS_KEY);
    if (!token) {
      this.initialized = true;
      return;
    }

    this.isLoading = true;
    try {
      const user = await authApi.me();
      runInAction(() => {
        this.user = user;
        this.isAuth = true;
      });
    } catch {
      this.clearTokens();
    } finally {
      runInAction(() => {
        this.isLoading = false;
        this.initialized = true;
      });
    }
  }

  async logout() {
    try {
      await authApi.logout();
    } finally {
      this.clearTokens();
      runInAction(() => {
        this.user = null;
        this.isAuth = false;
      });
      this.root.toastStore.info("You have been logged out");
    }
  }

  clearError() {
    this.error = null;
  }

  get isAdmin() {
    return this.user?.role === "admin";
  }
}
