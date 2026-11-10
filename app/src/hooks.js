import { createContext, useContext, useEffect, useSyncExternalStore } from "react";

export const StoreContext = createContext(null);

export const useStore = () => useContext(StoreContext);

// The editor snapshot (app/src/editor/store.js); a new one after every action.
export function useEditor() {
  const store = useStore();
  return useSyncExternalStore(store.subscribe, store.getSnapshot);
}

// One-time requests from the store (focus a field, scroll the palette). Each is
// handled once, by the component that names it, even when that component
// mounts after the request; `ready` holds it back until the component can act.
const handled = new WeakMap();
export function useSignal(name, effect, ready = true) {
  const store = useStore();
  const signal = useEditor().ui.signals[name];
  useEffect(() => {
    if (!signal || !ready) return;
    if (!handled.has(store)) handled.set(store, new Map());
    const seen = handled.get(store);
    if (seen.get(name) === signal.n) return;
    seen.set(name, signal.n);
    effect(signal);
  });
}

// config.json merged with its byIwc entry for this build.
export const ConfigContext = createContext({});
export const useConfig = () => useContext(ConfigContext);
