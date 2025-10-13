/**
 * @description a hook that handles state mgmt and fetching related to 
 * the research process.
*/

import { useState, useCallback, useRef } from 'react'
import { fetchResearch, ResearchResponse, APIError } from '../utils/api'


  // ------------- Types ----------------
interface ResearchState {
  isLoading: boolean
  result: ResearchResponse | null
  error: string | null
  showInitialMessage: boolean
}

export function useResearch() {
  // ------------- State & Refs ----------------
  const [state, setState] = useState<ResearchState>({
    isLoading: false,
    result: null,
    error: null,
    showInitialMessage: false,
  })

  const abortControllerRef = useRef<AbortController | null>(null)
  const initialTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ------------- Methods ----------------
  const fetchResearchData = useCallback(async (query: string) => {
    if (!query.trim()) {
      setState({
        isLoading: false,
        result: null,
        error: null,
        showInitialMessage: false,
      })
      return
    }

    // Cancel any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Create new abort controller
    const abortController = new AbortController()
    abortControllerRef.current = abortController

    setState(prev => ({
      // destructure previous state
      ...prev,
      isLoading: true,
      error: null,
      result: null,
      showInitialMessage: true,
    }))

    // Show initial message for 3 seconds, then switch to skeleton
    initialTimerRef.current = setTimeout(() => {
      if (!abortController.signal.aborted) {
        setState(prev => ({ ...prev, showInitialMessage: false }))
      }
    }, 3000)

    try {
      const data = await fetchResearch(query, abortController.signal)
      
      // only update state if the request was not aborted
      if (!abortController.signal.aborted) {
        setState(prev => ({
          ...prev,
          result: data,
          isLoading: false,
          showInitialMessage: false,
        }))
      }
    } catch (error) {
      if (!abortController.signal.aborted) {
        if (error instanceof APIError) {
          setState(prev => ({
            ...prev,
            error: error.message,
            isLoading: false,
            showInitialMessage: false,
          }))
        } else if (error instanceof Error && error.name === 'AbortError') {
          // Request was cancelled, don't update state
          return
        } else {
          setState(prev => ({
            ...prev,
            error: 'An unexpected error occurred. Please try again.',
            isLoading: false,
            showInitialMessage: false,
          }))
        }
      }
    } finally {
      // clear the initial timer
      if (initialTimerRef.current) {
        clearTimeout(initialTimerRef.current)
        initialTimerRef.current = null
      }
    }
  }, [])

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }))
  }, [])

  const clearResult = useCallback(() => {
    setState(prev => ({ ...prev, result: null }))
  }, [])

  // Stop/cancel current research request
  const stopResearch = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    if (initialTimerRef.current) {
      clearTimeout(initialTimerRef.current)
      initialTimerRef.current = null
    }
    setState(prev => ({
      ...prev,
      isLoading: false,
      showInitialMessage: false,
    }))
  }, [])

  // Cleanup function to cancel requests when component unmounts
  const cleanup = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    if (initialTimerRef.current) {
      clearTimeout(initialTimerRef.current)
      initialTimerRef.current = null
    }
  }, [])

  return {
    ...state,
    fetchResearch: fetchResearchData,
    stopResearch,
    clearError,
    clearResult,
    cleanup,
  }
}
