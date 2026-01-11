'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { EmailTemplate, EmailTemplateInsert } from '@/types/database'

export function useEmailTemplates(workspaceId: string) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['email-templates', workspaceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    },
    enabled: !!workspaceId,
  })
}

export function useEmailTemplate(templateId: string) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['email-templates', templateId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .eq('id', templateId)
        .single()

      if (error) throw error
      return data
    },
    enabled: !!templateId,
  })
}

export function useCreateEmailTemplate() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (template: Omit<EmailTemplateInsert, 'created_by'>) => {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) throw new Error('Kullanıcı oturumu bulunamadı')

      const { data, error } = await supabase
        .from('email_templates')
        .insert({
          ...template,
          created_by: user.id,
        })
        .select()
        .single()

      if (error) throw error
      return data as EmailTemplate
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['email-templates', data.workspace_id] })
    },
  })
}

export function useUpdateEmailTemplate(templateId: string) {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (updates: Partial<EmailTemplateInsert>) => {
      const { data, error } = await supabase
        .from('email_templates')
        .update(updates)
        .eq('id', templateId)
        .select()
        .single()

      if (error) throw error
      return data as EmailTemplate
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['email-templates', data.workspace_id] })
      queryClient.invalidateQueries({ queryKey: ['email-templates', templateId] })
    },
  })
}

export function useDeleteEmailTemplate() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({ workspaceId, templateId }: { workspaceId: string; templateId: string }) => {
      const { error } = await supabase
        .from('email_templates')
        .delete()
        .eq('id', templateId)

      if (error) throw error
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['email-templates', variables.workspaceId] })
    },
  })
}
