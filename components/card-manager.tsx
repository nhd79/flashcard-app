"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash2, Plus, ArrowLeft, Edit2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
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

  const [editingCard, setEditingCard] = useState<FlashCardData | null>(null)
  const [editForm, setEditForm] = useState({
    vietnamese: "",
    chinese: "",
    pinyin: "",
    sentence: "",
  })
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const addCard = () => {
    if (!newCard.vietnamese.trim() || !newCard.chinese.trim()) return

    const newId = Math.max(...currentList.cards.map((c) => c.id), 0) + 1
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
  }

  const openEditModal = (card: FlashCardData) => {
    setEditingCard(card)
    setEditForm({
      vietnamese: card.vietnamese,
      chinese: card.chinese,
      pinyin: card.pinyin || "",
      sentence: card.sentence || "",
    })
    setIsEditDialogOpen(true)
  }

  const closeEditModal = () => {
    setEditingCard(null)
    setEditForm({ vietnamese: "", chinese: "", pinyin: "", sentence: "" })
    setIsEditDialogOpen(false)
  }

  const saveEditedCard = () => {
    if (!editingCard || !editForm.vietnamese.trim() || !editForm.chinese.trim()) return

    const updatedCard: FlashCardData = {
      ...editingCard,
      vietnamese: editForm.vietnamese.trim(),
      chinese: editForm.chinese.trim(),
      pinyin: editForm.pinyin.trim() || undefined,
      sentence: editForm.sentence.trim() || undefined,
    }

    const updatedList = {
      ...currentList,
      cards: currentList.cards.map(card => 
        card.id === editingCard.id ? updatedCard : card
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
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => removeCard(card.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Edit Modal */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit2 className="h-5 w-5" />
              Chỉnh sửa thẻ học
            </DialogTitle>
          </DialogHeader>
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
        </DialogContent>
      </Dialog>
    </div>
  )
}
