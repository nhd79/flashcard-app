"use client";

import { useState, useEffect } from "react";

function dateReviver(key: string, value: any) {
  if (key === "createdAt" && typeof value === "string") {
    return new Date(value);
  }
  return value;
}

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      setIsInitialized(true);
      return;
    }

    try {
      const item = window.localStorage.getItem(key);
      const value = item ? JSON.parse(item, dateReviver) : initialValue;
      setStoredValue(value);
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      setStoredValue(initialValue);
    } finally {
      setIsInitialized(true);
    }
  }, [key, initialValue]);

  // Listen for changes to localStorage (from other parts of the app)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        try {
          const newValue = JSON.parse(e.newValue, dateReviver);
          setStoredValue(newValue);
        } catch (error) {
          console.error(
            `Error parsing localStorage change for key "${key}":`,
            error
          );
        }
      }
    };

    // Also listen for custom events for same-tab changes
    const handleCustomStorageChange = (e: CustomEvent) => {
      if (e.detail.key === key) {
        try {
          const item = window.localStorage.getItem(key);
          const value = item ? JSON.parse(item, dateReviver) : initialValue;
          setStoredValue(value);
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
  }, [key, initialValue]);

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

  return [storedValue, setValue, isInitialized] as const;
}
