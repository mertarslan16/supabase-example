'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { Meeting, MeetingInsert, MeetingParticipant, MeetingParticipantInsert } from '@/types/database'

export function useMeetings(workspaceId: string) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['meetings', workspaceId],
    queryFn: async () => {
      // Meetings'i çek
      const { data: meetings, error } = await supabase
        .from('meetings')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('start_time', { ascending: true })

      if (error) throw error
      if (!meetings || meetings.length === 0) return []

      // Mevcut kullanıcıyı al
      const { data: { user: currentUser } } = await supabase.auth.getUser()

      // Her meeting için participants'ı çek
      const meetingsWithParticipants = await Promise.all(
        meetings.map(async (meeting) => {
          const { data: participants } = await supabase
            .from('meeting_participants')
            .select('*')
            .eq('meeting_id', meeting.id)

          const participantsWithEmail = (participants || []).map((p) => {
            if (p.is_external && p.external_email) {
              return { ...p, user: { id: p.id, email: p.external_email } }
            }
            if (currentUser && p.user_id === currentUser.id) {
              return { ...p, user: { id: currentUser.id, email: currentUser.email } }
            }
            return { ...p, user: { id: p.user_id, email: null } }
          })

          return {
            ...meeting,
            meeting_participants: participantsWithEmail
          }
        })
      )

      return meetingsWithParticipants
    },
    enabled: !!workspaceId,
  })
}

export function useMeeting(meetingId: string) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['meetings', meetingId],
    queryFn: async () => {
      const { data: meeting, error } = await supabase
        .from('meetings')
        .select('*')
        .eq('id', meetingId)
        .single()

      if (error) throw error

      // Participants'ı çek
      const { data: participants } = await supabase
        .from('meeting_participants')
        .select('*')
        .eq('meeting_id', meetingId)

      return {
        ...meeting,
        meeting_participants: participants || []
      }
    },
    enabled: !!meetingId,
  })
}

export function useCreateMeeting() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (meeting: Omit<MeetingInsert, 'created_by'>) => {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) throw new Error('Kullanıcı oturumu bulunamadı')

      const { data, error } = await supabase
        .from('meetings')
        .insert({
          ...meeting,
          created_by: user.id,
        })
        .select()
        .single()

      if (error) throw error
      return data as Meeting
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['meetings', data.workspace_id] })
    },
  })
}

export function useUpdateMeeting(meetingId: string) {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (updates: Partial<MeetingInsert>) => {
      const { data, error } = await supabase
        .from('meetings')
        .update(updates)
        .eq('id', meetingId)
        .select()
        .single()

      if (error) throw error
      return data as Meeting
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['meetings', data.workspace_id] })
      queryClient.invalidateQueries({ queryKey: ['meetings', meetingId] })
    },
  })
}

export function useDeleteMeeting() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({ workspaceId, meetingId }: { workspaceId: string; meetingId: string }) => {
      const { error } = await supabase
        .from('meetings')
        .delete()
        .eq('id', meetingId)

      if (error) throw error
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['meetings', variables.workspaceId] })
    },
  })
}

// Meeting participants
export function useAddMeetingParticipant() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (participant: MeetingParticipantInsert) => {
      const { data, error } = await supabase
        .from('meeting_participants')
        .insert(participant)
        .select()
        .single()

      if (error) throw error
      return data as MeetingParticipant
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['meetings', variables.meeting_id] })
    },
  })
}

export function useUpdateParticipantStatus() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({ participantId, status }: { participantId: string; status: 'accepted' | 'declined' | 'pending' | 'maybe' }) => {
      const { data, error } = await supabase
        .from('meeting_participants')
        .update({ status })
        .eq('id', participantId)
        .select()
        .single()

      if (error) throw error
      return data as MeetingParticipant
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['meetings', data.meeting_id] })
    },
  })
}
