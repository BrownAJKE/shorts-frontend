"use client"

import { useState } from 'react'
import { Card } from '@/components/Card'
import { Button } from '@/components/Button'
import { ProgressBar } from '@/components/ProgressBar'
import { VideoProjectStatusBadge } from './VideoProjectStatusBadge'
import { VideoProject } from '@/lib/api'
import { 
  RiEyeLine, 
  RiDownloadLine, 
  RiDeleteBinLine,
  RiMoreLine,
  RiRefreshLine
} from '@remixicon/react'
import { formatDistanceToNow } from 'date-fns'

interface VideoProjectCardProps {
  project: VideoProject
  onView: (projectId: string) => void
  onDownload?: (projectId: string, fileType: string) => void
  onDelete?: (projectId: string) => void
  onRetry?: (projectId: string) => void
  className?: string
}

const getProgressPercentage = (progress: any) => {
  if (!progress || typeof progress !== 'object') return 0
  
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

export function VideoProjectCard({ 
  project, 
  onView, 
  onDownload, 
  onDelete,
  onRetry,
  className 
}: VideoProjectCardProps) {
  const [showActions, setShowActions] = useState(false)
  
  const progressPercentage = getProgressPercentage(project.progress)
  
  const handleDownload = (fileType: string) => {
    if (onDownload) {
      onDownload(project.id, fileType)
    }
  }
  
  const handleDelete = () => {
    if (onDelete && confirm('Are you sure you want to delete this project?')) {
      onDelete(project.id)
    }
  }

  const handleRetry = () => {
    if (onRetry && confirm('Are you sure you want to retry this project?')) {
      onRetry(project.id)
    }
  }

  return (
    <Card className={`p-4 hover:shadow-md transition-shadow ${className}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 truncate">
            {project.user_context || 'Untitled Project'}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            ID: {project.id.slice(0, 8)}...
          </p>
        </div>
        <div className="flex items-center gap-2 ml-3">
          <VideoProjectStatusBadge status={project.status} showIcon />
          <Button
            variant="secondary"
            onClick={() => setShowActions(!showActions)}
          >
            <RiMoreLine className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Progress Bar for Processing Status */}
      {project.status === 'processing' && (
        <div className="mb-3">
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Processing...</span>
            <span>{progressPercentage}%</span>
          </div>
          <ProgressBar value={progressPercentage} />
        </div>
      )}

      {/* Error Message for Failed Status */}
      {project.status === 'failed' && project.error_message && (
        <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
          <div className="flex justify-between items-start">
            <span className="flex-1">{project.error_message}</span>
            {onRetry && (
              <Button
                variant="secondary"
                onClick={handleRetry}
                className="ml-2 text-xs"
              >
                <RiRefreshLine className="w-3 h-3 mr-1" />
                Retry
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Project Details */}
      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-3">
        <div>
          <span className="font-medium">Voice:</span>
          <span className="ml-1 capitalize">{project.voice}</span>
        </div>
        <div>
          <span className="font-medium">Style:</span>
          <span className="ml-1 capitalize">{project.script_style}</span>
        </div>
        <div>
          <span className="font-medium">Created:</span>
          <span className="ml-1">
            {formatDistanceToNow(new Date(project.created_at), { addSuffix: true })}
          </span>
        </div>
        <div>
          <span className="font-medium">Updated:</span>
          <span className="ml-1">
            {formatDistanceToNow(new Date(project.updated_at), { addSuffix: true })}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          onClick={() => onView(project.id)}
          className="flex-1"
        >
          <RiEyeLine className="w-4 h-4 mr-1" />
          View
        </Button>
        
        {project.status === 'ready' && onDownload && (
          <Button
            variant="secondary"
            onClick={() => handleDownload('final_video')}
          >
            <RiDownloadLine className="w-4 h-4" />
          </Button>
        )}
        
        {project.status === 'failed' && onRetry && (
          <Button
            variant="secondary"
            onClick={handleRetry}
          >
            <RiRefreshLine className="w-4 h-4" />
          </Button>
        )}
        
        {onDelete && (
          <Button
            variant="secondary"
            onClick={handleDelete}
          >
            <RiDeleteBinLine className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Expanded Actions */}
      {showActions && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              onClick={() => onView(project.id)}
            >
              <RiEyeLine className="w-4 h-4 mr-1" />
              View Details
            </Button>
            
            {project.status === 'ready' && onDownload && (
              <>
                <Button
                  variant="secondary"
                  onClick={() => handleDownload('final_video')}
                >
                  <RiDownloadLine className="w-4 h-4 mr-1" />
                  Final Video
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => handleDownload('audio')}
                >
                  <RiDownloadLine className="w-4 h-4 mr-1" />
                  Audio
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => handleDownload('script')}
                >
                  <RiDownloadLine className="w-4 h-4 mr-1" />
                  Script
                </Button>
              </>
            )}
            
            {project.status === 'failed' && onRetry && (
              <Button
                variant="secondary"
                onClick={handleRetry}
              >
                <RiRefreshLine className="w-4 h-4 mr-1" />
                Retry Project
              </Button>
            )}
          </div>
        </div>
      )}
    </Card>
  )
}
