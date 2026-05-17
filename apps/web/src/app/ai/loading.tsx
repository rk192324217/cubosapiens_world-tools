// This file is automatically used by Next.js App Router as the
// Suspense boundary for /ai — it renders while page.tsx awaits
// the fetchTools() call, then is replaced by the real content.

export default function AILoading()
{
  // 6 skeleton cards that mimic the tool-card layout
  const skeletons = Array.from({ length: 6 })

  return (
    <div className="page-container">

      {/* Hero skeleton */}
      <div className="page-hero">
        <div className="skeleton skeleton-tag"  />
        <div className="skeleton skeleton-title" />
        <div className="skeleton skeleton-sub"   />
      </div>

      {/* Search + filter skeleton */}
      <div className="tools-search-wrap">
        <div className="skeleton skeleton-search" />
      </div>
      <div className="filter-tabs">
        {["All", "Live", "Coming soon"].map(l => (
          <div key={l} className="skeleton skeleton-tab" />
        ))}
      </div>

      {/* Card skeletons */}
      <div className="tool-grid">
        {skeletons.map((_, i) => (
          <div key={i} className="tool-card skeleton-card">
            <div className="skeleton skeleton-badge" />
            <div className="skeleton skeleton-icon"  />
            <div className="skeleton skeleton-name"  />
            <div className="skeleton skeleton-desc"  />
          </div>
        ))}
      </div>

    </div>
  )
}