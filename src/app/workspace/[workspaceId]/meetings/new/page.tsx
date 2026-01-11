'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useWorkspace } from '@/hooks/useWorkspaces'
import { useWorkspaceMembers } from '@/hooks/useWorkspaceMembers'
import { useCreateMeeting, useAddMeetingParticipant } from '@/hooks/useMeetings'

export default function NewMeetingPage({
  params,
}: {
  params: { workspaceId: string }
}) {
  const router = useRouter()
  const { workspaceId } = params
  const { data: workspace } = useWorkspace(workspaceId)
  const { data: members } = useWorkspaceMembers(workspaceId)
  const createMeeting = useCreateMeeting()
  const addParticipant = useAddMeetingParticipant()

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    meeting_type: 'zoom' as 'zoom' | 'google_meet' | 'teams' | 'other',
    meeting_url: '',
  })
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([])

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
      const meeting = await createMeeting.mutateAsync({
        workspace_id: workspaceId,
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        start_time: new Date(formData.start_time).toISOString(),
        end_time: new Date(formData.end_time).toISOString(),
        meeting_type: formData.meeting_type,
        meeting_url: formData.meeting_url.trim() || null,
      })

      // Katılımcıları ekle
      for (const userId of selectedParticipants) {
        await addParticipant.mutateAsync({
          meeting_id: meeting.id,
          user_id: userId,
          status: 'pending',
        })
      }

      router.push(`/workspace/${workspaceId}/meetings`)
    } catch (error: any) {
      alert(error.message || 'Toplantı oluşturulurken bir hata oluştu')
    }
  }

  const toggleParticipant = (userId: string) => {
    setSelectedParticipants(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

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
              onChange={(e) => setFormData({ ...formData, meeting_type: e.target.value as any })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="zoom">Zoom</option>
              <option value="google_meet">Google Meet</option>
              <option value="teams">Microsoft Teams</option>
              <option value="other">Diğer</option>
            </select>
          </div>

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
              placeholder="https://zoom.us/j/..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Katılımcılar
            </label>
            <div className="border border-gray-300 rounded-lg max-h-60 overflow-y-auto">
              {members?.map((member: any) => (
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
              disabled={createMeeting.isPending}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createMeeting.isPending ? 'Oluşturuluyor...' : 'Toplantı Oluştur'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
