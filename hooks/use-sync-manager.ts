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
    if (!syncStatus.isOnline || typeof window === "undefined") return;

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: cloudLists, error: listsError } = await supabase
        .from("flashcard_lists")
        .select(
          `
          id,
          name,
          created_at,
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
        return;
      }

      const localData = localStorage.getItem("flashcard-lists");
      if (!localData || localData === "[]") {
        const localFormat =
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

        localStorage.setItem("flashcard-lists", JSON.stringify(localFormat));
        console.log("[Sync] Successfully synced from cloud");
      }

      setSyncStatus((prev) => ({
        ...prev,
        lastSyncTime: new Date(),
      }));
    } catch (error) {
      console.error("[Sync] Error syncing from cloud:", error);
    }
  }, [syncStatus.isOnline, supabase]);

  const manualSync = useCallback(async () => {
    if (!syncStatus.isOnline) return;
    await syncFromCloud();
    await syncToCloud();
  }, [syncFromCloud, syncToCloud, syncStatus.isOnline]);

  return {
    syncStatus,
    syncToCloud,
    syncFromCloud,
    manualSync,
  };
}
