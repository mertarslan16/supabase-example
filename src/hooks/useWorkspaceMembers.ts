'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { WorkspaceMember, WorkspaceMemberInsert, WorkspaceInvite, WorkspaceInviteInsert } from '@/types/database'

export function useWorkspaceMembers(workspaceId: string) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['workspace-members', workspaceId],
    queryFn: async () => {
      // Workspace members'ı çek
      const { data: members, error: membersError } = await supabase
        .from('workspace_members')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: false })

      if (membersError) throw membersError
      if (!members || members.length === 0) return []

      // Mevcut kullanıcıyı al
      const { data: { user: currentUser } } = await supabase.auth.getUser()

      // Her member için user email'ini auth'dan çekmeye çalış
      const membersWithUsers = await Promise.all(
        members.map(async (member) => {
          // Eğer current user ise direkt bilgisini kullan
          if (currentUser && member.user_id === currentUser.id) {
            return {
              ...member,
              user: {
                id: currentUser.id,
                email: currentUser.email
              }
            }
          }

          // Diğer kullanıcılar için email bilgisini null olarak döndür
          // (RLS nedeniyle başka kullanıcıların bilgisine erişemeyebiliriz)
          return {
            ...member,
            user: {
              id: member.user_id,
              email: null
            }
          }
        })
      )

      return membersWithUsers
    },
    enabled: !!workspaceId,
  })
}

export function useAddWorkspaceMember() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (member: WorkspaceMemberInsert) => {
      const { data, error } = await supabase
        .from('workspace_members')
        .insert(member)
        .select()
        .single()

      if (error) throw error
      return data as WorkspaceMember
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['workspace-members', variables.workspace_id] })
    },
  })
}

export function useUpdateWorkspaceMember() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({ memberId, updates }: { memberId: string; updates: Partial<WorkspaceMemberInsert> }) => {
      const { data, error } = await supabase
        .from('workspace_members')
        .update(updates)
        .eq('id', memberId)
        .select()
        .single()

      if (error) throw error
      return data as WorkspaceMember
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['workspace-members', data.workspace_id] })
    },
  })
}

export function useRemoveWorkspaceMember() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({ workspaceId, memberId }: { workspaceId: string; memberId: string }) => {
      const { error } = await supabase
        .from('workspace_members')
        .delete()
        .eq('id', memberId)

      if (error) throw error
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['workspace-members', variables.workspaceId] })
    },
  })
}

// Workspace invites
export function useWorkspaceInvites(workspaceId: string) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['workspace-invites', workspaceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workspace_invites')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as WorkspaceInvite[]
    },
    enabled: !!workspaceId,
  })
}

export function useCreateWorkspaceInvite() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (invite: Omit<WorkspaceInviteInsert, 'token'>) => {
      // Token oluştur
      const token = crypto.randomUUID()

      const { data, error } = await supabase
        .from('workspace_invites')
        .insert({
          ...invite,
          token,
        })
        .select()
        .single()

      if (error) throw error
      return data as WorkspaceInvite
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['workspace-invites', data.workspace_id] })
    },
  })
}
