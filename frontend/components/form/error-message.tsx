interface ErrorMessageProps {
  error?: string
  touched?: boolean
  className?: string
}

export function ErrorMessage({ error, touched, className = '' }: ErrorMessageProps) {
  if (!error || !touched) return null

  return (
    <p className={`mt-1 text-sm text-red-600 flex items-center gap-1 ${className}`}>
      <span>⚠️</span>
      {error}
    </p>
  )
}
