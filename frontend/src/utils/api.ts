/**
* @description API utility functions with error handling
*/

export interface ResearchResponse {
  answer: string
  sources: Array<{
    title: string
    url: string
    description: string
  }>
  research_steps: string[]
}

export class APIError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'APIError'
  }
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export async function fetchResearch(question: string, signal?: AbortSignal): Promise<ResearchResponse> {
  const response = await fetch(`${API_BASE_URL}/research`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question }),
    signal,
  })
  
  if (!response.ok) {
    let errorMessage = `Request failed: ${response.statusText}`
    
    // Handle specific error cases
    if (response.status === 429) {
      errorMessage = 'Too many requests. Please wait a moment before searching again.'
    } else if (response.status >= 500) {
      errorMessage = 'Server error. Please try again later.'
    } else if (response.status >= 400) {
      errorMessage = 'Invalid request. Please check your search and try again.'
    }
    
    throw new APIError(response.status, errorMessage)
  }
  
  return response.json()
}
