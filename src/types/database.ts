export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      workspaces: {
        Row: {
          id: string
          name: string
          slug: string
          owner_id: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          owner_id: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          owner_id?: string
          created_at?: string
        }
      }
      workspace_members: {
        Row: {
          id: string
          workspace_id: string
          user_id: string
          role: 'owner' | 'admin' | 'member'
          created_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          user_id: string
          role: 'owner' | 'admin' | 'member'
          created_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          user_id?: string
          role?: 'owner' | 'admin' | 'member'
          created_at?: string
        }
      }
      workspace_invites: {
        Row: {
          id: string
          workspace_id: string
          email: string
          role: 'admin' | 'member'
          token: string
          expires_at: string
          created_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          email: string
          role: 'admin' | 'member'
          token: string
          expires_at: string
          created_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          email?: string
          role?: 'admin' | 'member'
          token?: string
          expires_at?: string
          created_at?: string
        }
      }
      meetings: {
        Row: {
          id: string
          workspace_id: string
          title: string
          description: string | null
          start_time: string
          end_time: string
          meeting_type: 'google_meet' 
          meeting_url: string | null
          created_by: string
          created_at: string
          google_calendar_event_id: string | null
          google_meet_link: string | null
        }
        Insert: {
          id?: string
          workspace_id: string
          title: string
          description?: string | null
          start_time: string
          end_time: string
          meeting_type: 'google_meet' 
          meeting_url?: string | null
          created_by: string
          created_at?: string
          google_calendar_event_id?: string | null
          google_meet_link?: string | null
        }
        Update: {
          id?: string
          workspace_id?: string
          title?: string
          description?: string | null
          start_time?: string
          end_time?: string
          meeting_type?: 'google_meet'
          meeting_url?: string | null
          created_by?: string
          created_at?: string
          google_calendar_event_id?: string | null
          google_meet_link?: string | null
        }
      }
      meeting_participants: {
        Row: {
          id: string
          meeting_id: string
          user_id: string | null
          status: 'accepted' | 'declined' | 'pending' | 'maybe'
          created_at: string
          external_email: string | null
          is_external: boolean
        }
        Insert: {
          id?: string
          meeting_id: string
          user_id?: string | null
          status?: 'accepted' | 'declined' | 'pending' | 'maybe'
          created_at?: string
          external_email?: string | null
          is_external?: boolean
        }
        Update: {
          id?: string
          meeting_id?: string
          user_id?: string | null
          status?: 'accepted' | 'declined' | 'pending' | 'maybe'
          created_at?: string
          external_email?: string | null
          is_external?: boolean
        }
      }
      google_tokens: {
        Row: {
          id: string
          user_id: string
          access_token: string
          refresh_token: string
          token_type: string
          expires_at: string
          scope: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          access_token: string
          refresh_token: string
          token_type?: string
          expires_at: string
          scope?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          access_token?: string
          refresh_token?: string
          token_type?: string
          expires_at?: string
          scope?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      email_templates: {
        Row: {
          id: string
          workspace_id: string
          name: string
          subject: string
          content: string
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          name: string
          subject: string
          content: string
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          name?: string
          subject?: string
          content?: string
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

// Helper types
export type Workspace = Database['public']['Tables']['workspaces']['Row']
export type WorkspaceMember = Database['public']['Tables']['workspace_members']['Row']
export type WorkspaceInvite = Database['public']['Tables']['workspace_invites']['Row']
export type Meeting = Database['public']['Tables']['meetings']['Row']
export type MeetingParticipant = Database['public']['Tables']['meeting_participants']['Row']
export type EmailTemplate = Database['public']['Tables']['email_templates']['Row']

export type WorkspaceInsert = Database['public']['Tables']['workspaces']['Insert']
export type WorkspaceMemberInsert = Database['public']['Tables']['workspace_members']['Insert']
export type WorkspaceInviteInsert = Database['public']['Tables']['workspace_invites']['Insert']
export type MeetingInsert = Database['public']['Tables']['meetings']['Insert']
export type MeetingParticipantInsert = Database['public']['Tables']['meeting_participants']['Insert']
export type EmailTemplateInsert = Database['public']['Tables']['email_templates']['Insert']
export type GoogleToken = Database['public']['Tables']['google_tokens']['Row']
export type GoogleTokenInsert = Database['public']['Tables']['google_tokens']['Insert']

// Extended types with relations
export type WorkspaceWithMembers = Workspace & {
  workspace_members: (WorkspaceMember & {
    user: {
      id: string
      email: string
    }
  })[]
}

export type MeetingWithParticipants = Meeting & {
  meeting_participants: (MeetingParticipant & {
    user: {
      id: string
      email: string
    }
  })[]
  creator: {
    id: string
    email: string
  }
}
