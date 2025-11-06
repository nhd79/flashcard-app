"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, BookOpen, Edit2, Settings } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export interface FlashCardData {
  id: number
  vietnamese: string
  chinese: string
  pinyin?: string
  sentence?: string
}

export interface CardList {
  id: number
  name: string
  cards: FlashCardData[]
  createdAt: Date
}

interface ListManagerProps {
  lists: CardList[]
  onListsChange: (lists: CardList[]) => void
  onSelectList: (list: CardList) => void
  onManageCards: (list: CardList) => void
  isOnline?: boolean
}

export function ListManager({ lists, onListsChange, onSelectList, onManageCards, isOnline = false }: ListManagerProps) {
  const { toast } = useToast()
  const [newListName, setNewListName] = useState("")
  const [editingListId, setEditingListId] = useState<number | null>(null)
  const [editingName, setEditingName] = useState("")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleCreateList = () => {
    if (!newListName.trim()) return

    try {
      setErrorMessage(null)
      const newList: CardList = {
        id: Date.now(),
        name: newListName.trim(),
        cards: [],
        createdAt: new Date(),
      }

      onListsChange([...lists, newList])
      setNewListName("")
      toast({
        title: "✅ Thành công",
        description: "Danh sách đã được tạo và đồng bộ lên cloud",
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : "An error occurred"
      setErrorMessage(message)
      toast({
        title: "❌ Lỗi",
        description: message,
        variant: "destructive",
      })
    }
  }

  const handleEditList = (listId: number, newName: string) => {
    if (!newName.trim()) return

    try {
      setErrorMessage(null)
      onListsChange(lists.map((list) => (list.id === listId ? { ...list, name: newName.trim() } : list)))
      setEditingListId(null)
      setEditingName("")
      toast({
        title: "✅ Đã cập nhật",
        description: "Tên danh sách đã được cập nhật và đồng bộ lên cloud",
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : "An error occurred"
      setErrorMessage(message)
      setEditingListId(null)
      setEditingName("")
      toast({
        title: "❌ Lỗi",
        description: message,
        variant: "destructive",
      })
    }
  }

  const startEditing = (list: CardList) => {
    setEditingListId(list.id)
    setEditingName(list.name)
  }

  return (
    <div className="w-full max-w-4xl space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-card-foreground">Danh sách flashcard</h2>
      </div>

      {/* Offline Notice */}
      {!isOnline && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            ⚠️ Chế độ offline - Chỉ có thể xem danh sách. Kết nối internet để tạo hoặc chỉnh sửa danh sách.
          </p>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-sm text-red-800 dark:text-red-200">
            ❌ {errorMessage}
          </p>
        </div>
      )}

      {/* Create new list */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tạo danh sách mới</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Tên danh sách..."
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && isOnline && handleCreateList()}
              disabled={!isOnline}
            />
            <Button onClick={handleCreateList} disabled={!isOnline || !newListName.trim()}>
              <Plus className="h-4 w-4 mr-2" />
              {isOnline ? "Tạo" : "Offline"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lists grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {lists.map((list) => (
          <Card
            key={list.id}
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onSelectList(list)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                {editingListId === list.id ? (
                  <div className="flex-1 flex gap-2">
                    <Input
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleEditList(list.id, editingName)}
                      onBlur={() => handleEditList(list.id, editingName)}
                      className="text-sm"
                      autoFocus
                    />
                  </div>
                ) : (
                  <>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-primary" />
                      {list.name}
                    </CardTitle>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          startEditing(list)
                        }}
                        disabled={!isOnline}
                        title={isOnline ? "Đổi tên" : "Offline - Không thể đổi tên"}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">{list.cards.length} thẻ</p>
                  <p className="text-xs text-muted-foreground">
                    Tạo:{" "}
                    {list.createdAt instanceof Date
                      ? list.createdAt.toLocaleDateString("vi-VN")
                      : new Date(list.createdAt).toLocaleDateString("vi-VN")}
                  </p>
                </div>
                <div className="flex justify-end">
                  <Button
                    onClick={(e) => {
                      e.stopPropagation()
                      onManageCards(list)
                    }}
                    variant="outline"
                    size="sm"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
