import { createClientOnlyFn } from '@tanstack/react-start'

import { toast } from 'sonner'

export const copyToClipboard = createClientOnlyFn(async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard')
    return
  } catch {
    toast.error('Failed to copy to clipboard')
    return
  }
})
