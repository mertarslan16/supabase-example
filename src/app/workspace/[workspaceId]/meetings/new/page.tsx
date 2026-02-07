'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useWorkspace } from '@/hooks/useWorkspaces'
import { useWorkspaceMembers } from '@/hooks/useWorkspaceMembers'
import { useCreateMeeting, useAddMeetingParticipant } from '@/hooks/useMeetings'
import { useGoogleConnectionStatus, useCreateGoogleMeet } from '@/hooks/useGoogleCalendar'
import { GoogleConnectButton } from '@/components/google/GoogleConnectButton'
import { GmailAttendeesInput } from '@/components/google/GmailAttendeesInput'

export default function NewMeetingPage({
  params,
}: {
  params: { workspaceId: string }
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { workspaceId } = params
  const { data: workspace } = useWorkspace(workspaceId)
  const { data: members } = useWorkspaceMembers(workspaceId)
  const createMeeting = useCreateMeeting()
  const addParticipant = useAddMeetingParticipant()
  const { data: googleStatus } = useGoogleConnectionStatus()
  const createGoogleMeet = useCreateGoogleMeet()

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    meeting_type: 'google_meet' as 'google_meet',
    meeting_url: '',
  })
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([])
  const [externalAttendees, setExternalAttendees] = useState<string[]>([])
  const [sendNotifications, setSendNotifications] = useState(true)
  const [isCreatingMeet, setIsCreatingMeet] = useState(false)
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // URL'den gelen Google bağlantı durumunu kontrol et
  useEffect(() => {
    const googleConnected = searchParams.get('google_connected')
    const googleError = searchParams.get('google_error')

    if (googleConnected === 'true') {
      setNotification({ type: 'success', message: 'Google hesabınız başarıyla bağlandı!' })
      // URL'i temizle
      window.history.replaceState({}, '', window.location.pathname)
    } else if (googleError) {
      setNotification({ type: 'error', message: `Google bağlantı hatası: ${googleError}` })
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim() || !formData.start_time || !formData.end_time) {
      alert('Lütfen tüm zorunlu alanları doldurun')
      return
    }

    if (new Date(formData.start_time) >= new Date(formData.end_time)) {
      alert('Bitiş zamanı başlangıç zamanından sonra olmalıdır')
      return
    }

    try {
      let meetingUrl = formData.meeting_url
      let googleEventId: string | null = null
      let googleMeetLink: string | null = null

      // Google Meet seçildiyse ve Google bağlı ise otomatik oluştur
      if (formData.meeting_type === 'google_meet' && googleStatus?.connected && !meetingUrl) {
        setIsCreatingMeet(true)

        try {
          const meetResult = await createGoogleMeet.mutateAsync({
            title: formData.title,
            description: formData.description,
            startTime: new Date(formData.start_time).toISOString(),
            endTime: new Date(formData.end_time).toISOString(),
            attendees: externalAttendees,
            sendNotifications,
          })

          meetingUrl = meetResult.meetLink
          googleEventId = meetResult.eventId
          googleMeetLink = meetResult.meetLink
        } catch (meetError: unknown) {
          const errorMessage = meetError instanceof Error ? meetError.message : 'Bilinmeyen hata'
          console.error('Meet creation error:', meetError)
          setIsCreatingMeet(false)
          setNotification({ type: 'error', message: 'Google Meet linki oluşturulamadı: ' + errorMessage })
          return
        }

        setIsCreatingMeet(false)
      }

      const meeting = await createMeeting.mutateAsync({
        workspace_id: workspaceId,
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        start_time: new Date(formData.start_time).toISOString(),
        end_time: new Date(formData.end_time).toISOString(),
        meeting_type: formData.meeting_type,
        meeting_url: meetingUrl || null,
        google_calendar_event_id: googleEventId,
        google_meet_link: googleMeetLink,
      })

      // Workspace üyelerini ekle
      for (const userId of selectedParticipants) {
        await addParticipant.mutateAsync({
          meeting_id: meeting.id,
          user_id: userId,
          status: 'pending',
        })
      }

      // Harici katılımcıları ekle
      for (const email of externalAttendees) {
        await addParticipant.mutateAsync({
          meeting_id: meeting.id,
          external_email: email,
          is_external: true,
          status: 'pending',
        })
      }

      router.push(`/workspace/${workspaceId}/meetings`)
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Toplantı oluşturulurken bir hata oluştu'
      alert(errorMessage)
    }
  }

  const toggleParticipant = (userId: string) => {
    setSelectedParticipants(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const isGoogleMeetSelected = formData.meeting_type === 'google_meet'
  const canAutoCreateMeet = isGoogleMeetSelected && googleStatus?.connected
  const isSubmitting = createMeeting.isPending || isCreatingMeet

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link href={`/workspace/${workspaceId}/meetings`} className="text-blue-600 hover:text-blue-700 text-sm mb-2 inline-block">
            ← Geri dön
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Yeni Toplantı Oluştur</h1>
          <p className="text-gray-500 mt-1">{workspace?.name}</p>
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className={`p-4 rounded-lg ${notification.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            <div className="flex justify-between items-center">
              <span>{notification.message}</span>
              <button onClick={() => setNotification(null)} className="text-current opacity-70 hover:opacity-100">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-8 space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Toplantı Başlığı *
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Örn: Haftalık Ekip Toplantısı"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Açıklama
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Toplantı hakkında detaylar..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="start_time" className="block text-sm font-medium text-gray-700 mb-2">
                Başlangıç Zamanı *
              </label>
              <input
                type="datetime-local"
                id="start_time"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label htmlFor="end_time" className="block text-sm font-medium text-gray-700 mb-2">
                Bitiş Zamanı *
              </label>
              <input
                type="datetime-local"
                id="end_time"
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="meeting_type" className="block text-sm font-medium text-gray-700 mb-2">
              Toplantı Türü *
            </label>
            <select
              id="meeting_type"
              value={formData.meeting_type}
              onChange={(e) => setFormData({ ...formData, meeting_type: e.target.value as 'google_meet' })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="google_meet">Google Meet</option>
            </select>
          </div>

          {/* Google Meet Entegrasyonu */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Google Meet Entegrasyonu</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Google hesabınızı bağlayarak otomatik Meet linki oluşturabilirsiniz
                  </p>
                </div>
                <GoogleConnectButton returnUrl={`/workspace/${workspaceId}/meetings/new`} />
              </div>

              {canAutoCreateMeet && (
                <>
                  <div className="border-t border-gray-200 pt-4">
                    <GmailAttendeesInput
                      attendees={externalAttendees}
                      onChange={setExternalAttendees}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="sendNotifications"
                      checked={sendNotifications}
                      onChange={(e) => setSendNotifications(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <label htmlFor="sendNotifications" className="text-sm text-gray-700">
                      Katılımcılara davet emaili gönder
                    </label>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-800">
                      <strong>Otomatik Meet Linki:</strong> Toplantı oluşturulduğunda Google Calendar&apos;ınıza etkinlik eklenecek ve Meet linki otomatik oluşturulacak.
                    </p>
                  </div>
                </>
              )}

              {!googleStatus?.connected && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-800">
                    Otomatik Meet linki oluşturmak için Google hesabınızı bağlayın. Bağlamadan da manuel link girebilirsiniz.
                  </p>
                </div>
              )}
            </div>

          {/* Manuel toplantı linki (Google Meet bağlı değilse veya diğer türler için) */}
          {!canAutoCreateMeet && (
            <div>
              <label htmlFor="meeting_url" className="block text-sm font-medium text-gray-700 mb-2">
                Toplantı Linki
              </label>
              <input
                type="url"
                id="meeting_url"
                value={formData.meeting_url}
                onChange={(e) => setFormData({ ...formData, meeting_url: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={'https://meet.google.com/...'}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Workspace Katılımcıları
            </label>
            <div className="border border-gray-300 rounded-lg max-h-60 overflow-y-auto">
              {members?.map((member: { id: string; user_id: string; user?: { email: string }; role: string }) => (
                <label
                  key={member.id}
                  className="flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                >
                  <input
                    type="checkbox"
                    checked={selectedParticipants.includes(member.user_id)}
                    onChange={() => toggleParticipant(member.user_id)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="ml-3 text-sm text-gray-900">{member.user?.email || 'Bilinmiyor'}</span>
                  <span className="ml-auto text-xs text-gray-500">
                    {member.role === 'owner' ? 'Sahip' : member.role === 'admin' ? 'Yönetici' : 'Üye'}
                  </span>
                </label>
              ))}
            </div>
            <p className="mt-2 text-sm text-gray-500">
              {selectedParticipants.length} katılımcı seçildi
              {externalAttendees.length > 0 && ` + ${externalAttendees.length} harici katılımcı`}
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreatingMeet
                ? 'Meet Linki Oluşturuluyor...'
                : createMeeting.isPending
                ? 'Toplantı Oluşturuluyor...'
                : 'Toplantı Oluştur'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
