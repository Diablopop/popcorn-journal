'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { signIn, signUp } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { error } = isLogin 
        ? await signIn(email, password)
        : await signUp(email, password)

      if (error) {
        setError(error.message)
      } else {
        if (isLogin) {
          router.push('/daily-entry')
        } else {
          // For sign up, wait a moment for the auth state to update
          setTimeout(() => {
            router.push('/onboarding')
          }, 100)
        }
      }
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center px-4">
      <div className="max-w-md mx-auto w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <svg 
              width="64" 
              height="64" 
              viewBox="0 0 460 475" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              className="drop-shadow-sm"
            >
              <g clipPath="url(#clip0_7_86)">
                <ellipse cx="118.079" cy="263.48" rx="118.079" ry="120.277" fill="black"/>
                <circle cx="212.291" cy="106.774" r="106.774" fill="black"/>
                <ellipse cx="349.212" cy="163.301" rx="86.675" ry="101.121" fill="black"/>
                <circle cx="280.124" cy="213.547" r="86.675" fill="black"/>
                <ellipse cx="298.966" cy="354.865" rx="125.616" ry="104.889" transform="rotate(-29.1165 298.966 354.865)" fill="black"/>
                <ellipse cx="132.489" cy="258.463" rx="104.854" ry="106.806" fill="white"/>
                <circle cx="216.149" cy="119.309" r="94.8143" fill="white"/>
                <ellipse cx="337.734" cy="169.505" rx="76.9669" ry="89.7948" fill="white"/>
                <ellipse cx="293.116" cy="339.613" rx="111.546" ry="93.1411" transform="rotate(-29.1165 293.116 339.613)" fill="white"/>
              </g>
              <defs>
                <clipPath id="clip0_7_86">
                  <rect width="460" height="475" fill="white"/>
                </clipPath>
              </defs>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-black">Popcorn Journal</h1>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-center mb-8 text-sm leading-relaxed">
          Popcorn Journal is a low-commitment journaling app where you write just a sentence or two each day. 
          Over time, these small entries add up to a meaningful record of your life.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>
          
          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {loading ? 'Loading...' : (isLogin ? 'Log In' : 'Sign Up')}
          </button>
        </form>

        {/* Toggle */}
        <div className="text-center mt-6">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-gray-600 hover:text-black transition-colors"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Log in"}
          </button>
        </div>
      </div>
    </div>
  )
}
