import { makeAutoObservable } from "mobx";
import { ToastType, Toast } from "@grit/types-kit";
import type { RootStore } from "./RootStore";

const DEFAULT_DURATION = 4000;

export class ToastStore {
  toasts: Toast[] = [];

  constructor(public root: RootStore) {
    makeAutoObservable(this, { root: false });
  }

  private add(type: ToastType, message: string, duration = DEFAULT_DURATION) {
    const id = crypto.randomUUID();
    this.toasts.push({ id, type, message, duration });

    if (duration > 0) {
      setTimeout(() => this.remove(id), duration);
    }

    return id;
  }

  success(message: string, duration?: number) {
    return this.add("success", message, duration);
  }

  error(message: string, duration?: number) {
    return this.add("error", message, duration);
  }

  info(message: string, duration?: number) {
    return this.add("info", message, duration);
  }

  warning(message: string, duration?: number) {
    return this.add("warning", message, duration);
  }

  remove(id: string) {
    this.toasts = this.toasts.filter((t) => t.id !== id);
  }

  clear() {
    this.toasts = [];
  }
}
