'use client'

import { supabase } from '../lib/supabaseClient'
import { useAuth } from './AuthProvider'
import { LogIn, LogOut } from 'lucide-react'

export default function Auth() {
  const { user } = useAuth()

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
    })
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  if (user) {
    return (
      <div className="flex items-center gap-4">
        <img
          src={user.user_metadata.avatar_url}
          alt={user.user_metadata.full_name}
          className="w-8 h-8 rounded-full"
        />
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500"
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={handleLogin}
      className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
    >
      <LogIn size={16} />
      <span>Sign In with Google</span>
    </button>
  )
}
