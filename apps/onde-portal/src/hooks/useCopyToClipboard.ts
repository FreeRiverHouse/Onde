import { useState, useCallback } from 'react'

type CopyStatus = 'idle' | 'copied' | 'error'

/**
 * Hook for copying text to clipboard with status feedback.
 * 
 * Usage:
 * const { copy, status } = useCopyToClipboard()
 * <button onClick={() => copy('Hello!')}>
 *   {status === 'copied' ? '✓ Copied!' : 'Copy'}
 * </button>
 */
export function useCopyToClipboard(resetDelay: number = 2000) {
  const [status, setStatus] = useState<CopyStatus>('idle')

  const copy = useCallback(async (text: string): Promise<boolean> => {
    if (!navigator?.clipboard) {
      // Fallback for older browsers
      try {
        const textArea = document.createElement('textarea')
        textArea.value = text
        textArea.style.position = 'fixed'
        textArea.style.left = '-9999px'
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        
        setStatus('copied')
        setTimeout(() => setStatus('idle'), resetDelay)
        return true
      } catch {
        setStatus('error')
        setTimeout(() => setStatus('idle'), resetDelay)
        return false
      }
    }

    try {
      await navigator.clipboard.writeText(text)
      setStatus('copied')
      setTimeout(() => setStatus('idle'), resetDelay)
      return true
    } catch {
      setStatus('error')
      setTimeout(() => setStatus('idle'), resetDelay)
      return false
    }
  }, [resetDelay])

  const reset = useCallback(() => setStatus('idle'), [])

  return { copy, status, reset }
}

export default useCopyToClipboard
