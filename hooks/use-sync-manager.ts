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
      const localData = localStorage.getItem("flashcard-lists");
      if (!localData) return;

      const localLists = JSON.parse(localData);

      for (const list of localLists) {
        // Check if this is a new list (has numeric/temp ID) or existing list (has UUID)
        const isNewList =
          typeof list.id === "number" || String(list.id).startsWith("temp_");

        if (isNewList) {
          // New list - create in cloud and update local with returned UUID
          const { data: newList, error: listError } = await supabase
            .from("flashcard_lists")
            .insert({
              name: list.name,
            })
            .select()
            .single();

          if (listError) {
            console.error("[Sync] Error creating new list:", listError);
            continue;
          }

          // Update local list with cloud UUID
          list.id = newList.id;
          console.log(
            `[Sync] Created new list "${list.name}" with ID ${newList.id}`
          );

          // Sync cards for the new list
          if (list.cards && list.cards.length > 0) {
            const cardsToInsert = list.cards.map((card: any) => ({
              list_id: newList.id,
              front: card.vietnamese || "",
              back: JSON.stringify({
                chinese: card.chinese || "",
                pinyin: card.pinyin || "",
                sentence: card.sentence || "",
              }),
            }));

            const { data: newCards, error: cardsError } = await supabase
              .from("flashcards")
              .insert(cardsToInsert)
              .select();

            if (cardsError) {
              console.error(
                "[Sync] Error syncing cards for new list:",
                cardsError
              );
            } else {
              // Update local cards with cloud UUIDs
              newCards?.forEach((cloudCard, index) => {
                if (list.cards[index]) {
                  list.cards[index].id = cloudCard.id;
                }
              });
              console.log(
                `[Sync] Synced ${newCards?.length} cards for new list "${list.name}"`
              );
            }
          }
        } else {
          // Existing list with UUID - try to update it
          const { data: existingList, error: selectError } = await supabase
            .from("flashcard_lists")
            .select("id, name")
            .eq("id", list.id)
            .single();

          if (existingList) {
            // List exists - update if name changed
            if (existingList.name !== list.name) {
              const { error: updateError } = await supabase
                .from("flashcard_lists")
                .update({ name: list.name })
                .eq("id", list.id);

              if (updateError) {
                console.error("[Sync] Error updating list name:", updateError);
                continue;
              }
              console.log(
                `[Sync] Updated list name from "${existingList.name}" to "${list.name}"`
              );
            }

            // Sync cards for existing list
            if (list.cards && list.cards.length > 0) {
              // Get existing cards
              const { data: existingCards } = await supabase
                .from("flashcards")
                .select("id, front, back")
                .eq("list_id", list.id);

              const existingCardIds = new Set(
                existingCards?.map((card) => card.id) || []
              );

              // Find new cards (cards without UUIDs or not in cloud)
              const newCards = list.cards.filter(
                (card: any) =>
                  typeof card.id === "number" || !existingCardIds.has(card.id)
              );

              // Find existing cards that might have been updated
              const existingLocalCards = list.cards.filter(
                (card: any) =>
                  typeof card.id === "string" &&
                  card.id.length > 10 &&
                  existingCardIds.has(card.id)
              );

              // Insert new cards
              if (newCards.length > 0) {
                const cardsToInsert = newCards.map((card: any) => ({
                  list_id: list.id,
                  front: card.vietnamese || "",
                  back: JSON.stringify({
                    chinese: card.chinese || "",
                    pinyin: card.pinyin || "",
                    sentence: card.sentence || "",
                  }),
                }));

                const { data: insertedCards, error: cardsError } =
                  await supabase
                    .from("flashcards")
                    .insert(cardsToInsert)
                    .select();

                if (cardsError) {
                  console.error("[Sync] Error syncing new cards:", cardsError);
                } else {
                  // Update local cards with cloud UUIDs
                  insertedCards?.forEach((cloudCard, index) => {
                    const localCard = newCards[index];
                    if (localCard) {
                      localCard.id = cloudCard.id;
                    }
                  });
                  console.log(
                    `[Sync] Synced ${insertedCards?.length} new cards for "${list.name}"`
                  );
                }
              }

              // Update existing cards that have changed
              for (const localCard of existingLocalCards) {
                const cloudCard = existingCards?.find(
                  (c) => c.id === localCard.id
                );
                if (cloudCard) {
                  const localCardData = {
                    front: localCard.vietnamese || "",
                    back: JSON.stringify({
                      chinese: localCard.chinese || "",
                      pinyin: localCard.pinyin || "",
                      sentence: localCard.sentence || "",
                    }),
                  };

                  // Check if card needs updating
                  if (
                    cloudCard.front !== localCardData.front ||
                    cloudCard.back !== localCardData.back
                  ) {
                    const { error: updateError } = await supabase
                      .from("flashcards")
                      .update(localCardData)
                      .eq("id", localCard.id);

                    if (updateError) {
                      console.error(
                        `[Sync] Error updating card ${localCard.id}:`,
                        updateError
                      );
                    } else {
                      console.log(
                        `[Sync] Updated card "${localCard.chinese}" in "${list.name}"`
                      );
                    }
                  }
                }
              }
            }
          } else if (selectError?.code !== "PGRST116") {
            // List doesn't exist in cloud (but it's not a "not found" error)
            console.error("[Sync] Error checking existing list:", selectError);
            continue;
          } else {
            // List was deleted from cloud - treat as new
            const { data: recreatedList, error: recreateError } = await supabase
              .from("flashcard_lists")
              .insert({
                name: list.name,
              })
              .select()
              .single();

            if (recreateError) {
              console.error(
                "[Sync] Error recreating deleted list:",
                recreateError
              );
              continue;
            }

            list.id = recreatedList.id;
            console.log(
              `[Sync] Recreated deleted list "${list.name}" with new ID ${recreatedList.id}`
            );
          }
        }
      }

      // Save updated local data with cloud UUIDs
      localStorage.setItem("flashcard-lists", JSON.stringify(localLists));

      // Dispatch event to update UI
      window.dispatchEvent(
        new CustomEvent("localStorageChange", {
          detail: { key: "flashcard-lists", value: localLists },
        })
      );

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
        );

      if (listsError) {
        console.error("[Sync] Error fetching from cloud:", listsError);
        return null;
      }

      const localData = localStorage.getItem("flashcard-lists");
      const existingLocalLists = localData ? JSON.parse(localData) : [];

      const cloudFormat =
        cloudLists?.map((list) => ({
          id: list.id, // Use cloud UUID directly
          name: list.name,
          cards:
            list.flashcards?.map((card) => {
              try {
                const backData = JSON.parse(card.back);
                return {
                  id: card.id, // Use cloud UUID directly
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

        setSyncStatus((prev) => ({
          ...prev,
          lastSyncTime: new Date(),
        }));
      } else {
        console.log("[Sync] Cloud data fetched for manual sync processing");

        setSyncStatus((prev) => ({
          ...prev,
          lastSyncTime: new Date(),
        }));
      }

      // Always return the cloud data for manual sync to use
      return cloudFormat;
    } catch (error) {
      console.error("[Sync] Error syncing from cloud:", error);
      return null;
    }
  }, [syncStatus.isOnline, supabase]);

  const syncDeletions = useCallback(async () => {
    if (!syncStatus.isOnline || typeof window === "undefined") return;

    try {
      // Get current local data
      const localData = localStorage.getItem("flashcard-lists");
      if (!localData) return;

      const localLists = JSON.parse(localData);

      // For each list, compare with cloud data to find deletions
      for (const localList of localLists) {
        // Skip new lists that don't exist in cloud yet
        if (
          typeof localList.id === "number" ||
          String(localList.id).startsWith("temp_")
        ) {
          continue;
        }

        // Get cloud cards for this list
        const { data: cloudCards, error } = await supabase
          .from("flashcards")
          .select("id")
          .eq("list_id", localList.id);

        if (error) {
          console.error(
            "[Sync] Error fetching cloud cards for deletion sync:",
            error
          );
          continue;
        }

        const cloudCardIds = new Set(cloudCards?.map((card) => card.id) || []);
        const localCardIds = new Set(
          localList.cards
            .filter(
              (card: any) => typeof card.id === "string" && card.id.length > 10
            ) // Only UUIDs
            .map((card: any) => card.id)
        );

        // Find cards that exist in cloud but not locally (were deleted locally)
        const cardsToDelete = Array.from(cloudCardIds).filter(
          (id) => !localCardIds.has(id)
        );

        if (cardsToDelete.length > 0) {
          console.log(
            `[Sync] Deleting ${cardsToDelete.length} cards from cloud for list "${localList.name}"`
          );

          const { error: deleteError } = await supabase
            .from("flashcards")
            .delete()
            .in("id", cardsToDelete);

          if (deleteError) {
            console.error(
              "[Sync] Error deleting cards from cloud:",
              deleteError
            );
          } else {
            console.log(
              `[Sync] Successfully deleted ${cardsToDelete.length} cards from cloud`
            );
          }
        }
      }
    } catch (error) {
      console.error("[Sync] Error in deletion sync:", error);
    }
  }, [syncStatus.isOnline, supabase]);

  const forceSyncFromCloud = useCallback(async () => {
    if (!syncStatus.isOnline || typeof window === "undefined") return null;

    try {
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
        );

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

  const manualSync = useCallback(async () => {
    if (!syncStatus.isOnline) return null;

    // Manual sync now only pulls from cloud (force overwrite local)
    const cloudData = await forceSyncFromCloud();

    return cloudData;
  }, [forceSyncFromCloud, syncStatus.isOnline]);

  // Auto-sync function that pushes local changes to cloud immediately
  const autoSyncToCloud = useCallback(async () => {
    if (!syncStatus.isOnline || typeof window === "undefined") return;

    setSyncStatus((prev) => ({ ...prev, isSyncing: true }));

    try {
      const localData = localStorage.getItem("flashcard-lists");
      if (!localData) return;

      const localLists = JSON.parse(localData);

      for (const list of localLists) {
        // Check if this is a new list (has numeric/temp ID) or existing list (has UUID)
        const isNewList =
          typeof list.id === "number" || String(list.id).startsWith("temp_");

        if (isNewList) {
          // New list - create in cloud and update local with returned UUID
          const { data: newList, error: listError } = await supabase
            .from("flashcard_lists")
            .insert({
              name: list.name,
            })
            .select()
            .single();

          if (listError) {
            console.error("[Auto-Sync] Error creating new list:", listError);
            continue;
          }

          // Update local list with cloud UUID
          list.id = newList.id;
          console.log(
            `[Auto-Sync] Created new list "${list.name}" with ID ${newList.id}`
          );

          // Sync cards for the new list
          if (list.cards && list.cards.length > 0) {
            const cardsToInsert = list.cards.map((card: any) => ({
              list_id: newList.id,
              front: card.vietnamese || "",
              back: JSON.stringify({
                chinese: card.chinese || "",
                pinyin: card.pinyin || "",
                sentence: card.sentence || "",
              }),
            }));

            const { data: newCards, error: cardsError } = await supabase
              .from("flashcards")
              .insert(cardsToInsert)
              .select();

            if (cardsError) {
              console.error(
                "[Auto-Sync] Error syncing cards for new list:",
                cardsError
              );
            } else {
              // Update local cards with cloud UUIDs
              newCards?.forEach((cloudCard, index) => {
                if (list.cards[index]) {
                  list.cards[index].id = cloudCard.id;
                }
              });
              console.log(
                `[Auto-Sync] Synced ${newCards?.length} cards for new list "${list.name}"`
              );
            }
          }
        } else {
          // Existing list with UUID - try to update it
          const { data: existingList, error: selectError } = await supabase
            .from("flashcard_lists")
            .select("id, name")
            .eq("id", list.id)
            .single();

          if (existingList) {
            // List exists - update if name changed
            if (existingList.name !== list.name) {
              const { error: updateError } = await supabase
                .from("flashcard_lists")
                .update({ name: list.name })
                .eq("id", list.id);

              if (updateError) {
                console.error(
                  "[Auto-Sync] Error updating list name:",
                  updateError
                );
                continue;
              }
              console.log(
                `[Auto-Sync] Updated list name from "${existingList.name}" to "${list.name}"`
              );
            }

            // Sync cards for existing list
            if (list.cards && list.cards.length > 0) {
              // Get existing cards
              const { data: existingCards } = await supabase
                .from("flashcards")
                .select("id, front, back")
                .eq("list_id", list.id);

              const existingCardIds = new Set(
                existingCards?.map((card) => card.id) || []
              );

              // Find new cards (cards without UUIDs or not in cloud)
              const newCards = list.cards.filter(
                (card: any) =>
                  typeof card.id === "number" || !existingCardIds.has(card.id)
              );

              // Find existing cards that might have been updated
              const existingLocalCards = list.cards.filter(
                (card: any) =>
                  typeof card.id === "string" &&
                  card.id.length > 10 &&
                  existingCardIds.has(card.id)
              );

              // Insert new cards
              if (newCards.length > 0) {
                const cardsToInsert = newCards.map((card: any) => ({
                  list_id: list.id,
                  front: card.vietnamese || "",
                  back: JSON.stringify({
                    chinese: card.chinese || "",
                    pinyin: card.pinyin || "",
                    sentence: card.sentence || "",
                  }),
                }));

                const { data: insertedCards, error: cardsError } =
                  await supabase
                    .from("flashcards")
                    .insert(cardsToInsert)
                    .select();

                if (cardsError) {
                  console.error(
                    "[Auto-Sync] Error syncing new cards:",
                    cardsError
                  );
                } else {
                  // Update local cards with cloud UUIDs
                  insertedCards?.forEach((cloudCard, index) => {
                    const localCard = newCards[index];
                    if (localCard) {
                      localCard.id = cloudCard.id;
                    }
                  });
                  console.log(
                    `[Auto-Sync] Synced ${insertedCards?.length} new cards for "${list.name}"`
                  );
                }
              }

              // Update existing cards that have changed
              for (const localCard of existingLocalCards) {
                const cloudCard = existingCards?.find(
                  (c) => c.id === localCard.id
                );
                if (cloudCard) {
                  const localCardData = {
                    front: localCard.vietnamese || "",
                    back: JSON.stringify({
                      chinese: localCard.chinese || "",
                      pinyin: localCard.pinyin || "",
                      sentence: localCard.sentence || "",
                    }),
                  };

                  // Check if card needs updating
                  if (
                    cloudCard.front !== localCardData.front ||
                    cloudCard.back !== localCardData.back
                  ) {
                    const { error: updateError } = await supabase
                      .from("flashcards")
                      .update(localCardData)
                      .eq("id", localCard.id);

                    if (updateError) {
                      console.error(
                        `[Auto-Sync] Error updating card ${localCard.id}:`,
                        updateError
                      );
                    } else {
                      console.log(
                        `[Auto-Sync] Updated card "${localCard.chinese}" in "${list.name}"`
                      );
                    }
                  }
                }
              }

              // Handle deletions - find cards in cloud but not in local
              const localCardIds = new Set(
                list.cards
                  .filter(
                    (card: any) =>
                      typeof card.id === "string" && card.id.length > 10
                  )
                  .map((card: any) => card.id)
              );

              const cardsToDelete = Array.from(existingCardIds).filter(
                (id) => !localCardIds.has(id)
              );

              if (cardsToDelete.length > 0) {
                console.log(
                  `[Auto-Sync] Deleting ${cardsToDelete.length} cards from cloud for list "${list.name}"`
                );

                const { error: deleteError } = await supabase
                  .from("flashcards")
                  .delete()
                  .in("id", cardsToDelete);

                if (deleteError) {
                  console.error(
                    "[Auto-Sync] Error deleting cards from cloud:",
                    deleteError
                  );
                } else {
                  console.log(
                    `[Auto-Sync] Successfully deleted ${cardsToDelete.length} cards from cloud`
                  );
                }
              }
            }
          } else if (selectError?.code !== "PGRST116") {
            // List doesn't exist in cloud (but it's not a "not found" error)
            console.error(
              "[Auto-Sync] Error checking existing list:",
              selectError
            );
            continue;
          } else {
            // List was deleted from cloud - treat as new
            const { data: recreatedList, error: recreateError } = await supabase
              .from("flashcard_lists")
              .insert({
                name: list.name,
              })
              .select()
              .single();

            if (recreateError) {
              console.error(
                "[Auto-Sync] Error recreating deleted list:",
                recreateError
              );
              continue;
            }

            list.id = recreatedList.id;
            console.log(
              `[Auto-Sync] Recreated deleted list "${list.name}" with new ID ${recreatedList.id}`
            );
          }
        }
      }

      // Save updated local data with cloud UUIDs
      localStorage.setItem("flashcard-lists", JSON.stringify(localLists));

      // Dispatch event to update UI
      window.dispatchEvent(
        new CustomEvent("localStorageChange", {
          detail: { key: "flashcard-lists", value: localLists },
        })
      );

      setSyncStatus((prev) => ({
        ...prev,
        lastSyncTime: new Date(),
        pendingChanges: 0,
      }));
      console.log("[Auto-Sync] Successfully synced to cloud");
    } catch (error) {
      console.error("[Auto-Sync] Sync error:", error);
    } finally {
      setSyncStatus((prev) => ({ ...prev, isSyncing: false }));
    }
  }, [syncStatus.isOnline, supabase]);

  return {
    syncStatus,
    syncToCloud,
    syncFromCloud,
    forceSyncFromCloud,
    manualSync,
    syncDeletions,
    autoSyncToCloud,
  };
}
