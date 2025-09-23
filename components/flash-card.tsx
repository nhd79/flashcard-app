"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Volume2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { LanguageMode } from "./language-mode-selector.tsx"

interface FlashCardProps {
  vietnamese: string
  chinese: string
  pinyin?: string
  sentence?: string
  mode: LanguageMode
  className?: string
}

export function FlashCard({ vietnamese, chinese, pinyin, sentence, mode, className }: FlashCardProps) {
  const [isFlipped, setIsFlipped] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [voicesLoaded, setVoicesLoaded] = useState(false)

  useEffect(() => {
    if ("speechSynthesis" in window) {
      const loadVoices = () => {
        const voices = speechSynthesis.getVoices()
        if (voices.length > 0) {
          setVoicesLoaded(true)
        }
      }

      loadVoices()

      speechSynthesis.addEventListener("voiceschanged", loadVoices)

      return () => {
        speechSynthesis.removeEventListener("voiceschanged", loadVoices)
      }
    }
  }, [])

  const handleFlip = () => {
    if (isAnimating) return

    setIsAnimating(true)
    setTimeout(() => {
      setIsFlipped(!isFlipped)
      setIsAnimating(false)
    }, 400)
  }

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation()

    if (isSpeaking) {
      speechSynthesis.cancel()
      setIsSpeaking(false)
      return
    }

    const textToSpeak = chinese
    const lang = "zh-CN"

    if ("speechSynthesis" in window && voicesLoaded) {
      speechSynthesis.cancel()

      const utterance = new SpeechSynthesisUtterance(textToSpeak)
      utterance.lang = lang
      utterance.rate = 0.8
      utterance.pitch = 1

      const voices = speechSynthesis.getVoices()
      const chineseVoice = voices.find(
        (voice) => voice.lang.startsWith("zh") || voice.lang.includes("Chinese") || voice.name.includes("Chinese"),
      )

      if (chineseVoice) {
        utterance.voice = chineseVoice
      }

      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => setIsSpeaking(false)
      utterance.onerror = () => setIsSpeaking(false)

      setTimeout(() => {
        speechSynthesis.speak(utterance)
      }, 100)
    }
  }

  const getFrontContent = () => {
    return {
      main: chinese,
      sub: pinyin,
    }
  }

  const getBackContent = () => {
    return {
      main: vietnamese,
      sub: null,
    }
  }

  const frontContent = getFrontContent()
  const backContent = getBackContent()

  return (
    <Card
      className={cn(
        "relative w-80 h-48 cursor-pointer select-none flash-card-hover",
        "bg-card border-border shadow-sm",
        isAnimating && "flip-animation",
        className,
      )}
      onClick={handleFlip}
    >
      {!isFlipped && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 z-10 h-8 w-8 p-0 hover:bg-muted/50"
          onClick={handleSpeak}
          disabled={isSpeaking || !voicesLoaded}
        >
          <Volume2 className={cn("h-4 w-4", isSpeaking && "text-primary animate-pulse")} />
        </Button>
      )}

      <div className="absolute inset-0 flex items-center justify-center p-6">
        <div className="text-center space-y-2">
          {!isFlipped ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-3xl font-medium text-card-foreground leading-relaxed text-balance">
                  {chinese}
                </p>
                {sentence && (
                  <p className="text-base text-muted-foreground leading-relaxed text-balance">
                    {sentence}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {pinyin && (
                <p className="text-2xl font-medium font-mono text-card-foreground leading-relaxed text-balance">
                  {pinyin}
                </p>
              )}
              <p className="text-lg text-muted-foreground tracking-wide">
                {vietnamese}
              </p>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
