'use client'

import Link from 'next/link'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'
import { useWorkspace } from '@/hooks/useWorkspaces'
import { useMeetings, useDeleteMeeting } from '@/hooks/useMeetings'

export default function MeetingsListPage({
  params,
}: {
  params: { workspaceId: string }
}) {
  const { workspaceId } = params
  const { data: workspace } = useWorkspace(workspaceId)
  const { data: meetings, isLoading, error } = useMeetings(workspaceId)
  const deleteMeeting = useDeleteMeeting()

  const handleDelete = async (meetingId: string) => {
    if (!confirm('Bu toplantıyı silmek istediğinize emin misiniz?')) return

    try {
      await deleteMeeting.mutateAsync({ workspaceId, meetingId })
    } catch (error: any) {
      alert(error.message || 'Toplantı silinirken bir hata oluştu')
    }
  }

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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h2 className="text-red-800 font-semibold mb-2">Hata</h2>
          <p className="text-red-600">Toplantılar yüklenirken bir hata oluştu.</p>
        </div>
      </div>
    )
  }

  const now = new Date()
  const upcomingMeetings = meetings?.filter(m => new Date(m.start_time) > now) || []
  const pastMeetings = meetings?.filter(m => new Date(m.start_time) <= now) || []

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
              <h1 className="text-3xl font-bold text-gray-900">Toplantılar</h1>
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

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Yaklaşan Toplantılar */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Yaklaşan Toplantılar ({upcomingMeetings.length})
          </h2>
          {upcomingMeetings.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-500">Yaklaşan toplantı bulunmuyor</p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingMeetings.map((meeting) => (
                <div key={meeting.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{meeting.title}</h3>
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                          meeting.meeting_type === 'zoom' ? 'bg-blue-100 text-blue-800' :
                          meeting.meeting_type === 'google_meet' ? 'bg-green-100 text-green-800' :
                          meeting.meeting_type === 'teams' ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {meeting.meeting_type}
                        </span>
                      </div>
                      {meeting.description && (
                        <p className="text-gray-600 mb-3">{meeting.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {format(new Date(meeting.start_time), 'PPP p', { locale: tr })}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                          {meeting.meeting_participants?.length || 0} katılımcı
                        </span>
                      </div>
                      {meeting.meeting_url && (
                        <a
                          href={meeting.meeting_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 mt-3 text-sm text-blue-600 hover:text-blue-700"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          Toplantıya Katıl
                        </a>
                      )}
                    </div>
                    <button
                      onClick={() => handleDelete(meeting.id)}
                      className="text-red-600 hover:text-red-700 p-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Geçmiş Toplantılar */}
        {pastMeetings.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Geçmiş Toplantılar ({pastMeetings.length})
            </h2>
            <div className="space-y-4">
              {pastMeetings.map((meeting) => (
                <div key={meeting.id} className="bg-white rounded-lg shadow p-6 opacity-75">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{meeting.title}</h3>
                        <span className="px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                          {meeting.meeting_type}
                        </span>
                      </div>
                      {meeting.description && (
                        <p className="text-gray-600 mb-3">{meeting.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {format(new Date(meeting.start_time), 'PPP p', { locale: tr })}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(meeting.id)}
                      className="text-red-600 hover:text-red-700 p-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
