"use client"

import { Badge } from "@/components/ui/badge"
import { Cloud, CloudOff, Loader2 } from "lucide-react"
import { useSyncManager } from "@/hooks/use-sync-manager"
import { useState, useEffect } from "react"

export function SyncStatus() {
  const { syncStatus, manualSync } = useSyncManager()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Don't render anything until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <div className="w-16 h-5 bg-muted animate-pulse rounded" />
        <div className="w-12 h-4 bg-muted animate-pulse rounded" />
      </div>
    )
  }

  const handleSync = async () => {
    if (syncStatus.isOnline && !syncStatus.isSyncing) {
      // Manual sync now only pulls from cloud
      await manualSync()
    }
  }

  const getOnlineStatus = () => {
    if (syncStatus.isSyncing) return { icon: Loader2, text: "Syncing...", variant: "secondary" as const }
    if (syncStatus.isOnline) return { icon: Cloud, text: "Online", variant: "default" as const }
    return { icon: CloudOff, text: "Offline", variant: "destructive" as const }
  }

  const onlineStatus = getOnlineStatus()
  const OnlineIcon = onlineStatus.icon

  return (
    <div className="flex items-center gap-2 text-sm">
      {/* Clickable Online Status Badge */}
      <Badge 
        variant={onlineStatus.variant} 
        className={`gap-1 ${syncStatus.isOnline && !syncStatus.isSyncing ? "cursor-pointer hover:opacity-80 transition-opacity" : "cursor-default"}`}
        onClick={handleSync}
        title={syncStatus.isOnline && !syncStatus.isSyncing ? "Click để đồng bộ từ cloud" : onlineStatus.text}
      >
        <OnlineIcon className={`h-3 w-3 ${syncStatus.isSyncing ? "animate-spin" : ""}`} />
        {onlineStatus.text}
      </Badge>

      {/* Last Sync Time */}
      {syncStatus.lastSyncTime && (
        <span className="text-xs text-muted-foreground">
          Last sync: {syncStatus.lastSyncTime.toLocaleTimeString()}
        </span>
      )}
    </div>
  )
}
