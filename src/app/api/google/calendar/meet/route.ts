import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { refreshTokenIfNeeded } from '@/lib/google/token-manager'

const CALENDAR_API_URL = 'https://www.googleapis.com/calendar/v3'

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { title, description, startTime, endTime, attendees, sendNotifications } = body

    // Token al ve gerekirse yenile
    const accessToken = await refreshTokenIfNeeded(supabase, user.id)

    // Timezone al
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone

    // Google Calendar event oluştur (Meet linkli)
    const event = {
      summary: title,
      description: description || '',
      start: {
        dateTime: startTime,
        timeZone,
      },
      end: {
        dateTime: endTime,
        timeZone,
      },
      attendees: attendees?.map((email: string) => ({ email })) || [],
      conferenceData: {
        createRequest: {
          requestId: generateUUID(),
          conferenceSolutionKey: {
            type: 'hangoutsMeet',
          },
        },
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 60 },
          { method: 'popup', minutes: 10 },
        ],
      },
    }

    const sendUpdates = sendNotifications ? 'all' : 'none'
    const response = await fetch(
      `${CALENDAR_API_URL}/calendars/primary/events?conferenceDataVersion=1&sendUpdates=${sendUpdates}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      }
    )

    const createdEvent = await response.json()

    if (!response.ok || createdEvent.error) {
      console.error('Google Calendar API full error:', JSON.stringify(createdEvent, null, 2))
      const errMsg = createdEvent.error?.message || createdEvent.error?.errors?.[0]?.message || `Google Calendar API hatası (${response.status})`
      throw new Error(errMsg)
    }

    // Meet linkini bul
    const meetLink = createdEvent.conferenceData?.entryPoints?.find(
      (ep: { entryPointType: string; uri: string }) => ep.entryPointType === 'video'
    )?.uri

    return NextResponse.json({
      eventId: createdEvent.id,
      meetLink: meetLink || null,
      htmlLink: createdEvent.htmlLink,
    })
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Bilinmeyen hata'
    console.error('Google Calendar API error:', errorMessage)
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
