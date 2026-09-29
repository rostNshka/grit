import { AuthStore } from "./AuthStore";
import { ToastStore } from "./ToastStore";

export class RootStore {
  authStore: AuthStore;
  toastStore: ToastStore;

  constructor() {
    this.authStore = new AuthStore(this);
    this.toastStore = new ToastStore(this);
  }
}

export const rootStore = new RootStore();
