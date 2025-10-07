'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

const onboardingSteps = [
  {
    title: "Write just 1 to 3 sentences a day",
    description: "Keep it simple—no pressure to write long entries.",
    icon: "✍️"
  },
  {
    title: "Tag your days to spot trends",
    description: "Add tags like 'Work', 'Friends', or 'Exercise' to see patterns.",
    icon: "🏷️"
  },
  {
    title: "Look back with your calendar",
    description: "See all your entries—a few sentences a day add up over time.",
    icon: "📅"
  },
  {
    title: "New features coming soon!",
    description: "Get daily reminders, Add custom tags, Search and comment on past entries, Tag your location, Share a photo, See personal trends with charts",
    icon: "🚀"
  }
]

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [reminderTime, setReminderTime] = useState('09:00')
  const [reminderFrequency, setReminderFrequency] = useState(1)
  const [loading, setLoading] = useState(false)
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  // Handle redirect to auth if no user
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth')
    }
  }, [authLoading, user, router])

  // Show loading while auth is being determined
  if (authLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  // Show redirecting message if no user
  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-600">Redirecting...</div>
      </div>
    )
  }

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handleComplete = async () => {
    if (!user) {
      console.error('No user found, redirecting to auth')
      router.push('/auth')
      return
    }
    
    setLoading(true)
    try {
      // Create user profile
      const { error } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email!,
          reminder_time: reminderTime,
          reminder_frequency: reminderFrequency,
        })

      if (error) {
        console.error('Error creating profile:', error)
        alert('Error creating profile: ' + error.message)
        return
      }

      console.log('Profile created successfully')
      router.push('/daily-entry')
    } catch (err) {
      console.error('Error completing onboarding:', err)
      alert('Error completing onboarding: ' + err)
    } finally {
      setLoading(false)
    }
  }

  const handleSkip = () => {
    router.push('/daily-entry')
  }

  if (currentStep < onboardingSteps.length) {
    const step = onboardingSteps[currentStep]
    
    return (
      <div className="min-h-screen bg-white flex flex-col justify-center px-4">
        <div className="max-w-md mx-auto w-full text-center">
          <div className="text-6xl mb-8">{step.icon}</div>
          <h1 className="text-2xl font-bold text-black mb-4">{step.title}</h1>
          {currentStep === 3 ? (
            <div className="text-gray-600 mb-12 text-left">
              <ul className="space-y-2">
                {step.description.split(', ').map((item, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-black mr-2">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-gray-600 mb-12 text-lg">{step.description}</p>
          )}
          
          <div className="space-y-4">
            <button
              onClick={handleNext}
              className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              {currentStep === onboardingSteps.length - 1 ? 'Get Started' : 'Next'}
            </button>
            
            <button
              onClick={handleSkip}
              className="w-full text-gray-600 hover:text-black transition-colors"
            >
              Skip
            </button>
          </div>
          
          <div className="flex justify-center mt-8 space-x-2">
            {onboardingSteps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index === currentStep ? 'bg-black' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center px-4">
      <div className="max-w-md mx-auto w-full">
        <h1 className="text-2xl font-bold text-black mb-8 text-center">Set Your Preferences</h1>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred reminder time
            </label>
            <input
              type="time"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reminder frequency (times per day)
            </label>
            <select
              value={reminderFrequency}
              onChange={(e) => setReminderFrequency(Number(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            >
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={3}>3</option>
            </select>
          </div>
        </div>
        
        <div className="mt-8 space-y-4">
          <button
            onClick={handleComplete}
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {loading ? 'Setting up...' : 'Complete Setup'}
          </button>
          
          <button
            onClick={handleSkip}
            className="w-full text-gray-600 hover:text-black transition-colors"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  )
}
