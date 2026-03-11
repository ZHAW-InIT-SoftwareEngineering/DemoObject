export function readSessionStorageItem<T>(
  key: string,
  isValue: (value: unknown) => value is T,
): T | null {
  if (typeof window === "undefined") return null;

  try {
    const rawValue = window.sessionStorage.getItem(key);
    if (!rawValue) return null;

    const parsedValue: unknown = JSON.parse(rawValue);
    if (!isValue(parsedValue)) {
      window.sessionStorage.removeItem(key);
      return null;
    }

    return parsedValue;
  } catch {
    window.sessionStorage.removeItem(key);
    return null;
  }
}

export function writeSessionStorageItem(key: string, value: unknown) {
  if (typeof window === "undefined") return;

  window.sessionStorage.setItem(key, JSON.stringify(value));
}

export function clearSessionStorageItem(key: string) {
  if (typeof window === "undefined") return;

  window.sessionStorage.removeItem(key);
}
