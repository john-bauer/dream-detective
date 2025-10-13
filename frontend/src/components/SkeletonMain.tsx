/**
 * @description A shimmering skeleton loader for search results to make the lengthy loading experience
 * a little more bearable. This is the answer variant.
 */

export default function Skeleton() {
  return (
    <div className="min-h-96">
      <div className="space-y-6">
        {/* ----------- Introduction paragraph ---------- */}
        <div className="space-y-3">
          <div className="h-4 skeleton-shimmer rounded w-full"></div>
          <div className="h-4 skeleton-shimmer rounded w-9/10"></div>
          <div className="h-4 skeleton-shimmer rounded w-19/20"></div>
          <div className="h-4 skeleton-shimmer rounded w-3/4"></div>
        </div>

        {/* ---------------- First heading ---------------- */}
        <div className="h-6 skeleton-shimmer rounded w-1/2"></div>
        
        {/* -------- Paragraph under first heading ---------------- */}
        <div className="space-y-3">
          <div className="h-4 skeleton-shimmer rounded w-full"></div>
          <div className="h-4 skeleton-shimmer rounded w-full"></div>
          <div className="h-4 skeleton-shimmer rounded w-2/3"></div>
        </div>

        {/* ------- Bullet points --------- */}
        <div className="space-y-3 ml-4">
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 skeleton-shimmer rounded-full mt-2 flex-shrink-0"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 skeleton-shimmer rounded w-4/5"></div>
              <div className="h-3 skeleton-shimmer rounded w-3/4"></div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 skeleton-shimmer rounded-full mt-2 flex-shrink-0"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 skeleton-shimmer rounded w-5/6"></div>
              <div className="h-3 skeleton-shimmer rounded w-2/3"></div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 skeleton-shimmer rounded-full mt-2 flex-shrink-0"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 skeleton-shimmer rounded w-3/4"></div>
              <div className="h-3 skeleton-shimmer rounded w-4/5"></div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 skeleton-shimmer rounded-full mt-2 flex-shrink-0"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 skeleton-shimmer rounded w-4/5"></div>
              <div className="h-3 skeleton-shimmer rounded w-3/5"></div>
            </div>
          </div>
        </div>

        {/*--------- Second heading --------- */}
        <div className="h-6 skeleton-shimmer rounded w-2/3"></div>
        
        {/* Paragraphs under second heading */}
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="h-4 skeleton-shimmer rounded w-full"></div>
            <div className="h-4 skeleton-shimmer rounded w-9/10"></div>
            <div className="h-4 skeleton-shimmer rounded w-3/4"></div>
          </div>
          <div className="space-y-3">
            <div className="h-4 skeleton-shimmer rounded w-full"></div>
            <div className="h-4 skeleton-shimmer rounded w-19/20"></div>
            <div className="h-4 skeleton-shimmer rounded w-2/3"></div>
          </div>
          <div className="space-y-3">
            <div className="h-4 skeleton-shimmer rounded w-full"></div>
            <div className="h-4 skeleton-shimmer rounded w-4/5"></div>
          </div>
        </div>
      </div>
    </div>
  )
}