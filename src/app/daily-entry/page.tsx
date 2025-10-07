'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Feeling, AVAILABLE_TAGS, Tag, Database } from '@/types/database'

type Entry = Database['public']['Tables']['entries']['Row']
type EntryInsert = Database['public']['Tables']['entries']['Insert']
type EntryUpdate = Database['public']['Tables']['entries']['Update']
import Navigation from '@/components/Navigation'

export default function DailyEntryPage() {
  const [content, setContent] = useState('')
  const [feeling, setFeeling] = useState<Feeling | null>(null)
  const [selectedTags, setSelectedTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(false)
  const [hasEntryToday, setHasEntryToday] = useState(false)
  const { user } = useAuth()
  const router = useRouter()

  const checkTodayEntry = useCallback(async () => {
    if (!user) return

    const today = new Date().toISOString().split('T')[0]
    
    const { data, error } = await supabase
      .from('entries')
      .select('*')
      .eq('user_id', user.id)
      .gte('created_at', `${today}T00:00:00`)
      .lte('created_at', `${today}T23:59:59`)
      .maybeSingle()

    if (data && !error) {
      const entry = data as Entry
      setHasEntryToday(true)
      setContent(entry.content || '')
      setFeeling(entry.feeling)
      setSelectedTags((entry.tags as Tag[]) || [])
    }
  }, [user])

  useEffect(() => {
    if (user) {
      checkTodayEntry()
    }
  }, [user, checkTodayEntry])

  const handleTagToggle = (tag: Tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  const handleSubmit = async () => {
    if (!user) {
      console.error('No user found')
      return
    }

    setLoading(true)
    try {
      // Always update existing entry or create new one
      const entryData: EntryInsert = {
        user_id: user.id,
        content: content.trim() || null,
        feeling,
        tags: selectedTags.length > 0 ? selectedTags : null,
      }

      console.log('Submitting entry:', entryData)

      if (hasEntryToday) {
        // Update existing entry
        const updateData: EntryUpdate = {
          content: content.trim() || null,
          feeling,
          tags: selectedTags.length > 0 ? selectedTags : null,
        }
        
        const { error } = await supabase
          .from('entries')
          .update(updateData)
          .eq('user_id', user.id)
          .gte('created_at', new Date().toISOString().split('T')[0] + 'T00:00:00')
          .lte('created_at', new Date().toISOString().split('T')[0] + 'T23:59:59')

        if (error) {
          console.error('Error updating entry:', error)
          alert('Error updating entry: ' + error.message)
          return
        }
      } else {
        // Create new entry (only if no entry exists for today)
        const { error } = await supabase
          .from('entries')
          .insert(entryData)

        if (error) {
          console.error('Error creating entry:', error)
          alert('Error creating entry: ' + error.message)
          return
        }
      }

      console.log('Entry saved successfully')
      router.push('/history')
    } catch (error) {
      console.error('Error saving entry:', error)
      alert('Error saving entry: ' + error)
    } finally {
      setLoading(false)
    }
  }

  const handleSkip = () => {
    router.push('/history')
  }

  const today = new Date().toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric'
  })

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="max-w-md mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-lg text-gray-500 italic">
            {hasEntryToday ? 'Edit Today\'s Entry' : 'Daily Entry'} {today}
          </h1>
          {hasEntryToday && (
            <p className="text-sm text-gray-400 mt-1">You already have an entry for today. You can edit it below.</p>
          )}
        </div>

        {/* What happened today? */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-teal-600 mb-4">What happened today?</h2>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write a sentence or two..."
            className="w-full h-24 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none"
          />
        </div>

        {/* How do you feel? */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-teal-600 mb-4">How do you feel about your day?</h2>
          <div className="flex justify-between">
            {(['Good', 'Medium', 'Bad', 'Uncertain'] as Feeling[]).map((option) => (
              <button
                key={option}
                onClick={() => setFeeling(option)}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  feeling === option
                    ? 'text-black border-b-2 border-black'
                    : 'text-gray-600 hover:text-black'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-teal-600 mb-4">Want to add any tags?</h2>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => handleTagToggle(tag)}
                className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                  selectedTags.includes(tag)
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-black border-gray-300 hover:border-black'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {loading ? 'Saving...' : (hasEntryToday ? 'UPDATE' : 'SUBMIT')}
          </button>
          
          <button
            onClick={handleSkip}
            className="text-gray-600 hover:text-black transition-colors flex items-center"
          >
            Skip <span className="ml-1">→</span>
          </button>
        </div>
      </div>
      
      <Navigation />
    </div>
  )
}
