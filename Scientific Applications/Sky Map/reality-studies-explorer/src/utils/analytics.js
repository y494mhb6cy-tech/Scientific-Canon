// Analytics abstraction — swap in real provider later
export function trackEvent(name, data = {}) {
  if (typeof window !== 'undefined' && window.__rse_debug) {
    console.log('[analytics]', name, data);
  }
  // Placeholder for analytics provider
  // e.g. posthog.capture(name, data)
}

export const Events = {
  NODE_CLICK: 'node_click',
  NODE_SHARE: 'node_share',
  TOUR_START: 'tour_start',
  TOUR_STEP: 'tour_step',
  TOUR_COMPLETE: 'tour_complete',
  TOUR_SKIP: 'tour_skip',
  SEARCH: 'search',
};
