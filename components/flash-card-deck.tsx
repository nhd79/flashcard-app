"use client"

import { useState, useEffect } from "react"
import { FlashCard } from "./flash-card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react"
import type { LanguageMode } from "./language-mode-selector.tsx"

interface FlashCardData {
  id: number
  vietnamese: string
  chinese: string
  pinyin?: string
  sentence?: string
}

interface FlashCardDeckProps {
  cards: FlashCardData[]
  mode: LanguageMode
}

const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export function FlashCardDeck({ cards, mode }: FlashCardDeckProps) {
  const [shuffledCards, setShuffledCards] = useState<FlashCardData[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [studiedCards, setStudiedCards] = useState<Set<number>>(new Set())

  useEffect(() => {
    if (cards.length > 0) {
      setShuffledCards(shuffleArray(cards))
      setCurrentIndex(0)
      setStudiedCards(new Set())
    }
  }, [cards])

  const currentCard = shuffledCards[currentIndex]
  const progress = shuffledCards.length > 0 ? ((currentIndex + 1) / shuffledCards.length) * 100 : 0

  const goToNext = () => {
    setStudiedCards((prev) => new Set(prev).add(currentCard.id))
    setCurrentIndex((prev) => (prev + 1) % shuffledCards.length)
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + shuffledCards.length) % shuffledCards.length)
  }

  const resetProgress = () => {
    setStudiedCards(new Set())
    setCurrentIndex(0)
    setShuffledCards(shuffleArray(cards))
  }

  if (!currentCard) return null

  return (
    <div className="flex flex-col items-center space-y-6">
      {/* Progress bar */}
      <div className="w-80 space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Tiến độ</span>
          <span>
            {currentIndex + 1}/{shuffledCards.length}
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Flash card */}
      <FlashCard
        key={currentCard.id}
        vietnamese={currentCard.vietnamese}
        chinese={currentCard.chinese}
        pinyin={currentCard.pinyin}
        sentence={currentCard.sentence}
        mode={mode}
      />

      {/* Navigation controls */}
      <div className="flex items-center space-x-4">
        <Button
          variant="outline"
          size="icon"
          onClick={goToPrevious}
          disabled={shuffledCards.length <= 1 || currentIndex === 0}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <Button
          onClick={goToNext}
          disabled={shuffledCards.length <= 1}
          className="font-medium hover:bg-primary/80 hover:text-primary-foreground"
        >
          <ChevronRight className="h-4 w-4 mr-2" />
          Thẻ tiếp theo
        </Button>

        <Button variant="outline" size="icon" onClick={resetProgress} title="Đặt lại tiến độ">
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
