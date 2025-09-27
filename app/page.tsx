"use client"

import { useState, useEffect } from "react"
import { FlashCardDeck } from "@/components/flash-card-deck"
import { CardManager } from "@/components/card-manager"
import { ListManager, type CardList, type FlashCardData } from "@/components/list-manager"
import { Breadcrumb } from "@/components/breadcrumb"
import { Button } from "@/components/ui/button"
import { Settings } from "lucide-react"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { useSyncManager } from "@/hooks/use-sync-manager"
import { SyncStatus } from "@/components/sync-status"

export default function Home() {
  const [lists, setLists] = useLocalStorage<CardList[]>("flashcard-lists", [])
  const [currentList, setCurrentList] = useState<CardList | null>(null)
  const [showCardManager, setShowCardManager] = useState(false)
  const [currentView, setCurrentView] = useState<"lists" | "study" | "manage">("lists")
  const [isLoading, setIsLoading] = useState(true);

  const { forceSyncFromCloud } = useSyncManager()

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedLists = localStorage.getItem("flashcard-lists");
      if (storedLists) {
        setLists(JSON.parse(storedLists));
      }
      setIsLoading(false);
    }
  }, []);

  // Users can manually sync using the sync button

  const handleSelectList = (list: CardList) => {
    setCurrentList(list)
    setCurrentView("study")
  }

  const handleManageCards = (list: CardList) => {
    setCurrentList(list)
    setCurrentView("manage")
  }

  const handleListsChange = (newLists: CardList[]) => {
    setLists(newLists)
  }

  const handleListChange = (updatedList: CardList) => {
    const updatedLists = lists.map((list) => (list.id === updatedList.id ? updatedList : list))
    setLists(updatedLists)
    setCurrentList(updatedList)
  }

  const getBreadcrumbItems = () => {
    const items = []

    if (currentList && currentView !== "lists") {
      items.push({
        label: "Danh sách",
        onClick: () => setCurrentView("lists"),
      })

      items.push({
        label: currentList.name,
        onClick: currentView === "manage" ? () => setCurrentView("study") : undefined,
      })
    }

    if (currentView === "manage") {
      items.push({
        label: "Quản lý thẻ",
      })
    }

    return items
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card relative">
        <div className="container mx-auto px-4 py-6">
          <div className="space-y-4">
            {/* Title - Centered */}
            <div className="text-center">
              <h1 className="text-3xl font-bold text-card-foreground">Chinese Flashcards</h1>
              <p className="text-muted-foreground">Made by Yêu ơi ❤️</p>
            </div>
            

            
            {/* Sync Status - Centered */}
            <div className="flex justify-center">
              <SyncStatus />
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-center">
          <div className="w-full max-w-4xl">
            {isLoading ? (
              <div className="flex justify-center items-center min-h-[200px]">
                <div className="animate-pulse text-muted-foreground">Loading...</div>
              </div>
            ) : (
              <>
                {currentView !== "lists" && <Breadcrumb items={getBreadcrumbItems()} />}

                {currentView === "lists" ? (
                  <ListManager
                    lists={lists}
                    onListsChange={handleListsChange}
                    onSelectList={handleSelectList}
                    onManageCards={handleManageCards}
                  />
                ) : currentView === "manage" && currentList ? (
                  <CardManager
                    currentList={currentList}
                    onListChange={handleListChange}
                    onClose={() => setCurrentView("lists")}
                  />
                ) : currentList ? (
                  <div className="space-y-6">
                    <div className="flex justify-center gap-4">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentView("manage")}
                        className="flex items-center gap-2"
                      >
                        <Settings className="h-4 w-4" />
                        Quản lý thẻ
                      </Button>
                    </div>
                    <FlashCardDeck cards={currentList.cards} mode="vietnamese" />
                  </div>
                ) : null}
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
