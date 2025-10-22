"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/Button'
import { Badge } from '@/components/Badge'
import { DataTable } from '@/components/ui/data-table/DataTable'
import { 
  useVideoProjects, 
  useDeleteVideoProject 
} from '@/lib/hooks'
import { VideoProject } from '@/lib/api'
import { 
  RiEyeLine, 
  RiDeleteBinLine,
  RiDownloadLine,
  RiRefreshLine,
  RiMoreLine,
  RiPlayLine,
  RiPauseLine
} from '@remixicon/react'
import { formatDistanceToNow } from 'date-fns'
import { ColumnDef } from '@tanstack/react-table'

interface VideoProjectsDataTableProps {
  data: VideoProject[]
  isLoading: boolean
  onRefresh: () => void
}

const getStatusBadge = (status: string) => {
  const statusConfig = {
    draft: { color: 'gray', label: 'Draft' },
    processing: { color: 'blue', label: 'Processing' },
    ready: { color: 'green', label: 'Ready' },
    failed: { color: 'red', label: 'Failed' },
    archived: { color: 'gray', label: 'Archived' },
  }
  
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft
  
  return (
    <Badge color={config.color as any}>
      {config.label}
    </Badge>
  )
}

const getProgressPercentage = (progress: any) => {
  if (!progress || typeof progress !== 'object') return 0
  
  // Calculate progress based on completed steps
  const steps = [
    'video_analysis',
    'script_generation', 
    'audio_generation',
    'audio_sync',
    'video_composition',
    'caption_rendering'
  ]
  
  const completedSteps = steps.filter(step => 
    progress[step] && progress[step].status === 'completed'
  ).length
  
  return Math.round((completedSteps / steps.length) * 100)
}

export function VideoProjectsDataTable({ 
  data, 
  isLoading, 
  onRefresh 
}: VideoProjectsDataTableProps) {
  const router = useRouter()
  const deleteProjectMutation = useDeleteVideoProject()
  
  const handleViewProject = (projectId: string) => {
    router.push(`/videos/${projectId}`)
  }
  
  const handleDeleteProject = async (projectId: string) => {
    if (confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      try {
        await deleteProjectMutation.mutateAsync(projectId)
        onRefresh()
      } catch (error) {
        console.error('Failed to delete project:', error)
      }
    }
  }
  
  const handleDownload = (projectId: string, fileType: string) => {
    // This would trigger a download from the backend
    window.open(`/api/videos/${projectId}/download/${fileType}`, '_blank')
  }

  const columns: ColumnDef<VideoProject>[] = [
    {
      accessorKey: 'user_context',
      header: 'Project Name',
      cell: ({ row }) => (
        <div className="max-w-xs">
          <div className="font-medium text-gray-900 truncate">
            {row.original.user_context || 'Untitled Project'}
          </div>
          <div className="text-sm text-gray-500">
            ID: {row.original.id.slice(0, 8)}...
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {getStatusBadge(row.original.status)}
          {row.original.status === 'processing' && row.original.progress && (
            <div className="text-xs text-gray-500">
              {getProgressPercentage(row.original.progress)}%
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'voice',
      header: 'Voice',
      cell: ({ row }) => (
        <span className="text-sm text-gray-600 capitalize">
          {row.original.voice || 'nova'}
        </span>
      ),
    },
    {
      accessorKey: 'script_style',
      header: 'Style',
      cell: ({ row }) => (
        <span className="text-sm text-gray-600 capitalize">
          {row.original.script_style || 'narrative'}
        </span>
      ),
    },
    {
      accessorKey: 'created_at',
      header: 'Created',
      cell: ({ row }) => (
        <span className="text-sm text-gray-600">
          {formatDistanceToNow(new Date(row.original.created_at), { addSuffix: true })}
        </span>
      ),
    },
    {
      accessorKey: 'updated_at',
      header: 'Updated',
      cell: ({ row }) => (
        <span className="text-sm text-gray-600">
          {formatDistanceToNow(new Date(row.original.updated_at), { addSuffix: true })}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleViewProject(row.original.id)}
          >
            <RiEyeLine className="w-4 h-4" />
          </Button>
          
          {row.original.status === 'ready' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDownload(row.original.id, 'final_video')}
            >
              <RiDownloadLine className="w-4 h-4" />
            </Button>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDeleteProject(row.original.id)}
            disabled={deleteProjectMutation.isPending}
          >
            <RiDeleteBinLine className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ]

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <RiVideoLine className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No video projects yet</h3>
        <p className="text-gray-600 mb-6">
          Create your first video project to get started with automated video processing.
        </p>
        <Button onClick={onRefresh} variant="outline">
          <RiRefreshLine className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">
          Video Projects ({data.length})
        </h3>
        <Button onClick={onRefresh} variant="outline" size="sm">
          <RiRefreshLine className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>
      
      <DataTable 
        data={data} 
        columns={columns}
      />
    </div>
  )
}
