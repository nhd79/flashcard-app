export interface Flashcard {
  id: string
  front: string
  back: string
}

export interface FlashcardList {
  id: string
  name: string
  cards: Flashcard[]
}
