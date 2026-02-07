'use client'

import { useState } from 'react'
import Link from 'next/link'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { useWorkspace } from '@/hooks/useWorkspaces'
import { useMeetings, useUpdateMeeting } from '@/hooks/useMeetings'

export default function WorkspaceCalendarPage({
  params,
}: {
  params: { workspaceId: string }
}) {
  const { workspaceId } = params
  const { data: workspace } = useWorkspace(workspaceId)
  const { data: meetings, isLoading } = useMeetings(workspaceId)
  const updateMeeting = useUpdateMeeting('')
  const [selectedMeeting, setSelectedMeeting] = useState<any>(null)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  // FullCalendar eventleri oluştur
  const events = meetings?.map((meeting) => ({
    id: meeting.id,
    title: meeting.title,
    start: meeting.start_time,
    end: meeting.end_time,
    backgroundColor:
      meeting.meeting_type === 'google_meet' ? '#34A853' :
      '#6B7280',
    borderColor: 'transparent',
    extendedProps: {
      description: meeting.description,
      meetingType: meeting.meeting_type,
      meetingUrl: meeting.meeting_url,
      participants: meeting.meeting_participants,
    },
  })) || []

  const handleEventClick = (info: any) => {
    const meeting = meetings?.find(m => m.id === info.event.id)
    setSelectedMeeting(meeting)
  }

  const handleEventDrop = async (info: any) => {
    try {
      await updateMeeting.mutateAsync({
        start_time: info.event.start.toISOString(),
        end_time: info.event.end.toISOString(),
      })
    } catch (error) {
      info.revert()
      alert('Toplantı güncellenirken bir hata oluştu')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <Link href={`/workspace/${workspaceId}`} className="text-blue-600 hover:text-blue-700 text-sm mb-2 inline-block">
                ← Geri dön
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">Takvim</h1>
              <p className="text-gray-500 mt-1">{workspace?.name}</p>
            </div>
            <Link
              href={`/workspace/${workspaceId}/meetings/new`}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              + Yeni Toplantı
            </Link>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay',
            }}
            buttonText={{
              today: 'Bugün',
              month: 'Ay',
              week: 'Hafta',
              day: 'Gün',
            }}
            events={events}
            editable={true}
            eventClick={handleEventClick}
            eventDrop={handleEventDrop}
            height="auto"
            nowIndicator={true}
            dayMaxEvents={3}
          />
        </div>
      </div>

      {/* Meeting Detail Modal */}
      {selectedMeeting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">{selectedMeeting.title}</h2>
              <button
                onClick={() => setSelectedMeeting(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-sm font-medium text-gray-500">Açıklama</span>
                <p className="mt-1 text-gray-900">{selectedMeeting.description || 'Açıklama yok'}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-500">Başlangıç</span>
                  <p className="mt-1 text-gray-900">
                    {new Date(selectedMeeting.start_time).toLocaleDateString('tr-TR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Bitiş</span>
                  <p className="mt-1 text-gray-900">
                    {new Date(selectedMeeting.end_time).toLocaleDateString('tr-TR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>

              <div>
                <span className="text-sm font-medium text-gray-500">Toplantı Türü</span>
                <p className="mt-1">
                  <span className="px-3 py-1 text-sm font-medium rounded-full bg-green-100 text-green-800">
                    {selectedMeeting.meeting_type === 'google_meet' ? 'Google Meet' : selectedMeeting.meeting_type}
                  </span>
                </p>
              </div>

              {(selectedMeeting.google_meet_link || selectedMeeting.meeting_url) && (
                <div>
                  <span className="text-sm font-medium text-gray-500">Toplantı Linki</span>
                  <a
                    href={selectedMeeting.google_meet_link || selectedMeeting.meeting_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 mt-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Toplantıya Katıl
                  </a>
                </div>
              )}

              <div>
                <span className="text-sm font-medium text-gray-500">Katılımcılar</span>
                <div className="mt-2 space-y-2">
                  {selectedMeeting.meeting_participants?.length > 0 ? (
                    selectedMeeting.meeting_participants.map((participant: any) => (
                      <div key={participant.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm text-gray-900">{participant.user?.email || participant.external_email || 'Kullanıcı'}</span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          participant.status === 'accepted' ? 'bg-green-100 text-green-800' :
                          participant.status === 'declined' ? 'bg-red-100 text-red-800' :
                          participant.status === 'maybe' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {participant.status === 'accepted' ? 'Kabul' :
                           participant.status === 'declined' ? 'Reddetti' :
                           participant.status === 'maybe' ? 'Belki' : 'Bekliyor'}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">Henüz katılımcı yok</p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setSelectedMeeting(null)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                Kapat
              </button>
              <Link
                href={`/workspace/${workspaceId}/meetings`}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-center"
              >
                Tüm Toplantılar
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
