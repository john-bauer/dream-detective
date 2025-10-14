/**
 * @description Server status badge component that displays backend health
 */

import { ArrowPathIcon, InformationCircleIcon } from '@heroicons/react/24/outline'
import { useHealthCheck, HealthStatus } from '../hooks/useHealthCheck'

const statusConfig: Record<HealthStatus, { color: string; bgColor: string; label: string; dotColor: string }> = {
  checking: {
    color: 'text-orange-700',
    bgColor: 'bg-orange-50',
    label: 'Waking Up',
    dotColor: 'bg-orange-500',
  },
  online: {
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    label: 'Online',
    dotColor: 'bg-green-500',
  },
  offline: {
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    label: 'Offline',
    dotColor: 'bg-red-500',
  },
}

export default function ServerStatus() {
  const { status } = useHealthCheck()
  const config = statusConfig[status]

  return (
    <div 
      key={status}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${config.bgColor} ${config.color} text-sm font-medium transition-all duration-300 animate-[fadeIn_0.3s_ease-out]`}
    >
      {status === 'checking' ? (
        <ArrowPathIcon className={`w-4 h-4 ${config.dotColor.replace('bg-', 'text-')} animate-spin`} />
      ) : (
        <span className={`w-2 h-2 rounded-full ${config.dotColor} transition-all duration-300`} />
      )}
      <span className="transition-all duration-300">{config.label}</span>
      {(status === 'checking' || status === 'offline') && (
        <div className="relative group">
          <InformationCircleIcon className="w-4 h-4 cursor-help" />
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-10">
            {status === 'checking' 
              ? 'Server is waking up after being idle. This may take a minute.'
              : 'The server is not responding right now. Please try again later.'}
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      )}
    </div>
  )
}

