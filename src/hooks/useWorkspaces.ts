'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { Workspace, WorkspaceInsert } from '@/types/database'

export function useWorkspaces() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['workspaces'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workspaces')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as Workspace[]
    },
  })
}

export function useWorkspace(workspaceId: string) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['workspaces', workspaceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workspaces')
        .select('*')
        .eq('id', workspaceId)
        .single()

      if (error) throw error
      return data as Workspace
    },
    enabled: !!workspaceId,
  })
}

export function useCreateWorkspace() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (workspace: Omit<WorkspaceInsert, 'owner_id'>) => {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) throw new Error('Kullanıcı oturumu bulunamadı')

      const { data, error } = await supabase
        .from('workspaces')
        .insert({
          ...workspace,
          owner_id: user.id,
        })
        .select()
        .single()

      if (error) throw error
      return data as Workspace
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] })
    },
  })
}

export function useUpdateWorkspace(workspaceId: string) {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (updates: Partial<WorkspaceInsert>) => {
      const { data, error } = await supabase
        .from('workspaces')
        .update(updates)
        .eq('id', workspaceId)
        .select()
        .single()

      if (error) throw error
      return data as Workspace
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] })
      queryClient.invalidateQueries({ queryKey: ['workspaces', workspaceId] })
    },
  })
}

export function useDeleteWorkspace() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (workspaceId: string) => {
      const { error } = await supabase
        .from('workspaces')
        .delete()
        .eq('id', workspaceId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] })
    },
  })
}
