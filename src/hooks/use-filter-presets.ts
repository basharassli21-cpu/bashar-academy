import * as React from "react";

export type FilterPreset<T> = {
  id: string;
  name: string;
  filters: T;
};

const listeners = new Map<string, Set<() => void>>();

function emitChange(storageKey: string) {
  listeners.get(storageKey)?.forEach((listener) => listener());
}

function subscribe(storageKey: string, callback: () => void) {
  if (!listeners.has(storageKey)) listeners.set(storageKey, new Set());
  const set = listeners.get(storageKey)!;
  set.add(callback);
  return () => set.delete(callback);
}

function getSnapshot(storageKey: string): string {
  return window.localStorage.getItem(storageKey) ?? "[]";
}

function getServerSnapshot(): string {
  return "[]";
}

export function useFilterPresets<T>(storageKey: string) {
  const raw = React.useSyncExternalStore(
    (callback) => subscribe(storageKey, callback),
    () => getSnapshot(storageKey),
    getServerSnapshot
  );

  const presets = React.useMemo<FilterPreset<T>[]>(() => {
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }, [raw]);

  function persist(next: FilterPreset<T>[]) {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(next));
      emitChange(storageKey);
    } catch {
      // ignore storage write failures (e.g. quota, private mode)
    }
  }

  function savePreset(name: string, filters: T) {
    const preset: FilterPreset<T> = { id: crypto.randomUUID(), name, filters };
    persist([...presets, preset]);
  }

  function deletePreset(id: string) {
    persist(presets.filter((p) => p.id !== id));
  }

  return { presets, savePreset, deletePreset };
}
