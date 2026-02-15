'use client'

import React, { Component, type ErrorInfo, type ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
  /** Label shown in the fallback UI (e.g. "Activity Feed") */
  name?: string
  /** Compact mode – smaller padding, single-line layout */
  compact?: boolean
  /** Custom fallback renderer */
  fallback?: (error: Error, reset: () => void) => ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

/**
 * Reusable React error boundary.
 * Catches render errors in children and shows a dark-themed fallback
 * with a retry button instead of crashing the whole page.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(
      `[ErrorBoundary${this.props.name ? ` – ${this.props.name}` : ''}]`,
      error,
      info.componentStack,
    )
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback
      if (this.props.fallback && this.state.error) {
        return this.props.fallback(this.state.error, this.handleReset)
      }

      // Default fallback
      const { name, compact } = this.props
      return (
        <div
          className={`
            rounded-xl border border-red-500/20 bg-red-500/10 backdrop-blur-sm
            flex ${compact ? 'flex-row items-center gap-3 px-4 py-3' : 'flex-col items-center justify-center gap-3 p-6'}
          `}
        >
          <div className={`text-red-300 ${compact ? 'text-sm' : 'text-base'} font-medium`}>
            <span className="mr-1.5">⚠️</span>
            {name ? `${name} failed to load` : 'Something went wrong'}
          </div>

          {!compact && this.state.error && (
            <p className="text-red-400/60 text-xs font-mono max-w-md text-center truncate">
              {this.state.error.message}
            </p>
          )}

          <button
            onClick={this.handleReset}
            className={`
              rounded-lg border border-red-500/30 bg-red-500/20 
              text-red-200 hover:bg-red-500/30 hover:border-red-500/50
              transition-all duration-200 cursor-pointer
              ${compact ? 'px-3 py-1 text-xs' : 'px-4 py-2 text-sm'}
            `}
          >
            Retry
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
