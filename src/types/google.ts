export interface GoogleTokens {
  access_token: string
  refresh_token: string
  expires_in: number
  token_type: string
  scope: string
}

export interface GoogleCalendarEvent {
  id?: string
  summary: string
  description?: string
  start: {
    dateTime: string
    timeZone: string
  }
  end: {
    dateTime: string
    timeZone: string
  }
  attendees?: Array<{
    email: string
    responseStatus?: 'needsAction' | 'declined' | 'tentative' | 'accepted'
  }>
  conferenceData?: {
    createRequest?: {
      requestId: string
      conferenceSolutionKey: {
        type: 'hangoutsMeet'
      }
    }
    entryPoints?: Array<{
      entryPointType: string
      uri: string
      label?: string
    }>
  }
  reminders?: {
    useDefault: boolean
    overrides?: Array<{
      method: string
      minutes: number
    }>
  }
  htmlLink?: string
}

export interface GoogleUserInfo {
  id: string
  email: string
  name: string
  picture: string
}

export interface CreateMeetEventRequest {
  title: string
  description?: string
  startTime: string
  endTime: string
  attendees?: string[]
  sendNotifications?: boolean
}

export interface CreateMeetEventResponse {
  eventId: string
  meetLink: string
  htmlLink: string
}

export interface GoogleConnectionStatus {
  connected: boolean
  isExpired?: boolean
  expiresAt?: string
}

export interface GoogleTokenRecord {
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
