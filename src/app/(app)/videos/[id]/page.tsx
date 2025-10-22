"use client"

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import { Badge } from '@/components/Badge'
import { ProgressBar } from '@/components/ProgressBar'
import { 
  useVideoProject, 
  useProcessingStepsByProject,
  useDeleteVideoProject 
} from '@/lib/hooks'
import { 
  RiArrowLeftLine, 
  RiDownloadLine, 
  RiDeleteBinLine,
  RiRefreshLine,
  RiPlayLine,
  RiPauseLine,
  RiCheckLine,
  RiCloseLine,
  RiErrorWarningLine
} from '@remixicon/react'
import { formatDistanceToNow } from 'date-fns'

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

const getStepStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return <RiCheckLine className="w-5 h-5 text-green-600" />
    case 'failed':
      return <RiCloseLine className="w-5 h-5 text-red-600" />
    case 'processing':
      return <RiRefreshLine className="w-5 h-5 text-blue-600 animate-spin" />
    default:
      return <RiPauseLine className="w-5 h-5 text-gray-400" />
  }
}

const processingSteps = [
  { key: 'video_analysis', name: 'Video Analysis', description: 'Analyzing video content with AI' },
  { key: 'script_generation', name: 'Script Generation', description: 'Creating voiceover script' },
  { key: 'audio_generation', name: 'Audio Generation', description: 'Generating voiceover audio' },
  { key: 'audio_sync', name: 'Audio Sync', description: 'Synchronizing audio with video' },
  { key: 'video_composition', name: 'Video Composition', description: 'Composing final video' },
  { key: 'caption_rendering', name: 'Caption Rendering', description: 'Adding captions to video' },
]

export default function VideoProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string
  
  const [refreshKey, setRefreshKey] = useState(0)
  
  const { 
    data: project, 
    isLoading: projectLoading, 
    error: projectError,
    refetch: refetchProject
  } = useVideoProject(projectId)
  
  const { 
    data: processingSteps, 
    isLoading: stepsLoading 
  } = useProcessingStepsByProject(projectId)
  
  const deleteProjectMutation = useDeleteVideoProject()

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1)
    refetchProject()
  }

  const handleDeleteProject = async () => {
    if (confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      try {
        await deleteProjectMutation.mutateAsync(projectId)
        router.push('/videos')
      } catch (error) {
        console.error('Failed to delete project:', error)
      }
    }
  }

  const handleDownload = (fileType: string) => {
    window.open(`/api/videos/${projectId}/download/${fileType}`, '_blank')
  }

  if (projectLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
            <div className="space-y-4">
              <div className="h-48 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (projectError || !project) {
    return (
      <div className="p-6">
        <Card className="p-6">
          <div className="text-center">
            <RiErrorWarningLine className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-600 mb-2">
              Project Not Found
            </h2>
            <p className="text-gray-600 mb-4">
              The video project you're looking for doesn't exist or has been deleted.
            </p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => router.push('/videos')} variant="outline">
                <RiArrowLeftLine className="w-4 h-4 mr-2" />
                Back to Projects
              </Button>
              <Button onClick={handleRefresh}>
                <RiRefreshLine className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  const getProgressPercentage = () => {
    if (!project.progress || typeof project.progress !== 'object') return 0
    
    const steps = processingSteps.map(step => step.key)
    const completedSteps = steps.filter(step => 
      project.progress[step] && project.progress[step].status === 'completed'
    ).length
    
    return Math.round((completedSteps / steps.length) * 100)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.push('/videos')}
          >
            <RiArrowLeftLine className="w-4 h-4 mr-2" />
            Back to Projects
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {project.user_context || 'Untitled Project'}
            </h1>
            <p className="text-gray-600">
              Project ID: {project.id}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button onClick={handleRefresh} variant="outline">
            <RiRefreshLine className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          {project.status === 'ready' && (
            <Button onClick={() => handleDownload('final_video')}>
              <RiDownloadLine className="w-4 h-4 mr-2" />
              Download Video
            </Button>
          )}
          <Button
            onClick={handleDeleteProject}
            variant="outline"
            disabled={deleteProjectMutation.isPending}
          >
            <RiDeleteBinLine className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Project Status */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Project Status</h2>
              {getStatusBadge(project.status)}
            </div>
            
            {project.status === 'processing' && (
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Processing...</span>
                  <span>{getProgressPercentage()}%</span>
                </div>
                <ProgressBar value={getProgressPercentage()} />
              </div>
            )}
            
            {project.status === 'failed' && project.error_message && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <RiErrorWarningLine className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-red-800">Processing Failed</h4>
                    <p className="text-red-700 text-sm mt-1">{project.error_message}</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
              <div>
                <span className="text-gray-600">Created:</span>
                <p className="font-medium">
                  {formatDistanceToNow(new Date(project.created_at), { addSuffix: true })}
                </p>
              </div>
              <div>
                <span className="text-gray-600">Updated:</span>
                <p className="font-medium">
                  {formatDistanceToNow(new Date(project.updated_at), { addSuffix: true })}
                </p>
              </div>
            </div>
          </Card>

          {/* Processing Steps */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Processing Steps</h2>
            <div className="space-y-4">
              {processingSteps.map((step, index) => {
                const stepData = project.progress?.[step.key]
                const status = stepData?.status || 'pending'
                
                return (
                  <div key={step.key} className="flex items-center gap-4 p-3 border rounded-lg">
                    <div className="flex-shrink-0">
                      {getStepStatusIcon(status)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{step.name}</h3>
                        <Badge color={
                          status === 'completed' ? 'green' :
                          status === 'failed' ? 'red' :
                          status === 'processing' ? 'blue' : 'gray'
                        }>
                          {status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                      {stepData?.message && (
                        <p className="text-xs text-gray-500 mt-1">{stepData.message}</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Project Settings */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Project Settings</h2>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-gray-600">Voice:</span>
                <p className="font-medium capitalize">{project.voice}</p>
              </div>
              <div>
                <span className="text-gray-600">Script Style:</span>
                <p className="font-medium capitalize">{project.script_style}</p>
              </div>
              <div>
                <span className="text-gray-600">Animation Style:</span>
                <p className="font-medium capitalize">{project.animation_style}</p>
              </div>
              <div>
                <span className="text-gray-600">Caption Position:</span>
                <p className="font-medium capitalize">{project.caption_position}</p>
              </div>
              <div>
                <span className="text-gray-600">Caption Words:</span>
                <p className="font-medium">{project.min_words} - {project.max_words}</p>
              </div>
            </div>
          </Card>

          {/* Download Options */}
          {project.status === 'ready' && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Download Options</h2>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => handleDownload('final_video')}
                >
                  <RiDownloadLine className="w-4 h-4 mr-2" />
                  Final Video (with captions)
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => handleDownload('video_with_audio')}
                >
                  <RiDownloadLine className="w-4 h-4 mr-2" />
                  Video with Audio
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => handleDownload('audio')}
                >
                  <RiDownloadLine className="w-4 h-4 mr-2" />
                  Voiceover Audio
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => handleDownload('script')}
                >
                  <RiDownloadLine className="w-4 h-4 mr-2" />
                  Generated Script
                </Button>
              </div>
            </Card>
          )}

          {/* Results */}
          {project.results && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Results</h2>
              <div className="space-y-2 text-sm">
                {Object.entries(project.results).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-gray-600 capitalize">
                      {key.replace(/_/g, ' ')}:
                    </span>
                    <span className="font-medium">
                      {typeof value === 'string' ? value : 'Available'}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
