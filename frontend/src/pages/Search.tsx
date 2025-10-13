import { useEffect, useMemo, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import Container from '../components/Container'
import SearchBar from '../components/SearchBar'
import Skeleton from '../components/SkeletonMain'
import SkeletonSources from '../components/SkeletonSources'
import { ArrowLeftIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { useResearch } from '../hooks/useResearch'

export default function Search() {
  /** ------------- State ------------- */

  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const initialQuery = useMemo(() => searchParams.get('q') ?? '', [searchParams])
  const hasRunInitialSearch = useRef(false)

  // Use the research hook for all state management
  const { 
    isLoading, 
    result, 
    error, 
    showInitialMessage, 
    fetchResearch,
    stopResearch
  } = useResearch()

  /** ------------- Hooks ------------- */

  // Run initial search once when component mounts with a query
  useEffect(() => {
    if (hasRunInitialSearch.current) return
    hasRunInitialSearch.current = true
    
    if (initialQuery.trim()) {
      fetchResearch(initialQuery)
    }
  }, [initialQuery, fetchResearch])

  /** ------------- Event Handlers ------------- */
  const handleSubmit = (q: string) => {
    const encodedQuery = encodeURIComponent(q)
    const currentQuery = encodeURIComponent(initialQuery)
    
    // Only navigate if query changed
    if (encodedQuery !== currentQuery) {
      navigate(`/search?q=${encodedQuery}`)
    }
    
    // Always fetch (even if query is same)
    fetchResearch(q)
  }

  const goBack = () => {
    navigate('/')
  }

  /** ------------- Helper Functions ------------- */
  const normalizeMarkdown = (text: string): string => {
    // Convert Unicode bullets to markdown asterisks to retain disc bullets via CSS
    let normalized = text.replace(/(^|\n)[\t ]*•[\t ]+/g, '$1* ')
    // Ensure lists render: add a blank line before a list if missing
    normalized = normalized.replace(/([^\n])\n([*-]\s)/g, '$1\n\n$2')
    return normalized
  }

  const cleanSourceDescription = (description: string): string => {
    // Decode HTML entities
    const decoded = description
      .replace(/&#x27;/g, "'")
      .replace(/&#39;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
    
    // Strip HTML tags
    return decoded.replace(/<[^>]*>/g, '')
  }

  const extractDomain = (url: string): string => {
    try {
      const urlObj = new URL(url)
      // Remove 'www.' prefix if present
      return urlObj.hostname.replace(/^www\./, '')
    } catch {
      return url
    }
  }

  return (
      <Container>
        <div className="py-6">
          <div className="flex items-center gap-4 mb-6">
            <button 
              onClick={goBack} 
              className="text-gray-600 hover:text-gray-700 cursor-pointer"
              aria-label="Go back to home"
            >
              <ArrowLeftIcon className="h-6 w-6" />
            </button>
            <div className="flex-1">
              <SearchBar
                initialValue={initialQuery}
                onSubmit={handleSubmit}
                onStop={stopResearch}
                isLoading={isLoading}
              />
            </div>
          </div>

        {/* Loading state - shows fancy loader or skeleton */}
        {isLoading && (
          <div className="mt-6" aria-live="polite" aria-busy="true">
            {showInitialMessage ? (
              /* Fancy centered loader */
              <div className="flex flex-col items-center justify-center py-10 animate-[fadeUp_.5s_ease-out]">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
                <div className="mt-6 text-center">
                  <div className="text-lg font-medium text-gray-700 mb-2">Researching your dream</div>
                  <div className="text-sm text-gray-500">Gathering insights...</div>
                </div>
              </div>
            ) : (
              /* Skeleton layout */
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main content skeleton */}
                <div className="lg:col-span-2">
                  <div className="bg-white border border-gray-200 rounded-xl p-8">
                    <Skeleton />
                  </div>
                </div>

                {/* ---------------- Sources skeleton ------------------ */}
                <div className="lg:col-span-1">
                  <div className="bg-white shadow-sm rounded-xl p-8">
                    <SkeletonSources />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 font-medium">Something went wrong</p>
            <p className="text-red-600 text-sm mt-1">{error}</p>
          </div>
        )}

        {result && (
          <div className="mt-6">
            {/* ---------------- Sources Column ------------------- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main content */}
              <div className="lg:col-span-2">
                <div className="bg-white shadow-sm rounded-xl p-8">
                  <div className="prose prose-md sm:prose-lg max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{normalizeMarkdown(result.answer)}</ReactMarkdown>
                  </div>
                </div>
              </div>

              {/* ---------------- Sources Column ------------------- */}
              {result.sources && result.sources.length > 0 && (
                <div className="lg:col-span-1">
                  <div className="bg-white shadow-sm rounded-xl p-8">
                    <div className="space-y-3">
                      {result.sources.map((source: { title: string; url: string; description: string }, index: number) => (
                        <div key={index} className="text-sm">
                          <div className="flex items-start gap-1">
                            <div className="flex-1">
                              <div className="mb-2">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                  {extractDomain(source.url)}
                                </span>
                              </div>
                              <a
                                href={source.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 underline block mb-1"
                              >
                                {source.title}
                              </a>
                              <p className="text-gray-600 text-xs leading-relaxed">{cleanSourceDescription(source.description)}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ---------------- Empty state ---------------- */}
        {!isLoading && !error && !result && (
          <div className="mt-12 flex flex-col items-center justify-center py-12">
            <div className="bg-gray-100 rounded-full p-6 mb-4">
              <MagnifyingGlassIcon className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Results</h3>
            <p className="text-gray-500 text-center max-w-md">
              Enter a question in the search bar above to get insights from dream-related sources.
            </p>
          </div>
        )}
      </div>
    </Container>
  )
}


