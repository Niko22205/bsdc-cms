/**
 * V2 layout boundary — spatial experimental frontend.
 *
 * Isolation rules:
 *   - Separate Next.js segment (no shared state with main site)
 *   - noindex to keep experimental routes out of search
 *   - No navbar, no footer, no global wrappers — ScrollEngineV2 owns the full viewport
 *   - Body background from root layout is covered by ScrollEngineV2's fixed inset-0 layer
 */

import type { Metadata }   from 'next'
import type { ReactNode }  from 'react'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function V2Layout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
