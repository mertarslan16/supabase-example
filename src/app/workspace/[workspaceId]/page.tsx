'use client'

import Link from 'next/link'
import { Header } from '@/components/Header'
import { useWorkspace } from '@/hooks/useWorkspaces'
import { useWorkspaceMembers } from '@/hooks/useWorkspaceMembers'
import { useMeetings } from '@/hooks/useMeetings'

export default function WorkspaceDashboardPage({
  params,
}: {
  params: { workspaceId: string }
}) {
  const { workspaceId } = params
  const { data: workspace, isLoading: workspaceLoading, error: workspaceError } = useWorkspace(workspaceId)
  const { data: members, isLoading: membersLoading } = useWorkspaceMembers(workspaceId)
  const { data: meetings, isLoading: meetingsLoading } = useMeetings(workspaceId)

  if (workspaceLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (workspaceError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h2 className="text-red-800 font-semibold mb-2">Hata</h2>
          <p className="text-red-600">Workspace yüklenirken bir hata oluştu.</p>
        </div>
      </div>
    )
  }

  if (!workspace) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md">
          <h2 className="text-yellow-800 font-semibold mb-2">Workspace Bulunamadı</h2>
          <p className="text-yellow-600">Bu workspace'e erişiminiz yok veya mevcut değil.</p>
        </div>
      </div>
    )
  }

  const upcomingMeetings = meetings?.filter(m => new Date(m.start_time) > new Date()).slice(0, 5) || []

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Page Title */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">{workspace.name}</h1>
          <p className="text-gray-500 mt-1">/{workspace.slug}</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Üyeler Kartı */}
          <Link href={`/workspace/${workspaceId}/members`} className="bg-white rounded-lg shadow p-6 hover:shadow-md transition">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Üyeler</h2>
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            {membersLoading ? (
              <p className="text-gray-400">Yükleniyor...</p>
            ) : (
              <p className="text-3xl font-bold text-blue-600">{members?.length || 0}</p>
            )}
          </Link>

          {/* Toplantılar Kartı */}
          <Link href={`/workspace/${workspaceId}/meetings`} className="bg-white rounded-lg shadow p-6 hover:shadow-md transition">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Toplantılar</h2>
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            {meetingsLoading ? (
              <p className="text-gray-400">Yükleniyor...</p>
            ) : (
              <p className="text-3xl font-bold text-green-600">{meetings?.length || 0}</p>
            )}
          </Link>

          {/* Takvim Kartı */}
          <Link href={`/workspace/${workspaceId}/calendar`} className="bg-white rounded-lg shadow p-6 hover:shadow-md transition">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Takvim</h2>
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-sm text-gray-600">Toplantıları görüntüle</p>
          </Link>

          {/* Email Şablonları Kartı */}
          <Link href={`/workspace/${workspaceId}/templates`} className="bg-white rounded-lg shadow p-6 hover:shadow-md transition">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Email Şablonları</h2>
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-sm text-gray-600">Şablonları yönet</p>
          </Link>
        </div>

        {/* Yaklaşan Toplantılar */}
        {upcomingMeetings.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Yaklaşan Toplantılar</h2>
              <div className="space-y-3">
                {upcomingMeetings.map((meeting) => (
                  <div key={meeting.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">{meeting.title}</h3>
                      <p className="text-sm text-gray-500">
                        {new Date(meeting.start_time).toLocaleDateString('tr-TR', {
                          day: 'numeric',
                          month: 'long',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                      {meeting.meeting_type}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
