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

const initialCards: FlashCardData[] = [
  {
    id: 1,
    vietnamese: "Xin chào",
    chinese: "你好",
    pinyin: "nǐ hǎo",
    sentence: "你好，很高兴见到你。",
  },
  {
    id: 2,
    vietnamese: "Cảm ơn",
    chinese: "谢谢",
    pinyin: "xiè xiè",
    sentence: "谢谢你的帮助。",
  },
  {
    id: 3,
    vietnamese: "Chào buổi sáng",
    chinese: "早上好",
    pinyin: "zǎo shàng hǎo",
    sentence: "早上好，今天天气真好！",
  },
  {
    id: 4,
    vietnamese: "Bạn khỏe không?",
    chinese: "你好吗？",
    pinyin: "nǐ hǎo ma?",
    sentence: "好久不见，你好吗？",
  },
  {
    id: 5,
    vietnamese: "Tạm biệt",
    chinese: "再见",
    pinyin: "zài jiàn",
    sentence: "时间不早了，我们再见吧。",
  },
  {
    id: 6,
    vietnamese: "Xin lỗi",
    chinese: "对不起",
    pinyin: "duì bù qǐ",
    sentence: "对不起，我来晚了。",
  },
  {
    id: 7,
    vietnamese: "Anh yêu em ❤️",
    chinese: "我爱你",
    pinyin: "wǒ ài nǐ",
    sentence: "我爱你，永远不会改变。",
  },
  {
    id: 8,
    vietnamese: "Bao nhiêu tiền?",
    chinese: "多少钱？",
    pinyin: "duō shǎo qián?",
    sentence: "这个苹果多少钱？",
  },
]

export default function Home() {
  const [lists, setLists] = useLocalStorage<CardList[]>("flashcard-lists", [])
  const [currentList, setCurrentList] = useState<CardList | null>(null)
  const [showCardManager, setShowCardManager] = useState(false)
  const [currentView, setCurrentView] = useState<"lists" | "study" | "manage">("lists")

  const { syncFromCloud } = useSyncManager()

  useEffect(() => {
    if (lists.length === 0) {
      const defaultList: CardList = {
        id: 1,
        name: "Danh sách mặc định",
        cards: initialCards,
        createdAt: new Date("2024-01-01"), // Use static date to avoid hydration mismatch
      }
      setLists([defaultList])
    } else {
      // Update existing default list with new sentence data if it doesn't have sentences
      const defaultList = lists.find(list => list.name === "Danh sách mặc định")
      if (defaultList && defaultList.cards.length > 0 && !defaultList.cards[0].sentence) {
        const updatedDefaultList = {
          ...defaultList,
          cards: defaultList.cards.map(card => {
            const initialCard = initialCards.find(init => init.id === card.id)
            return initialCard ? { ...card, sentence: initialCard.sentence } : card
          })
        }
        const updatedLists = lists.map(list => 
          list.id === defaultList.id ? updatedDefaultList : list
        )
        setLists(updatedLists)
      }
    }
  }, [lists.length, setLists])

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
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-card-foreground">Chinese Flashcards</h1>
            <p className="text-muted-foreground">Made by Yêu ơi ❤️</p>
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
          </div>
        </div>
      </div>
    </main>
  )
}
