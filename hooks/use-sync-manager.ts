"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"

interface SyncStatus {
  isOnline: boolean
  isSyncing: boolean
  lastSyncTime: Date | null
  pendingChanges: number
}

export function useSyncManager() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: typeof window !== "undefined" ? navigator.onLine : false,
    isSyncing: false,
    lastSyncTime: null,
    pendingChanges: 0,
  })

  const supabase = createClient()

  useEffect(() => {
    if (typeof window === "undefined") return

    const handleOnline = () => {
      setSyncStatus((prev) => ({ ...prev, isOnline: true }))
    }

    const handleOffline = () => {
      setSyncStatus((prev) => ({ ...prev, isOnline: false }))
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  const syncToCloud = useCallback(async () => {
    if (!syncStatus.isOnline || typeof window === "undefined") return

    setSyncStatus((prev) => ({ ...prev, isSyncing: true }))

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        console.log("[v0] No authenticated user, skipping sync")
        return
      }

      const localData = localStorage.getItem("flashcard-lists")
      if (!localData) return

      const localLists = JSON.parse(localData)

      for (const list of localLists) {
        const { data: existingList } = await supabase
          .from("flashcard_lists")
          .select("id, updated_at")
          .eq("name", list.name)
          .eq("user_id", user.id)
          .single()

        if (!existingList) {
          const { data: newList, error: listError } = await supabase
            .from("flashcard_lists")
            .insert({
              name: list.name,
              user_id: user.id,
            })
            .select()
            .single()

          if (listError) {
            console.error("[v0] Error syncing list:", listError)
            continue
          }

          if (list.cards && list.cards.length > 0) {
            const cardsToInsert = list.cards.map((card: any) => ({
              list_id: newList.id,
              front: card.vietnamese || card.front || "",
              back: `${card.chinese || card.back || ""} (${card.pinyin || ""})`,
              user_id: user.id,
            }))

            const { error: cardsError } = await supabase.from("flashcards").insert(cardsToInsert)

            if (cardsError) {
              console.error("[v0] Error syncing cards:", cardsError)
            }
          }
        }
      }

      setSyncStatus((prev) => ({
        ...prev,
        lastSyncTime: new Date(),
        pendingChanges: 0,
      }))
    } catch (error) {
      console.error("[v0] Sync error:", error)
    } finally {
      setSyncStatus((prev) => ({ ...prev, isSyncing: false }))
    }
  }, [syncStatus.isOnline, supabase])

  const syncFromCloud = useCallback(async () => {
    if (!syncStatus.isOnline || typeof window === "undefined") return

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data: cloudLists, error: listsError } = await supabase
        .from("flashcard_lists")
        .select(`
          id,
          name,
          created_at,
          flashcards (
            id,
            front,
            back,
            created_at
          )
        `)
        .eq("user_id", user.id)

      if (listsError) {
        console.error("[v0] Error fetching from cloud:", listsError)
        return
      }

      const localData = localStorage.getItem("flashcard-lists")
      if (!localData || localData === "[]") {
        const localFormat =
          cloudLists?.map((list) => ({
            id: list.id,
            name: list.name,
            cards:
              list.flashcards?.map((card) => ({
                id: card.id,
                vietnamese: card.front,
                chinese: card.back.split(" (")[0],
                pinyin: card.back.match(/$$([^)]+)$$/)?.[1] || "",
              })) || [],
            createdAt: new Date(list.created_at),
          })) || []

        localStorage.setItem("flashcard-lists", JSON.stringify(localFormat))
      }

      setSyncStatus((prev) => ({
        ...prev,
        lastSyncTime: new Date(),
      }))
    } catch (error) {
      console.error("[v0] Error syncing from cloud:", error)
    }
  }, [syncStatus.isOnline, supabase])

  const manualSync = useCallback(async () => {
    if (!syncStatus.isOnline) return
    await syncFromCloud()
    await syncToCloud()
  }, [syncFromCloud, syncToCloud])

  return {
    syncStatus,
    syncToCloud,
    syncFromCloud,
    manualSync,
  }
}
