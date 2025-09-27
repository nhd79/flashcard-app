"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash2, Plus, ArrowLeft, Edit2, X } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import type { FlashCardData, CardList } from "./list-manager"

interface CardManagerProps {
  currentList: CardList
  onListChange: (updatedList: CardList) => void
  onClose: () => void
}

export function CardManager({ currentList, onListChange, onClose }: CardManagerProps) {
  const [newCard, setNewCard] = useState({
    vietnamese: "",
    chinese: "",
    pinyin: "",
    sentence: "",
  })

  const [editingCardId, setEditingCardId] = useState<number | null>(null)
  const [cardToDelete, setCardToDelete] = useState<FlashCardData | null>(null)
  const [editForm, setEditForm] = useState({
    vietnamese: "",
    chinese: "",
    pinyin: "",
    sentence: "",
  })

  const addCard = () => {
    if (!newCard.vietnamese.trim() || !newCard.chinese.trim()) return

    // Generate a safe ID - handle empty cards array properly
    const existingIds = currentList.cards.map((c) => c.id).filter(id => typeof id === 'number' && !isNaN(id))
    const newId = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1

    const cardToAdd: FlashCardData = {
      id: newId,
      vietnamese: newCard.vietnamese.trim(),
      chinese: newCard.chinese.trim(),
      pinyin: newCard.pinyin.trim() || undefined,
      sentence: newCard.sentence.trim() || undefined,
    }

    const updatedList = {
      ...currentList,
      cards: [...currentList.cards, cardToAdd],
    }
    onListChange(updatedList)
    setNewCard({ vietnamese: "", chinese: "", pinyin: "", sentence: "" })
  }

  const removeCard = (id: number) => {
    const updatedList = {
      ...currentList,
      cards: currentList.cards.filter((card) => card.id !== id),
    }
    onListChange(updatedList)
    setCardToDelete(null)
  }

  const openEditModal = (card: FlashCardData) => {
    setEditingCardId(card.id)
    setEditForm({
      vietnamese: card.vietnamese,
      chinese: card.chinese,
      pinyin: card.pinyin || "",
      sentence: card.sentence || "",
    })
  }

  const closeEditModal = () => {
    setEditingCardId(null)
    setEditForm({ vietnamese: "", chinese: "", pinyin: "", sentence: "" })
  }

  const saveEditedCard = () => {
    if (editingCardId === null || !editForm.vietnamese.trim() || !editForm.chinese.trim()) return

    const originalCard = currentList.cards.find(card => card.id === editingCardId)
    if (!originalCard) {
      console.error('Could not find card with ID:', editingCardId)
      return
    }

    const updatedCard: FlashCardData = {
      ...originalCard,
      vietnamese: editForm.vietnamese.trim(),
      chinese: editForm.chinese.trim(),
      pinyin: editForm.pinyin.trim() || undefined,
      sentence: editForm.sentence.trim() || undefined,
    }

    const updatedList = {
      ...currentList,
      cards: currentList.cards.map(card => 
        card.id === editingCardId ? updatedCard : card
      ),
    }

    onListChange(updatedList)
    closeEditModal()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={onClose}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold">Quản lý thẻ học</h2>
            <p className="text-sm text-muted-foreground">{currentList.name}</p>
          </div>
        </div>
      </div>

      {/* Add new card form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Thêm thẻ mới
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="chinese">Tiếng Trung *</Label>
            <Input
              id="chinese"
              value={newCard.chinese}
              onChange={(e) => setNewCard((prev) => ({ ...prev, chinese: e.target.value }))}
              placeholder="Nhập từ tiếng Trung..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pinyin">Pinyin</Label>
            <Input
              id="pinyin"
              value={newCard.pinyin}
              onChange={(e) => setNewCard((prev) => ({ ...prev, pinyin: e.target.value }))}
              placeholder="Nhập phiên âm pinyin..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sentence">Đặt câu</Label>
            <Input
              id="sentence"
              value={newCard.sentence}
              onChange={(e) => setNewCard((prev) => ({ ...prev, sentence: e.target.value }))}
              placeholder="Đặt câu..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="vietnamese">Tiếng Việt *</Label>
            <Input
              id="vietnamese"
              value={newCard.vietnamese}
              onChange={(e) => setNewCard((prev) => ({ ...prev, vietnamese: e.target.value }))}
              placeholder="Nhập nghĩa tiếng Việt..."
            />
          </div>
          <Button onClick={addCard} disabled={!newCard.vietnamese.trim() || !newCard.chinese.trim()} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Thêm thẻ
          </Button>
        </CardContent>
      </Card>

      {/* Existing cards list */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Thẻ hiện có ({currentList.cards.length})</h3>
        <div
          className="space-y-2 overflow-y-auto overscroll-contain"
          style={{ WebkitOverflowScrolling: "touch", touchAction: "pan-y" }}
        >
          {currentList.cards.map((card) => (
            <Card key={card.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="font-medium">{card.chinese}</div>
                  {card.pinyin && <div className="text-sm text-muted-foreground">{card.pinyin}</div>}
                  {card.sentence && <div className="text-sm text-blue-600 italic">"{card.sentence}"</div>}
                  <div className="text-sm text-muted-foreground">→ {card.vietnamese}</div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => openEditModal(card)}
                    className="text-muted-foreground hover:text-primary"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setCardToDelete(card)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    {cardToDelete && (
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Bạn có chắc chắn không?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Hành động này sẽ xóa vĩnh viễn thẻ học sau. Bạn có muốn tiếp tục?
                        </AlertDialogDescription>
                          <div className="mt-4 rounded-md border bg-muted p-4">
                            <p className="font-semibold">{cardToDelete.chinese}</p>
                            <p className="text-sm text-muted-foreground">→ {cardToDelete.vietnamese}</p>
                          </div>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setCardToDelete(null)}>Hủy</AlertDialogCancel>
                        <AlertDialogAction onClick={() => removeCard(cardToDelete.id)}>Xóa</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                    )}
                  </AlertDialog>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Edit Modal */}
      {editingCardId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50" 
            onClick={closeEditModal}
          />

          {/* Modal Content */}
          <div className="relative bg-background border rounded-lg shadow-lg w-full max-w-md mx-4 p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Edit2 className="h-5 w-5" />
                <h3 className="text-lg font-semibold">Chỉnh sửa thẻ học</h3>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={closeEditModal}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Form */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-chinese">Tiếng Trung *</Label>
                <Input
                  id="edit-chinese"
                  value={editForm.chinese}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, chinese: e.target.value }))}
                  placeholder="Nhập từ tiếng Trung..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-pinyin">Pinyin</Label>
                <Input
                  id="edit-pinyin"
                  value={editForm.pinyin}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, pinyin: e.target.value }))}
                  placeholder="Nhập phiên âm pinyin..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-sentence">Đặt câu</Label>
                <Input
                  id="edit-sentence"
                  value={editForm.sentence}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, sentence: e.target.value }))}
                  placeholder="Đặt câu..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-vietnamese">Tiếng Việt *</Label>
                <Input
                  id="edit-vietnamese"
                  value={editForm.vietnamese}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, vietnamese: e.target.value }))}
                  placeholder="Nhập nghĩa tiếng Việt..."
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={closeEditModal}>
                  Hủy
                </Button>
                <Button 
                  onClick={saveEditedCard} 
                  disabled={!editForm.vietnamese.trim() || !editForm.chinese.trim()}
                >
                  Lưu thay đổi
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
