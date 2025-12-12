'use client'

import { useState, useEffect, useRef } from 'react'
import { MapPin, Loader2 } from 'lucide-react'

interface LocationSuggestion {
  place_id: number
  display_name: string
  name: string
  country: string
  city?: string
  type: string
}

interface LocationAutocompleteProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  cityOnly?: boolean
}

export function LocationAutocomplete({
  value,
  onChange,
  placeholder = 'Ville, Pays',
  className = '',
  cityOnly = false,
}: LocationAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [loading, setLoading] = useState(false)
  const [inputValue, setInputValue] = useState(value)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    setInputValue(value)
  }, [value])

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const searchLocations = async (query: string) => {
    if (query.length < 2) {
      setSuggestions([])
      setLoading(false)
      return
    }

    setLoading(true)
    
    try {
      // Nominatim API (OpenStreetMap)
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=10&accept-language=fr`
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'TravelShip-App',
        },
      })

      if (!response.ok) {
        throw new Error('Search failed')
      }

      const data = await response.json()
      
      // Format suggestions et supprimer les doublons
      const formatted = data
        .filter((item: any) => item.address)
        .map((item: any) => {
          const address = item.address || {}
          const cityName = address.city || address.town || address.village || address.municipality || address.state || item.name
          const countryName = address.country || ''
          
          return {
            place_id: item.place_id,
            display_name: item.display_name,
            name: cityName,
            country: countryName,
            city: cityName,
            type: item.type || 'unknown',
          }
        })
        .filter((item: LocationSuggestion) => item.name && item.country)
      
      // Supprimer les doublons (même ville + même pays)
      const uniqueSuggestions = formatted.reduce((acc: LocationSuggestion[], current: LocationSuggestion) => {
        const key = `${current.city?.toLowerCase()}-${current.country?.toLowerCase()}`
        const exists = acc.some(item => 
          `${item.city?.toLowerCase()}-${item.country?.toLowerCase()}` === key
        )
        if (!exists) {
          acc.push(current)
        }
        return acc
      }, []).slice(0, 8)

      setSuggestions(uniqueSuggestions)
      setShowSuggestions(true)
    } catch (error) {
      console.error('Location search error:', error)
      setSuggestions([])
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    
    setInputValue(newValue)
    onChange(newValue)
    setShowSuggestions(true)

    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    // Clear suggestions if input is too short
    if (newValue.length < 2) {
      setSuggestions([])
      setLoading(false)
      return
    }

    // Debounce search
    setLoading(true)
    debounceRef.current = setTimeout(() => {
      searchLocations(newValue)
    }, 500)
  }

  const handleSelectSuggestion = (suggestion: LocationSuggestion) => {
    const formattedValue = cityOnly 
      ? (suggestion.city || suggestion.name)
      : `${suggestion.city || suggestion.name}, ${suggestion.country}`
    
    setInputValue(formattedValue)
    onChange(formattedValue)
    setShowSuggestions(false)
    setSuggestions([])
  }

  return (
    <div ref={wrapperRef} className="relative w-full">
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => {
          if (suggestions.length > 0) {
            setShowSuggestions(true)
          }
        }}
        placeholder={placeholder}
        className={className}
        autoComplete="off"
      />

      {/* Loading state */}
      {showSuggestions && loading && (
        <div className="absolute z-[100] left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 p-4 text-center">
          <Loader2 className="w-5 h-5 animate-spin mx-auto text-blue-600" />
          <p className="mt-2 text-sm text-gray-600">Recherche en cours...</p>
        </div>
      )}

      {/* Suggestions Dropdown */}
      {showSuggestions && !loading && suggestions.length > 0 && (
        <div className="absolute z-[100] left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 max-h-64 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={`${suggestion.place_id}-${index}`}
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                handleSelectSuggestion(suggestion)
              }}
              onMouseDown={(e) => {
                e.preventDefault()
              }}
              className="w-full text-left px-4 py-2 hover:bg-blue-50 transition-colors flex items-center space-x-3 border-b border-gray-100 last:border-b-0 cursor-pointer"
            >
              <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="font-medium text-gray-900">
                  {suggestion.city || suggestion.name}
                </span>
                <span className="text-gray-500 ml-1">
                  {suggestion.country}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No results message */}
      {showSuggestions && !loading && inputValue.length >= 2 && suggestions.length === 0 && (
        <div className="absolute z-[100] left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 p-3 text-center text-gray-500 text-sm">
          Aucune ville trouvée
        </div>
      )}
    </div>
  )
}
