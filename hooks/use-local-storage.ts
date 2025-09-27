"use client";

import { useState, useEffect } from "react";

function dateReviver(key: string, value: any) {
  if (key === "createdAt" && typeof value === "string") {
    return new Date(value);
  }
  return value;
}

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item, dateReviver) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        try {
          const newValue = JSON.parse(e.newValue, dateReviver);
          if (JSON.stringify(newValue) !== JSON.stringify(storedValue)) {
            setStoredValue(newValue);
          }
        } catch (error) {
          console.error(
            `Error parsing localStorage change for key "${key}":`,
            error
          );
        }
      }
    };

    const handleCustomStorageChange = (e: CustomEvent) => {
      if (e.detail.key === key) {
        try {
          const item = window.localStorage.getItem(key);
          const value = item ? JSON.parse(item, dateReviver) : storedValue;
          if (JSON.stringify(value) !== JSON.stringify(storedValue)) {
            setStoredValue(value);
          }
        } catch (error) {
          console.error(
            `Error reading localStorage key "${key}" after custom event:`,
            error
          );
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener(
      "localStorageChange",
      handleCustomStorageChange as EventListener
    );

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(
        "localStorageChange",
        handleCustomStorageChange as EventListener
      );
    };
  }, [key, storedValue]);

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
        // Dispatch custom event for same-tab changes
        window.dispatchEvent(
          new CustomEvent("localStorageChange", {
            detail: { key, value: valueToStore },
          })
        );
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue] as const;
}
