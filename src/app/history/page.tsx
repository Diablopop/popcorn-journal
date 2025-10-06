'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns'
import Navigation from '@/components/Navigation'

interface Entry {
  id: string
  content: string | null
  feeling: string | null
  tags: string[] | null
  created_at: string
}

export default function HistoryPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [entries, setEntries] = useState<Entry[]>([])
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchEntries()
    }
  }, [user, fetchEntries])

  const fetchEntries = useCallback(async () => {
    if (!user) return

    setLoading(true)
    try {
      const startDate = startOfMonth(currentDate)
      const endDate = endOfMonth(currentDate)

      const { data, error } = await supabase
        .from('entries')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: true })

      if (error) throw error
      setEntries(data || [])
    } catch (error) {
      console.error('Error fetching entries:', error)
    } finally {
      setLoading(false)
    }
  }, [user, currentDate])

  const handleDateClick = (date: Date) => {
    const entry = entries.find(entry => 
      isSameDay(new Date(entry.created_at), date)
    )
    setSelectedEntry(entry || null)
  }

  const getEntryForDate = (date: Date) => {
    return entries.find(entry => 
      isSameDay(new Date(entry.created_at), date)
    )
  }

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const goToPreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="max-w-md mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={goToPreviousMonth}
            className="text-gray-600 hover:text-black transition-colors"
          >
            ←
          </button>
          <h1 className="text-xl font-bold text-black">
            {format(currentDate, 'MMMM yyyy')}
          </h1>
          <button
            onClick={goToNextMonth}
            className="text-gray-600 hover:text-black transition-colors"
          >
            →
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 mb-6">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
          
          {calendarDays.map((day) => {
            const entry = getEntryForDate(day)
            const isCurrentMonth = isSameMonth(day, currentDate)
            const isToday = isSameDay(day, new Date())
            
            return (
              <button
                key={day.toISOString()}
                onClick={() => handleDateClick(day)}
                className={`aspect-square flex items-center justify-center text-sm transition-colors ${
                  !isCurrentMonth
                    ? 'text-gray-300'
                    : entry
                    ? 'bg-black text-white hover:bg-gray-800'
                    : isToday
                    ? 'bg-gray-100 text-black hover:bg-gray-200'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {format(day, 'd')}
              </button>
            )
          })}
        </div>

        {/* Selected Entry */}
        {selectedEntry ? (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-500 mb-2">
              {format(new Date(selectedEntry.created_at), 'EEEE, MMMM d, yyyy')}
            </div>
            
            {selectedEntry.content && (
              <div className="mb-4">
                <p className="text-gray-800">{selectedEntry.content}</p>
              </div>
            )}
            
            {selectedEntry.feeling && (
              <div className="mb-4">
                <span className="text-sm font-medium text-gray-600">Feeling: </span>
                <span className="text-sm text-gray-800">{selectedEntry.feeling}</span>
              </div>
            )}
            
            {selectedEntry.tags && selectedEntry.tags.length > 0 && (
              <div>
                <span className="text-sm font-medium text-gray-600">Tags: </span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedEntry.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            {entries.length === 0 
              ? "No entries this month. Start writing to see them here!"
              : "Click on a highlighted date to view your entry."
            }
          </div>
        )}
      </div>
      
      <Navigation />
    </div>
  )
}
