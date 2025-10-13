/**
 * @description Skeleton loader for the sources sidebar
 */

export default function SkeletonSources() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="text-sm">
          <div className="flex items-start gap-2">
            {/* Number box */}
            <div className="w-4 h-4 skeleton-shimmer rounded flex-shrink-0 mt-0.5"></div>
            <div className="flex-1 space-y-2">
              {/* Title lines - varying lengths to match real titles */}
              {i === 1 && (
                <>
                  <div className="h-3 skeleton-shimmer rounded w-4/5 "></div>
                  <div className="h-3 skeleton-shimmer rounded w-3/4 "></div>
                </>
              )}
              {i === 2 && (
                <>
                  <div className="h-3 skeleton-shimmer rounded w-3/4 "></div>
                  <div className="h-3 skeleton-shimmer rounded w-5/6 "></div>
                  <div className="h-3 skeleton-shimmer rounded w-2/3 "></div>
                </>
              )}
              {i === 3 && (
                <>
                  <div className="h-3 skeleton-shimmer rounded w-4/5 "></div>
                  <div className="h-3 skeleton-shimmer rounded w-3/4 "></div>
                </>
              )}
              {i === 4 && (
                <>
                  <div className="h-3 skeleton-shimmer rounded w-3/4 "></div>
                  <div className="h-3 skeleton-shimmer rounded w-4/5 "></div>
                </>
              )}
              {i === 5 && (
                <>
                  <div className="h-3 skeleton-shimmer rounded w-5/6 "></div>
                  <div className="h-3 skeleton-shimmer rounded w-3/4 "></div>
                </>
              )}
              
              {/* Body text - indented and varying lengths */}
              <div className="ml-0 space-y-1.5">
                <div className="h-2.5 skeleton-shimmer rounded w-full "></div>
                <div className="h-2.5 skeleton-shimmer rounded w-5/6 "></div>
                <div className="h-2.5 skeleton-shimmer rounded w-4/5 "></div>
                <div className="h-2.5 skeleton-shimmer rounded w-3/4 "></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
