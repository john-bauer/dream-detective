/**
 * @description This component handles everything related to the search form. It
 * is reused between the home and search pages.
 */

import { useState, useEffect } from 'react'
import { MagnifyingGlassIcon, XMarkIcon, StopIcon } from '@heroicons/react/24/outline'

/* ------------- Types ------------- */
interface SearchBarProps {
  initialValue?: string
  placeholder?: string
  isLoading?: boolean
  onSubmit: (query: string) => void // Used for submitting the search query
  onStop?: () => void // Used for stopping the research process
  autoFocus?: boolean // Whether to focus the input on mount
}

export default function SearchBar({ initialValue = '', placeholder = 'What did you dream about?', isLoading = false, onSubmit, onStop, autoFocus = false }: SearchBarProps) {
  const [value, setValue] = useState(initialValue)

  // ------------- Effects -------------
  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  // ------------- Event Handlers -------------
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const q = value.trim()
    if (!q) return
    onSubmit(q)
  }

  const handleClear = () => {
    setValue('')
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          disabled={isLoading}
          autoFocus={autoFocus}
          className="w-full border shadow-sm hover:shadow-md focus:shadow-lg bg-white border-gray-200 rounded-full p-4 pr-24 text-lg focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        />
        
        {/* ------- Clear/Stop button ---------- */}
        {isLoading && onStop ? (
          <button
            type="button"
            onClick={onStop}
            className="absolute right-14 top-1/2 -translate-y-1/2 h-16 w-10 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-all duration-200 cursor-pointer"
            title="Stop search"
            aria-label="Stop search"
          >
            <StopIcon className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleClear}
            className={`absolute right-14 top-1/2 -translate-y-1/2 h-16 w-10 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-all duration-200 cursor-pointer ${
              value ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
            }`}
            aria-label="Clear search"
          >
            <XMarkIcon className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        )}
        {/* ------- Search button ---------- */}
        <button
          type="submit"
          disabled={isLoading || !value.trim()}
          className="absolute right-4 top-1/2 -translate-y-1/2 h-16 w-10 flex items-center justify-center text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
          aria-label="Search"
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-4 w-4 sm:h-6 sm:w-6 border-2 border-gray-300"></div>
          ) : (
            <MagnifyingGlassIcon className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
          )}
        </button>
      </div>
    </form>
  )
}
