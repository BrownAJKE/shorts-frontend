"use client"

import { Badge } from '@/components/Badge'
import { 
  RiPlayLine, 
  RiPauseLine, 
  RiCheckLine, 
  RiCloseLine, 
  RiRefreshLine,
  RiArchiveLine 
} from '@remixicon/react'

interface VideoProjectStatusBadgeProps {
  status: string
  showIcon?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const statusConfig = {
  draft: { 
    color: 'gray' as const, 
    label: 'Draft', 
    icon: RiPauseLine 
  },
  processing: { 
    color: 'blue' as const, 
    label: 'Processing', 
    icon: RiRefreshLine 
  },
  ready: { 
    color: 'green' as const, 
    label: 'Ready', 
    icon: RiCheckLine 
  },
  failed: { 
    color: 'red' as const, 
    label: 'Failed', 
    icon: RiCloseLine 
  },
  archived: { 
    color: 'gray' as const, 
    label: 'Archived', 
    icon: RiArchiveLine 
  },
}

export function VideoProjectStatusBadge({ 
  status, 
  showIcon = false, 
  size = 'md' 
}: VideoProjectStatusBadgeProps) {
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft
  const Icon = config.icon

  return (
    <Badge color={config.color} size={size}>
      {showIcon && <Icon className="w-3 h-3 mr-1" />}
      {config.label}
    </Badge>
  )
}
