"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Cloud, CloudOff, Loader2, RefreshCcw, User, UserX } from "lucide-react"
import { useSyncManager } from "@/hooks/use-sync-manager"
import { useAuth } from "@/hooks/use-auth"
import { useState, useEffect } from "react"

export function SyncStatus() {
  const { syncStatus, syncToCloud, syncFromCloud } = useSyncManager()
  const { user, loading } = useAuth()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const handleSync = async () => {
    if (user) {
      await Promise.all([syncToCloud(), syncFromCloud()])
    }
  }

  const getAuthStatus = () => {
    if (loading) return { icon: Loader2, text: "Checking...", variant: "secondary" as const }
    if (user) return { icon: User, text: "Signed In", variant: "default" as const }
    return { icon: UserX, text: "Sign In Required", variant: "outline" as const }
  }

  const getOnlineStatus = () => {
    if (syncStatus.isSyncing) return { icon: Loader2, text: "Syncing...", variant: "secondary" as const }
    if (syncStatus.isOnline) return { icon: Cloud, text: "Online", variant: "default" as const }
    return { icon: CloudOff, text: "Offline", variant: "destructive" as const }
  }

  const authStatus = getAuthStatus()
  const onlineStatus = getOnlineStatus()
  const AuthIcon = authStatus.icon
  const OnlineIcon = onlineStatus.icon

  return (
    <div className="flex items-center gap-2 text-sm">
      {/* Authentication Status */}
      <Badge variant={authStatus.variant} className="gap-1">
        <AuthIcon className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
        {authStatus.text}
      </Badge>

      {/* Online Status */}
      <Badge variant={onlineStatus.variant} className="gap-1">
        <OnlineIcon className={`h-3 w-3 ${syncStatus.isSyncing ? "animate-spin" : ""}`} />
        {onlineStatus.text}
      </Badge>

      {/* Sync Button */}
      {user && syncStatus.isOnline && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSync}
          disabled={syncStatus.isSyncing}
          className="h-6 px-2 text-xs"
        >
          <RefreshCcw className={`h-3 w-3 ${syncStatus.isSyncing ? "animate-spin" : ""}`} />
        </Button>
      )}

      {/* Last Sync Time */}
      {syncStatus.lastSyncTime && (
        <span className="text-xs text-muted-foreground">
          Last sync: {syncStatus.lastSyncTime.toLocaleTimeString()}
        </span>
      )}
    </div>
  )
}
