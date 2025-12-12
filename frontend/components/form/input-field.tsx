'use client'

import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

interface InputFieldProps {
  label: string
  type?: string
  name: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
  error?: string
  icon?: React.ReactNode
  minLength?: number
  maxLength?: number
  pattern?: string
  className?: string
}

export function InputField({
  label,
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  required = false,
  error,
  icon,
  minLength,
  maxLength,
  pattern,
  className = '',
}: InputFieldProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [touched, setTouched] = useState(false)

  const handleBlur = () => {
    setTouched(true)
  }

  const inputType = type === 'password' && showPassword ? 'text' : type

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-dark mb-2">
        {icon && <span className="inline-block mr-2">{icon}</span>}
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className="relative">
        <input
          type={inputType}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={handleBlur}
          placeholder={placeholder}
          required={required}
          minLength={minLength}
          maxLength={maxLength}
          pattern={pattern}
          className={`input w-full ${error && touched ? 'border-red-500 focus:ring-red-500' : ''}`}
        />
        
        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        )}
      </div>
      
      {error && touched && (
        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
          <span>⚠️</span>
          {error}
        </p>
      )}
    </div>
  )
}

interface TextAreaFieldProps {
  label: string
  name: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
  error?: string
  rows?: number
  minLength?: number
  maxLength?: number
  className?: string
}

export function TextAreaField({
  label,
  name,
  value,
  onChange,
  placeholder,
  required = false,
  error,
  rows = 4,
  minLength,
  maxLength,
  className = '',
}: TextAreaFieldProps) {
  const [touched, setTouched] = useState(false)

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-dark mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <textarea
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => setTouched(true)}
        placeholder={placeholder}
        required={required}
        rows={rows}
        minLength={minLength}
        maxLength={maxLength}
        className={`input w-full ${error && touched ? 'border-red-500 focus:ring-red-500' : ''}`}
      />
      
      {maxLength && (
        <p className="mt-1 text-xs text-gray-500 text-right">
          {value.length} / {maxLength}
        </p>
      )}
      
      {error && touched && (
        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
          <span>⚠️</span>
          {error}
        </p>
      )}
    </div>
  )
}
