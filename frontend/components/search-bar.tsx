'use client'

import { Search, MapPin, Calendar } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LocationAutocomplete } from './location-autocomplete'

interface SearchBarProps {
  onSearch?: (values: SearchValues) => void
  variant?: 'hero' | 'compact'
}

interface SearchValues {
  from: string
  to: string
  dateFrom?: string
  dateTo?: string
  type?: string
}

export function SearchBar({ onSearch, variant = 'hero' }: SearchBarProps) {
  const router = useRouter()
  const [values, setValues] = useState<SearchValues>({
    from: '',
    to: '',
    dateFrom: '',
    dateTo: '',
    type: 'all',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Build query params
    const params = new URLSearchParams()
    if (values.from) params.set('from', values.from)
    if (values.to) params.set('to', values.to)
    if (values.dateFrom) params.set('dateFrom', values.dateFrom)
    if (values.dateTo) params.set('dateTo', values.dateTo)
    if (values.type && values.type !== 'all') params.set('type', values.type)
    
    // Update URL with search params (stays on same page)
    const newUrl = `${window.location.pathname}?${params.toString()}`
    window.history.pushState({}, '', newUrl)
    
    if (onSearch) {
      onSearch(values)
    }
  }

  if (variant === 'compact') {
    return (
      <form onSubmit={handleSubmit} className="w-full max-w-2xl">
        <div className="flex items-center bg-white rounded-lg shadow-lift p-2 space-x-2">
          <div className="flex-1">
            <LocationAutocomplete
              value={values.from}
              onChange={(value) => setValues({ ...values, from: value })}
              placeholder="De..."
              className="w-full px-2 py-2 border-none focus:outline-none focus:ring-0"
            />
          </div>
          <div className="w-px h-6 bg-light-darker" />
          <div className="flex-1">
            <LocationAutocomplete
              value={values.to}
              onChange={(value) => setValues({ ...values, to: value })}
              placeholder="Vers..."
              className="w-full px-2 py-2 border-none focus:outline-none focus:ring-0"
            />
          </div>
          <button type="submit" className="btn-primary !px-6 !py-2">
            <Search className="w-5 h-5" />
          </button>
        </div>
      </form>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-5xl">
      <div className="glass rounded-xl p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* From */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-dark flex items-center space-x-2">
              <MapPin className="w-4 h-4" />
              <span>Départ</span>
            </label>
            <LocationAutocomplete
              value={values.from}
              onChange={(value) => setValues({ ...values, from: value })}
              placeholder="Paris, France"
              className="input bg-white"
            />
          </div>

          {/* To */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-dark flex items-center space-x-2">
              <MapPin className="w-4 h-4" />
              <span>Arrivée</span>
            </label>
            <LocationAutocomplete
              value={values.to}
              onChange={(value) => setValues({ ...values, to: value })}
              placeholder="Lyon, France"
              className="input bg-white"
            />
          </div>

          {/* Date From */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-dark flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>Du</span>
            </label>
            <input
              type="date"
              value={values.dateFrom}
              onChange={(e) => setValues({ ...values, dateFrom: e.target.value })}
              className="input bg-white"
            />
          </div>

          {/* Date To */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-dark flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>Au</span>
            </label>
            <input
              type="date"
              value={values.dateTo}
              onChange={(e) => setValues({ ...values, dateTo: e.target.value })}
              className="input bg-white"
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Type */}
          <div className="flex-1">
            <select
              value={values.type}
              onChange={(e) => setValues({ ...values, type: e.target.value })}
              className="input bg-white"
            >
              <option value="all">Tous les types</option>
              <option value="package">Colis</option>
              <option value="shopping">Achat</option>
            </select>
          </div>

          {/* Search Button */}
          <button type="submit" className="btn-primary flex items-center space-x-2">
            <Search className="w-5 h-5" />
            <span>Rechercher</span>
          </button>
        </div>
      </div>
    </form>
  )
}
