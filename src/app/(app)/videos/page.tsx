"use client"

import { useState } from 'react'
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import { ProgressBar } from '@/components/ProgressBar'
import { useVideoProjects } from '@/lib/hooks'
import { 
  RiRefreshLine, 
  RiVideoLine, 
  RiPlayLine, 
  RiCheckLine, 
  RiCloseLine,
  RiEyeLine,
  RiDownloadLine,
  RiSettings3Line,
  RiTimeLine
} from '@remixicon/react'
import { formatDistanceToNow } from 'date-fns'
import { CreateVideoProjectModal } from '@/components/ui/videos/CreateVideoProjectModal'

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

export default function VideosPage() {
  const [refreshKey, setRefreshKey] = useState(0)
  const [useApiData, setUseApiData] = useState(true) // Start with API data by default
  
  // Demo data organized by status
  const mockProjects = [
    {
      id: '1',
      user_context: 'Sample Video Project',
      status: 'ready',
      voice: 'nova',
      script_style: 'narrative',
      animation_style: 'dynamic',
      caption_position: 'center',
      min_words: 2,
      max_words: 4,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '4',
      user_context: 'Product Demo',
      status: 'ready',
      voice: 'echo',
      script_style: 'conversational',
      animation_style: 'minimal',
      caption_position: 'center',
      min_words: 2,
      max_words: 4,
      created_at: new Date(Date.now() - 259200000).toISOString(),
      updated_at: new Date(Date.now() - 7200000).toISOString(),
    }
  ]

  const processingProjects = [
    {
      id: '2', 
      user_context: 'Marketing Video',
      status: 'processing',
      voice: 'alloy',
      script_style: 'promotional',
      animation_style: 'energetic',
      caption_position: 'bottom',
      min_words: 3,
      max_words: 5,
      created_at: new Date(Date.now() - 86400000).toISOString(),
      updated_at: new Date().toISOString(),
      progress: { video_analysis: { status: 'completed' }, script_generation: { status: 'completed' }, audio_generation: { status: 'processing' } }
    },
    {
      id: '5',
      user_context: 'Storytelling Video',
      status: 'processing',
      voice: 'fable',
      script_style: 'storytelling',
      animation_style: 'dynamic',
      caption_position: 'bottom',
      min_words: 3,
      max_words: 6,
      created_at: new Date(Date.now() - 432000000).toISOString(),
      updated_at: new Date().toISOString(),
      progress: { video_analysis: { status: 'completed' }, script_generation: { status: 'completed' }, audio_generation: { status: 'completed' }, audio_sync: { status: 'processing' } }
    }
  ]

  const failedProjects = [
    {
      id: '3',
      user_context: 'Educational Content',
      status: 'failed',
      voice: 'shimmer',
      script_style: 'educational',
      animation_style: 'subtle',
      caption_position: 'top',
      min_words: 2,
      max_words: 3,
      created_at: new Date(Date.now() - 172800000).toISOString(),
      updated_at: new Date(Date.now() - 3600000).toISOString(),
      error_message: 'Audio generation failed - please retry'
    }
  ]

  const data = [
    {
      status: 'Ready',
      icon: RiCheckLine,
      iconColor: 'text-green-500',
      projects: mockProjects,
    },
    {
      status: 'Processing',
      icon: RiSettings3Line,
      iconColor: 'text-blue-500',
      projects: processingProjects,
    },
    {
      status: 'Failed',
      icon: RiTimeLine,
      iconColor: 'text-orange-500',
      projects: failedProjects,
    },
  ]
  
  const { 
    data: projects, 
    isLoading, 
    error, 
    refetch 
  } = useVideoProjects({ refreshKey })

  // Show API data when available, fallback to demo data
  const displayData = useApiData && projects && projects.length > 0 
    ? [
        {
          status: 'Ready',
          icon: RiCheckLine,
          iconColor: 'text-green-500',
          projects: projects.filter(p => p.status === 'ready'),
        },
        {
          status: 'Processing',
          icon: RiSettings3Line,
          iconColor: 'text-blue-500',
          projects: projects.filter(p => p.status === 'processing'),
        },
        {
          status: 'Failed',
          icon: RiTimeLine,
          iconColor: 'text-orange-500',
          projects: projects.filter(p => p.status === 'failed'),
        },
      ]
    : data

  const isUsingDemoData = !useApiData || !projects || projects.length === 0

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1)
    setUseApiData(true)
    refetch()
  }

  const handleUseDemoData = () => {
    setUseApiData(false)
  }

  const getProgressPercentage = (progress: any) => {
    if (!progress || typeof progress !== 'object') return 0
    
    const steps = ['video_analysis', 'script_generation', 'audio_generation', 'audio_sync', 'video_composition', 'caption_rendering']
    const completedSteps = steps.filter(step => 
      progress[step] && progress[step].status === 'completed'
    ).length
    
    return Math.round((completedSteps / steps.length) * 100)
  }

  const statusColor = {
    'Ready': 'bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-400/10 dark:text-green-400 dark:ring-green-400/20',
    'Processing': 'bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-400/10 dark:text-blue-400 dark:ring-blue-400/20',
    'Failed': 'bg-orange-50 text-orange-700 ring-orange-600/20 dark:bg-orange-400/10 dark:text-orange-400 dark:ring-orange-400/20',
  }

  return (
    <>
      <section aria-labelledby="video-projects-overview">
        <h1
          id="video-projects-overview"
          className="scroll-mt-10 text-lg font-semibold text-gray-900 sm:text-xl dark:text-gray-50"
        >
          Video Projects
        </h1>
        <p className="mt-1 text-sm leading-6 text-gray-500">
          Manage and track your video processing projects
        </p>
        
        {/* Stats Cards */}
        <div className="mt-4 grid grid-cols-1 gap-4 sm:mt-8 sm:grid-cols-2 lg:mt-10 xl:grid-cols-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Projects</p>
                <p className="text-2xl font-bold text-gray-900">
                  {displayData.reduce((sum, category) => sum + category.projects.length, 0)}
                </p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <RiVideoLine className="w-4 h-4 text-blue-600" />
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Processing</p>
                <p className="text-2xl font-bold text-orange-600">
                  {displayData.find(cat => cat.status === 'Processing')?.projects.length || 0}
                </p>
              </div>
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <RiPlayLine className="w-4 h-4 text-orange-600" />
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ready</p>
                <p className="text-2xl font-bold text-green-600">
                  {displayData.find(cat => cat.status === 'Ready')?.projects.length || 0}
                </p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <RiCheckLine className="w-4 h-4 text-green-600" />
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Failed</p>
                <p className="text-2xl font-bold text-red-600">
                  {displayData.find(cat => cat.status === 'Failed')?.projects.length || 0}
                </p>
              </div>
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <RiCloseLine className="w-4 h-4 text-red-600" />
              </div>
            </div>
          </Card>
        </div>
      </section>

      <section aria-labelledby="video-projects-list">
        <div className="mt-16 flex items-center justify-between">
          <h2
            id="video-projects-list"
            className="scroll-mt-8 text-lg font-semibold text-gray-900 sm:text-xl dark:text-gray-50"
          >
            Projects
          </h2>
          <div className="flex gap-3">
            <Button onClick={handleRefresh} variant="secondary">
              <RiRefreshLine className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <CreateVideoProjectModal onSuccess={handleRefresh} />
          </div>
        </div>

        {isUsingDemoData && (
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-blue-800">
                <strong>Demo Mode:</strong> No projects found in your account. Showing sample data. 
                {error && ' API connection failed - '}
                <button 
                  onClick={handleRefresh}
                  className="underline hover:no-underline"
                >
                  Try connecting to API
                </button>
              </p>
              <Button 
                onClick={handleUseDemoData} 
                variant="light" 
                className="text-xs"
              >
                Keep Demo Data
              </Button>
            </div>
          </div>
        )}

        <div className="mt-4 sm:mt-6 lg:mt-10">
          {isLoading ? (
            <div className="animate-pulse space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          ) : (
            <Card className="bg-gray-50 p-0 dark:bg-gray-900">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
                  Video Projects
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Check status of recent video projects
                </p>
              </div>
              
              {/* Tab Navigation */}
              <div className="bg-gray-50 px-6 dark:bg-gray-900">
                <div className="flex space-x-8 border-b border-gray-200 dark:border-gray-700">
                  {displayData.map((category) => (
                    <button
                      key={category.status}
                      className="pb-2.5 font-medium hover:border-gray-300 border-b-2 border-transparent hover:border-gray-300"
                    >
                      <div className="flex items-center space-x-2">
                        <category.icon
                          className={classNames(
                            category.iconColor,
                            'size-5'
                          )}
                          aria-hidden={true}
                        />
                        <span className="text-gray-900 dark:text-gray-50">
                          {category.status}
                        </span>
                        <span className="rounded bg-gray-200 px-2 py-1 text-xs font-semibold tabular-nums ring-1 ring-inset ring-gray-300 dark:bg-gray-800 dark:ring-gray-600">
                          {category.projects.length}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Content Panels */}
              <div className="bg-white pt-2 dark:bg-gray-950">
                {displayData.map((category) => (
                  <div
                    key={category.status}
                    className="space-y-4 px-6 pb-6 pt-2"
                  >
                    {category.projects.map((project) => (
                      <Card key={project.id}>
                        <div className="flex items-center justify-between space-x-4 sm:justify-start sm:space-x-2">
                          <h4 className="truncate text-sm font-medium text-gray-900 dark:text-gray-50">
                            {project.user_context || 'Untitled Project'}
                            {isUsingDemoData && (
                              <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                Demo
                              </span>
                            )}
                          </h4>
                          <span
                            className={classNames(
                              statusColor[category.status as keyof typeof statusColor],
                              'inline-flex items-center whitespace-nowrap rounded px-1.5 py-0.5 text-xs font-medium ring-1 ring-inset',
                            )}
                            aria-hidden={true}
                          >
                            {category.status}
                          </span>
                        </div>
                        
                        <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-4">
                          <div className="flex items-center space-x-1.5">
                            <RiVideoLine
                              className="size-5 text-gray-400 dark:text-gray-500"
                              aria-hidden={true}
                            />
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Voice: {project.voice}
                            </p>
                          </div>
                          <div className="flex items-center space-x-1.5">
                            <RiSettings3Line
                              className="size-5 text-gray-400 dark:text-gray-500"
                              aria-hidden={true}
                            />
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Style: {project.script_style}
                            </p>
                          </div>
                          <div className="flex items-center space-x-1.5">
                            <RiTimeLine
                              className="size-5 text-gray-400 dark:text-gray-500"
                              aria-hidden={true}
                            />
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Updated {formatDistanceToNow(new Date(project.updated_at), { addSuffix: true })}
                            </p>
                          </div>
                        </div>

                        {/* Progress Bar for Processing */}
                        {project.status === 'processing' && (project as any).progress && (
                          <div className="mt-4">
                            <div className="flex justify-between text-xs mb-1">
                              <span>Processing...</span>
                              <span>{getProgressPercentage((project as any).progress)}%</span>
                            </div>
                            <ProgressBar value={getProgressPercentage((project as any).progress)} />
                          </div>
                        )}

                        {/* Error Message for Failed */}
                        {project.status === 'failed' && (project as any).error_message && (
                          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-700">{(project as any).error_message}</p>
                          </div>
                        )}

                        <div className="mt-4 flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-50">
                              ID: {project.id.slice(0, 8)}...
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button variant="secondary">
                              <RiEyeLine className="w-4 h-4 mr-1" />
                              View
                            </Button>
                            {project.status === 'ready' && (
                              <Button variant="secondary">
                                <RiDownloadLine className="w-4 h-4 mr-1" />
                                Download
                              </Button>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </section>
    </>
  )
}