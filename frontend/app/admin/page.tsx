'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store'
import { toast } from 'react-hot-toast'

export default function AdminPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    if (user?.role !== 'admin') {
      toast.error('Accès refusé - Vous devez être administrateur')
      router.push('/')
      return
    }

    // Redirect to dashboard
    router.push('/admin/dashboard')
  }, [isAuthenticated, user, router])

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0f172a]">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-white text-lg">Redirection...</span>
      </div>
    </div>
  )
}
