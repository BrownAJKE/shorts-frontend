/**
 * Example component demonstrating TanStack Query usage
 * This shows how to use the custom hooks for data fetching
 */

'use client'

import React from 'react'
import { useVideoProjects, useCreateVideoProject, useErrorHandler } from '@/lib/hooks'
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'

export function VideoProjectsExample() {
  const { data: projects, isLoading, error, refetch } = useVideoProjects()
  const createProjectMutation = useCreateVideoProject()
  const handleError = useErrorHandler()

  const handleCreateProject = async () => {
    try {
      await createProjectMutation.mutateAsync({
        user_context: 'Example project',
        voice: 'nova',
        script_style: 'narrative',
        animation_style: 'dynamic',
        caption_position: 'center',
        min_words: 2,
        max_words: 4,
      })
    } catch (error) {
      const errorMessage = handleError(error)
      console.error('Failed to create project:', errorMessage)
    }
  }

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-red-600 mb-4">
          Error: {handleError(error)}
        </div>
        <Button onClick={() => refetch()}>
          Retry
        </Button>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Video Projects</h2>
        <Button 
          onClick={handleCreateProject}
          disabled={createProjectMutation.isPending}
        >
          {createProjectMutation.isPending ? 'Creating...' : 'Create Project'}
        </Button>
      </div>
      
      {projects && projects.length > 0 ? (
        <div className="space-y-3">
          {projects.map((project) => (
            <div key={project.id} className="border rounded p-3">
              <div className="font-medium">{project.user_context || 'Untitled Project'}</div>
              <div className="text-sm text-gray-600">
                Status: {project.status} | Voice: {project.voice}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-gray-500 text-center py-8">
          No video projects found
        </div>
      )}
    </Card>
  )
}
