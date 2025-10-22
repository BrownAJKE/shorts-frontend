"use client"

import { useState } from 'react'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { Label } from '@/components/Label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/Select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/Dialog'
import { useCreateVideoProject } from '@/lib/hooks'
import { RiAddLine, RiUploadLine, RiCloseLine } from '@remixicon/react'

interface CreateVideoProjectModalProps {
  onSuccess?: () => void
}

export function CreateVideoProjectModal({ onSuccess }: CreateVideoProjectModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    user_context: '',
    voice: 'nova',
    script_style: 'narrative',
    animation_style: 'dynamic',
    caption_position: 'center',
    min_words: 2,
    max_words: 4,
  })
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [musicFile, setMusicFile] = useState<File | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const createVideoProjectMutation = useCreateVideoProject()

  const voiceOptions = [
    { value: 'nova', label: 'Nova' },
    { value: 'alloy', label: 'Alloy' },
    { value: 'echo', label: 'Echo' },
    { value: 'fable', label: 'Fable' },
    { value: 'onyx', label: 'Onyx' },
    { value: 'shimmer', label: 'Shimmer' },
  ]

  const scriptStyleOptions = [
    { value: 'narrative', label: 'Narrative' },
    { value: 'conversational', label: 'Conversational' },
    { value: 'promotional', label: 'Promotional' },
    { value: 'educational', label: 'Educational' },
    { value: 'storytelling', label: 'Storytelling' },
  ]

  const animationStyleOptions = [
    { value: 'dynamic', label: 'Dynamic' },
    { value: 'subtle', label: 'Subtle' },
    { value: 'energetic', label: 'Energetic' },
    { value: 'minimal', label: 'Minimal' },
  ]

  const captionPositionOptions = [
    { value: 'center', label: 'Center' },
    { value: 'top', label: 'Top' },
    { value: 'bottom', label: 'Bottom' },
  ]

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleFileChange = (field: 'video' | 'music', file: File | null) => {
    if (field === 'video') {
      setVideoFile(file)
    } else {
      setMusicFile(file)
    }
    // Clear error when user selects file
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.user_context.trim()) {
      newErrors.user_context = 'Video context is required'
    }

    if (!videoFile) {
      newErrors.video = 'Video file is required'
    } else if (!videoFile.type.startsWith('video/')) {
      newErrors.video = 'Please select a valid video file'
    }

    if (musicFile && !musicFile.type.startsWith('audio/')) {
      newErrors.music = 'Please select a valid audio file'
    }

    if (formData.min_words >= formData.max_words) {
      newErrors.max_words = 'Max words must be greater than min words'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    
    try {
      await createVideoProjectMutation.mutateAsync({
        ...formData,
        video_file: videoFile!,
        music_file: musicFile || undefined,
      })

      // Reset form
      setFormData({
        user_context: '',
        voice: 'nova',
        script_style: 'narrative',
        animation_style: 'dynamic',
        caption_position: 'center',
        min_words: 2,
        max_words: 4,
      })
      setVideoFile(null)
      setMusicFile(null)
      setErrors({})
      setIsOpen(false)
      
      onSuccess?.()
    } catch (error) {
      console.error('Failed to create video project:', error)
      setErrors({ submit: 'Failed to create video project. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setIsOpen(false)
      setErrors({})
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <RiAddLine className="w-4 h-4 mr-2" />
          Create Project
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Video Project</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Video Context */}
          <div>
            <Label htmlFor="user_context" className="font-medium">
              Video Context *
            </Label>
            <Input
              id="user_context"
              value={formData.user_context}
              onChange={(e) => handleInputChange('user_context', e.target.value)}
              placeholder="Describe what your video is about..."
              className="mt-2"
            />
            {errors.user_context && (
              <p className="text-sm text-red-600 mt-1">{errors.user_context}</p>
            )}
          </div>

          {/* File Uploads */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="video_file" className="font-medium">
                Video File *
              </Label>
              <div className="mt-2">
                <input
                  id="video_file"
                  type="file"
                  accept="video/*"
                  onChange={(e) => handleFileChange('video', e.target.files?.[0] || null)}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {videoFile && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                    <RiUploadLine className="w-4 h-4" />
                    {videoFile.name}
                    <button
                      type="button"
                      onClick={() => handleFileChange('video', null)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <RiCloseLine className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
              {errors.video && (
                <p className="text-sm text-red-600 mt-1">{errors.video}</p>
              )}
            </div>

            <div>
              <Label htmlFor="music_file" className="font-medium">
                Music File (Optional)
              </Label>
              <div className="mt-2">
                <input
                  id="music_file"
                  type="file"
                  accept="audio/*"
                  onChange={(e) => handleFileChange('music', e.target.files?.[0] || null)}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {musicFile && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                    <RiUploadLine className="w-4 h-4" />
                    {musicFile.name}
                    <button
                      type="button"
                      onClick={() => handleFileChange('music', null)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <RiCloseLine className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
              {errors.music && (
                <p className="text-sm text-red-600 mt-1">{errors.music}</p>
              )}
            </div>
          </div>

          {/* Voice Selection */}
          <div>
            <Label htmlFor="voice" className="font-medium">
              Voice
            </Label>
            <Select value={formData.voice} onValueChange={(value) => handleInputChange('voice', value)}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {voiceOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Script Style */}
          <div>
            <Label htmlFor="script_style" className="font-medium">
              Script Style
            </Label>
            <Select value={formData.script_style} onValueChange={(value) => handleInputChange('script_style', value)}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {scriptStyleOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Animation Style */}
          <div>
            <Label htmlFor="animation_style" className="font-medium">
              Animation Style
            </Label>
            <Select value={formData.animation_style} onValueChange={(value) => handleInputChange('animation_style', value)}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {animationStyleOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Caption Position */}
          <div>
            <Label htmlFor="caption_position" className="font-medium">
              Caption Position
            </Label>
            <Select value={formData.caption_position} onValueChange={(value) => handleInputChange('caption_position', value)}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {captionPositionOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Word Limits */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="min_words" className="font-medium">
                Min Words per Caption
              </Label>
              <Input
                id="min_words"
                type="number"
                min="1"
                max="10"
                value={formData.min_words}
                onChange={(e) => handleInputChange('min_words', parseInt(e.target.value) || 2)}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="max_words" className="font-medium">
                Max Words per Caption
              </Label>
              <Input
                id="max_words"
                type="number"
                min="1"
                max="10"
                value={formData.max_words}
                onChange={(e) => handleInputChange('max_words', parseInt(e.target.value) || 4)}
                className="mt-2"
              />
              {errors.max_words && (
                <p className="text-sm text-red-600 mt-1">{errors.max_words}</p>
              )}
            </div>
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{errors.submit}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Project'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}