import { createContext, useContext, type ReactNode } from "react";
import { rootStore, type RootStore } from "../stores";

const StoreContext = createContext<RootStore | null>(null);

type StoreProviderProps = {
  children: ReactNode;
  store?: RootStore;
};

export const StoreProvider = ({ children, store = rootStore }: StoreProviderProps) => {
  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
};

export const useStore = (): RootStore => {
  const store = useContext(StoreContext);
  if (!store) throw new Error("useStore must be used within StoreProvider");
  return store;
};
