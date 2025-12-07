'use client'

import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red'
  delay?: number
}

const colorStyles = {
  blue: {
    gradient: 'from-blue-500/20 to-blue-600/20',
    icon: 'bg-gradient-to-br from-blue-500 to-blue-600',
    border: 'border-blue-500/30',
    text: 'text-blue-400',
  },
  green: {
    gradient: 'from-green-500/20 to-green-600/20',
    icon: 'bg-gradient-to-br from-green-500 to-green-600',
    border: 'border-green-500/30',
    text: 'text-green-400',
  },
  purple: {
    gradient: 'from-purple-500/20 to-purple-600/20',
    icon: 'bg-gradient-to-br from-purple-500 to-purple-600',
    border: 'border-purple-500/30',
    text: 'text-purple-400',
  },
  orange: {
    gradient: 'from-orange-500/20 to-orange-600/20',
    icon: 'bg-gradient-to-br from-orange-500 to-orange-600',
    border: 'border-orange-500/30',
    text: 'text-orange-400',
  },
  red: {
    gradient: 'from-red-500/20 to-red-600/20',
    icon: 'bg-gradient-to-br from-red-500 to-red-600',
    border: 'border-red-500/30',
    text: 'text-red-400',
  },
}

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'blue',
  delay = 0,
}: StatCardProps) {
  const styles = colorStyles[color]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -4, scale: 1.02 }}
      className="group relative"
    >
      {/* Glassmorphism Card */}
      <div
        className={`
          relative overflow-hidden rounded-2xl
          bg-gradient-to-br ${styles.gradient}
          backdrop-blur-xl border ${styles.border}
          p-6 h-full
          shadow-lg shadow-black/10
          transition-all duration-300
          group-hover:shadow-xl group-hover:shadow-black/20
        `}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-repeat" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex items-start justify-between">
          <div className="flex-1">
            <p className="text-gray-400 text-sm font-medium mb-2">{title}</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-bold text-white">{value}</h3>
              {trend && (
                <span
                  className={`text-sm font-medium ${
                    trend.isPositive ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {trend.isPositive ? '+' : ''}
                  {trend.value}%
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-gray-500 text-xs mt-1">{subtitle}</p>
            )}
          </div>

          {/* Icon */}
          <motion.div
            whileHover={{ rotate: 15, scale: 1.1 }}
            className={`
              ${styles.icon}
              p-3 rounded-xl
              shadow-lg
              transition-all duration-300
            `}
          >
            <Icon className="w-6 h-6 text-white" />
          </motion.div>
        </div>

        {/* Hover Glow Effect */}
        <div
          className={`
            absolute inset-0 opacity-0 group-hover:opacity-100
            bg-gradient-to-br ${styles.gradient}
            transition-opacity duration-300
            pointer-events-none
          `}
        />
      </div>
    </motion.div>
  )
}
