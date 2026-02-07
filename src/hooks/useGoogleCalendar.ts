'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CreateMeetEventRequest, CreateMeetEventResponse, GoogleConnectionStatus } from '@/types/google'

export function useGoogleConnectionStatus() {
  return useQuery<GoogleConnectionStatus>({
    queryKey: ['google-connection-status'],
    queryFn: async () => {
      const response = await fetch('/api/google/status')
      if (!response.ok) {
        throw new Error('Bağlantı durumu alınamadı')
      }
      return response.json()
    },
    staleTime: 1000 * 60 * 5, // 5 dakika
  })
}

export function useConnectGoogle() {
  return {
    connect: (returnUrl: string) => {
      window.location.href = `/api/google/auth?returnUrl=${encodeURIComponent(returnUrl)}`
    },
  }
}

export function useDisconnectGoogle() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/google/disconnect', { method: 'POST' })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Bağlantı kesilemedi')
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['google-connection-status'] })
    },
  })
}

export function useCreateGoogleMeet() {
  return useMutation<CreateMeetEventResponse, Error, CreateMeetEventRequest>({
    mutationFn: async (data) => {
      const response = await fetch('/api/google/calendar/meet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Meet linki oluşturulamadı')
      }

      return response.json()
    },
  })
}
