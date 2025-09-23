"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncTime: Date | null;
  pendingChanges: number;
}

export function useSyncManager() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: false,
    isSyncing: false,
    lastSyncTime: null,
    pendingChanges: 0,
  });

  const supabase = createClient();

  useEffect(() => {
    if (typeof window !== "undefined") {
      setSyncStatus((prev) => ({ ...prev, isOnline: navigator.onLine }));
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleOnline = () => {
      setSyncStatus((prev) => ({ ...prev, isOnline: true }));
    };

    const handleOffline = () => {
      setSyncStatus((prev) => ({ ...prev, isOnline: false }));
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const syncToCloud = useCallback(async () => {
    if (!syncStatus.isOnline || typeof window === "undefined") return;

    setSyncStatus((prev) => ({ ...prev, isSyncing: true }));

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        console.log(
          "[Sync] No authenticated user found. Please sign in to sync data."
        );
        setSyncStatus((prev) => ({ ...prev, isSyncing: false }));
        return;
      }

      const localData = localStorage.getItem("flashcard-lists");
      if (!localData) return;

      const localLists = JSON.parse(localData);

      for (const list of localLists) {
        const { data: existingList } = await supabase
          .from("flashcard_lists")
          .select("id, updated_at")
          .eq("name", list.name)
          .eq("user_id", user.id)
          .single();

        if (!existingList) {
          const { data: newList, error: listError } = await supabase
            .from("flashcard_lists")
            .insert({
              name: list.name,
              user_id: user.id,
            })
            .select()
            .single();

          if (listError) {
            console.error("[Sync] Error syncing list:", listError);
            continue;
          }

          if (list.cards && list.cards.length > 0) {
            const cardsToInsert = list.cards.map((card: any) => ({
              list_id: newList.id,
              front: card.vietnamese || "",
              back: JSON.stringify({
                chinese: card.chinese || "",
                pinyin: card.pinyin || "",
                sentence: card.sentence || "",
              }),
              user_id: user.id,
            }));

            const { error: cardsError } = await supabase
              .from("flashcards")
              .insert(cardsToInsert);

            if (cardsError) {
              console.error("[Sync] Error syncing cards:", cardsError);
            }
          }
        }
      }

      setSyncStatus((prev) => ({
        ...prev,
        lastSyncTime: new Date(),
        pendingChanges: 0,
      }));
      console.log("[Sync] Successfully synced to cloud");
    } catch (error) {
      console.error("[Sync] Sync error:", error);
    } finally {
      setSyncStatus((prev) => ({ ...prev, isSyncing: false }));
    }
  }, [syncStatus.isOnline, supabase]);

  const syncFromCloud = useCallback(async () => {
    if (!syncStatus.isOnline || typeof window === "undefined") return null;

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: cloudLists, error: listsError } = await supabase
        .from("flashcard_lists")
        .select(
          `
          id,
          name,
          created_at,
          updated_at,
          flashcards (
            id,
            front,
            back,
            created_at
          )
        `
        )
        .eq("user_id", user.id);

      if (listsError) {
        console.error("[Sync] Error fetching from cloud:", listsError);
        return null;
      }

      const localData = localStorage.getItem("flashcard-lists");
      const existingLocalLists = localData ? JSON.parse(localData) : [];

      const cloudFormat =
        cloudLists?.map((list) => ({
          id: list.id,
          name: list.name,
          cards:
            list.flashcards?.map((card) => {
              try {
                const backData = JSON.parse(card.back);
                return {
                  id: card.id,
                  vietnamese: card.front,
                  chinese: backData.chinese || "",
                  pinyin: backData.pinyin || "",
                  sentence: backData.sentence || "",
                };
              } catch {
                // Fallback for old format
                return {
                  id: card.id,
                  vietnamese: card.front,
                  chinese: card.back.split(" (")[0] || "",
                  pinyin: card.back.match(/\(([^)]+)\)/)?.[1] || "",
                  sentence: "",
                };
              }
            }) || [],
          createdAt: new Date(list.created_at),
        })) || [];

      // Only update localStorage if there's no local data (initial sync)
      // or if explicitly requested (force sync)
      if (existingLocalLists.length === 0) {
        localStorage.setItem("flashcard-lists", JSON.stringify(cloudFormat));

        // Dispatch custom event to notify other components
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("localStorageChange", {
              detail: { key: "flashcard-lists", value: cloudFormat },
            })
          );
        }

        console.log("[Sync] Initial sync from cloud completed");
      } else {
        console.log("[Sync] Cloud data fetched but local data preserved");
      }

      setSyncStatus((prev) => ({
        ...prev,
        lastSyncTime: new Date(),
      }));

      // Return the cloud data for comparison/merging
      return cloudFormat;
    } catch (error) {
      console.error("[Sync] Error syncing from cloud:", error);
      return null;
    }
  }, [syncStatus.isOnline, supabase]);

  const manualSync = useCallback(async () => {
    if (!syncStatus.isOnline) return null;

    // First, sync local changes to cloud to preserve them
    await syncToCloud();

    // Then, fetch any new cloud data (but don't overwrite local)
    const cloudData = await syncFromCloud();

    console.log("[Sync] Manual sync completed");
    return cloudData;
  }, [syncFromCloud, syncToCloud, syncStatus.isOnline]);

  const forceSyncFromCloud = useCallback(async () => {
    if (!syncStatus.isOnline || typeof window === "undefined") return null;

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: cloudLists, error: listsError } = await supabase
        .from("flashcard_lists")
        .select(
          `
          id,
          name,
          created_at,
          updated_at,
          flashcards (
            id,
            front,
            back,
            created_at
          )
        `
        )
        .eq("user_id", user.id);

      if (listsError) {
        console.error("[Sync] Error fetching from cloud:", listsError);
        return null;
      }

      const cloudFormat =
        cloudLists?.map((list) => ({
          id: list.id,
          name: list.name,
          cards:
            list.flashcards?.map((card) => {
              try {
                const backData = JSON.parse(card.back);
                return {
                  id: card.id,
                  vietnamese: card.front,
                  chinese: backData.chinese || "",
                  pinyin: backData.pinyin || "",
                  sentence: backData.sentence || "",
                };
              } catch {
                // Fallback for old format
                return {
                  id: card.id,
                  vietnamese: card.front,
                  chinese: card.back.split(" (")[0] || "",
                  pinyin: card.back.match(/\(([^)]+)\)/)?.[1] || "",
                  sentence: "",
                };
              }
            }) || [],
          createdAt: new Date(list.created_at),
        })) || [];

      // Force overwrite local data with cloud data
      localStorage.setItem("flashcard-lists", JSON.stringify(cloudFormat));

      // Dispatch custom event to notify other components
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("localStorageChange", {
            detail: { key: "flashcard-lists", value: cloudFormat },
          })
        );
      }

      console.log(
        "[Sync] Force sync from cloud completed - local data overwritten"
      );

      setSyncStatus((prev) => ({
        ...prev,
        lastSyncTime: new Date(),
      }));

      return cloudFormat;
    } catch (error) {
      console.error("[Sync] Error force syncing from cloud:", error);
      return null;
    }
  }, [syncStatus.isOnline, supabase]);

  return {
    syncStatus,
    syncToCloud,
    syncFromCloud,
    forceSyncFromCloud,
    manualSync,
  };
}
