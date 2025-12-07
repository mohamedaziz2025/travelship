'use client'

import { X } from 'lucide-react'
import { useEffect } from 'react'
import { cn } from '@/lib/utils'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  className,
}: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-dark/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={cn(
          'relative bg-white rounded-xl shadow-glass w-full animate-scale-in',
          sizeClasses[size],
          className
        )}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between p-6 border-b border-light-darker">
            <h2 className="text-2xl font-bold text-dark">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-light-dark rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-dark-lighter" />
            </button>
          </div>
        )}

        {!title && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-light-dark rounded-lg transition-colors z-10"
          >
            <X className="w-5 h-5 text-dark-lighter" />
          </button>
        )}

        {/* Content */}
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  )
}
