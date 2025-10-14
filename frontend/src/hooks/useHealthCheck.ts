/**
 * @description Hook that manages server health status
 */

import { useState, useEffect, useCallback } from 'react'
import { fetchHealth } from '../utils/api'

export type HealthStatus = 'checking' | 'online' | 'offline'

interface HealthCheckState {
  status: HealthStatus
  lastChecked: number | null
}

export function useHealthCheck() {
  const [state, setState] = useState<HealthCheckState>({
    status: 'checking',
    lastChecked: null,
  })

  const checkHealth = useCallback(async () => {
    setState(prev => ({ ...prev, status: 'checking' }))
    
    // ---- Uncomment to test "Waking Up" state locally ----
    // await new Promise(resolve => setTimeout(resolve, 2000))
    
    try {
      await fetchHealth()
      setState({
        status: 'online',
        lastChecked: Date.now(),
      })
    } catch {
      setState({
        status: 'offline',
        lastChecked: Date.now(),
      })
    }
  }, [])
  // Whenever the component mounts, check health
  useEffect(() => {
    checkHealth()
  }, [checkHealth])

  return {
    status: state.status,
    lastChecked: state.lastChecked,
    checkHealth,
  }
}

