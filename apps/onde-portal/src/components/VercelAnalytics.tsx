'use client';

// Vercel Analytics - disabled for Cloudflare deployment
// Re-enable when deploying to Vercel
export default function VercelAnalytics() {
  // Check if we're on Vercel (they inject this variable)
  if (typeof window !== 'undefined' && !window.location.hostname.includes('vercel.app')) {
    return null;
  }
  
  // Only load on Vercel deployments
  try {
    const { Analytics } = require('@vercel/analytics/react');
    return <Analytics />;
  } catch {
    return null;
  }
}
