"use client"

import { useSyncManager } from "@/hooks/use-sync-manager"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Wifi, WifiOff, RefreshCw, Cloud } from "lucide-react"

export function SyncStatus() {
  const { syncStatus, manualSync } = useSyncManager()

  return (
    <div className="flex items-center gap-2">
      {/* Online/Offline indicator */}
      <Badge variant={syncStatus.isOnline ? "default" : "destructive"} className="flex items-center gap-1">
        {syncStatus.isOnline ? (
          <>
            <Wifi className="h-3 w-3" />
            Online
          </>
        ) : (
          <>
            <WifiOff className="h-3 w-3" />
            Offline
          </>
        )}
      </Badge>

      {/* Sync status */}
      {syncStatus.isOnline && (
        <Button
          variant="ghost"
          size="sm"
          onClick={manualSync}
          disabled={syncStatus.isSyncing}
          className="flex items-center gap-1"
        >
          {syncStatus.isSyncing ? (
            <>
              <RefreshCw className="h-3 w-3 animate-spin" />
              Syncing...
            </>
          ) : (
            <>
              <Cloud className="h-3 w-3" />
              Sync
            </>
          )}
        </Button>
      )}

      {/* Last sync time */}
      {syncStatus.lastSyncTime && (
        <span className="text-xs text-muted-foreground">Last sync: {syncStatus.lastSyncTime.toLocaleTimeString()}</span>
      )}
    </div>
  )
}
