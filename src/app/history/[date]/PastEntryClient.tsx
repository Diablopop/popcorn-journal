'use client'

import { useEffect, useMemo, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { format, isValid, parseISO } from 'date-fns'
import Header from '@/components/Header'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Feeling, AVAILABLE_TAGS, Tag, Database } from '@/types/database'

type Entry = Database['public']['Tables']['entries']['Row']
type EntryInsert = Database['public']['Tables']['entries']['Insert']
type EntryUpdate = Database['public']['Tables']['entries']['Update']

interface PastEntryClientProps {
  dateParam: string
}

function getDateBounds(date: Date) {
  const start = new Date(date)
  start.setHours(0, 0, 0, 0)

  const end = new Date(date)
  end.setHours(23, 59, 59, 999)

  return { start, end }
}

export default function PastEntryClient({ dateParam }: PastEntryClientProps) {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [content, setContent] = useState('')
  const [feeling, setFeeling] = useState<Feeling | null>(null)
  const [selectedTags, setSelectedTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(false)
  const [initializing, setInitializing] = useState(true)
  const [existingEntry, setExistingEntry] = useState<Entry | null>(null)

  const targetDate = useMemo(() => {
    const parsed = parseISO(dateParam)
    return isValid(parsed) ? parsed : null
  }, [dateParam])

  const displayDate = useMemo(() => {
    if (!targetDate) return ''
    return format(targetDate, 'EEEE, MMMM d, yyyy')
  }, [targetDate])

  const formHeading = existingEntry ? 'Edit entry' : 'Add entry'
  const primaryCta = existingEntry ? 'UPDATE' : 'ADD ENTRY'

  const loadEntry = useCallback(async () => {
    if (!user || !targetDate) return

    try {
      const { start, end } = getDateBounds(targetDate)
      const { data, error } = await supabase
        .from('entries')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString())
        .maybeSingle()

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching entry:', error)
        alert('Error fetching entry: ' + error.message)
        return
      }

      if (data) {
        const entry = data as Entry
        setExistingEntry(entry)
        setContent(entry.content || '')
        setFeeling(entry.feeling as Feeling | null)
        setSelectedTags((entry.tags as Tag[]) || [])
      } else {
        setExistingEntry(null)
        setContent('')
        setFeeling(null)
        setSelectedTags([])
      }
    } finally {
      setInitializing(false)
    }
  }, [targetDate, user])

  useEffect(() => {
    if (!targetDate) {
      setInitializing(false)
      return
    }

    if (user) {
      loadEntry()
    }
  }, [loadEntry, targetDate, user])

  const invalidDate = !targetDate

  const handleTagToggle = (tag: Tag) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  const handleSubmit = async () => {
    if (!user || !targetDate) return

    setLoading(true)
    try {
      const { start } = getDateBounds(targetDate)

      if (existingEntry) {
        const updateData: EntryUpdate = {
          content: content.trim() || null,
          feeling,
          tags: selectedTags.length > 0 ? selectedTags : null,
        }

        const { error } = await supabase
          .from('entries')
          .update(updateData)
          .eq('id', existingEntry.id)
          .eq('user_id', user.id)

        if (error) {
          console.error('Error updating entry:', error)
          alert('Error updating entry: ' + error.message)
          return
        }
      } else {
        const insertData: EntryInsert = {
          user_id: user.id,
          content: content.trim() || null,
          feeling,
          tags: selectedTags.length > 0 ? selectedTags : null,
          created_at: start.toISOString(),
        }

        const { error } = await supabase
          .from('entries')
          .insert(insertData)

        if (error) {
          console.error('Error creating entry:', error)
          alert('Error creating entry: ' + error.message)
          return
        }
      }

      router.push('/history')
    } catch (error) {
      console.error('Error saving entry:', error)
      alert('Error saving entry: ' + error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.push('/history')
  }

  useEffect(() => {
    if (!authLoading && !user) {
      setInitializing(false)
      router.push('/auth')
    }
  }, [authLoading, router, user])

  if (invalidDate) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4 text-center">
        <div>
          <p className="text-gray-600 mb-4">The date you selected is not valid. Please return to your history and try again.</p>
          <button
            onClick={() => router.push('/history')}
            className="text-sm font-medium text-gray-600 hover:text-black transition-colors underline"
          >
            Back to History
          </button>
        </div>
      </div>
    )
  }

  if (authLoading || initializing) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-600">Loading entry...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="max-w-md mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-black mb-2">
            {formHeading} – {displayDate}
          </h1>
          {existingEntry ? (
            <p className="text-sm text-gray-400 mt-2">
              Update your reflections for this day.
            </p>
          ) : (
            <p className="text-sm text-gray-400 mt-2">
              Add your thoughts for this day to keep your story complete.
            </p>
          )}
        </div>

        <div className="mb-8">
          <h2 className="text-lg font-bold text-teal-600 mb-4">What happened this day?</h2>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write a sentence or two..."
            className="w-full h-24 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none text-gray-900"
          />
        </div>

        <div className="mb-8">
          <h2 className="text-lg font-bold text-teal-600 mb-4">How did you feel?</h2>
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

        <div className="flex items-center justify-between">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {loading ? 'Saving...' : primaryCta}
          </button>

          <button
            onClick={handleCancel}
            className="text-gray-600 hover:text-black transition-colors flex items-center"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}


