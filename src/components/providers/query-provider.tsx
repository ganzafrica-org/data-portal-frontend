"use client"

import { QueryClientProvider } from '@tanstack/react-query'
import { makeQueryClient } from '@/lib/api-config'
import { useState } from 'react'

export function QueryProvider({ children }: { children: React.ReactNode }) {
  // Create a client instance only once per component mount
  // This ensures the queryClient is stable across re-renders
  const [queryClient] = useState(() => makeQueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
