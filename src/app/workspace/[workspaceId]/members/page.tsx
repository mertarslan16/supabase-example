'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useWorkspace } from '@/hooks/useWorkspaces'
import { useWorkspaceMembers, useCreateWorkspaceInvite, useRemoveWorkspaceMember, useUpdateWorkspaceMember } from '@/hooks/useWorkspaceMembers'

export default function WorkspaceMembersPage({
  params,
}: {
  params: { workspaceId: string }
}) {
  const { workspaceId } = params
  const { data: workspace, isLoading: workspaceLoading } = useWorkspace(workspaceId)
  const { data: members, isLoading: membersLoading, error } = useWorkspaceMembers(workspaceId)
  const createInvite = useCreateWorkspaceInvite()
  const removeMember = useRemoveWorkspaceMember()
  const updateMember = useUpdateWorkspaceMember()

  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'admin' | 'member'>('member')

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!inviteEmail.trim()) {
      alert('Lütfen email adresi girin')
      return
    }

    try {
      // 7 gün sonra sona erecek
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 7)

      await createInvite.mutateAsync({
        workspace_id: workspaceId,
        email: inviteEmail.trim(),
        role: inviteRole,
        expires_at: expiresAt.toISOString(),
      })

      setInviteEmail('')
      setShowInviteModal(false)
      alert('Davet gönderildi!')
    } catch (error: any) {
      alert(error.message || 'Davet gönderilirken bir hata oluştu')
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Bu üyeyi kaldırmak istediğinize emin misiniz?')) return

    try {
      await removeMember.mutateAsync({ workspaceId, memberId })
    } catch (error: any) {
      alert(error.message || 'Üye kaldırılırken bir hata oluştu')
    }
  }

  const handleChangeRole = async (memberId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'member' : 'admin'

    try {
      await updateMember.mutateAsync({
        memberId,
        updates: { role: newRole },
      })
    } catch (error: any) {
      alert(error.message || 'Rol değiştirilirken bir hata oluştu')
    }
  }

  if (workspaceLoading || membersLoading) {
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
          <p className="text-red-600">Üyeler yüklenirken bir hata oluştu.</p>
        </div>
      </div>
    )
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
              <h1 className="text-3xl font-bold text-gray-900">Workspace Üyeleri</h1>
              <p className="text-gray-500 mt-1">{workspace?.name}</p>
            </div>
            <button
              onClick={() => setShowInviteModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              + Üye Davet Et
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Katılma Tarihi
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {members?.map((member: any) => (
                <tr key={member.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {member.user?.email || 'Bilinmiyor'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      member.role === 'owner' ? 'bg-purple-100 text-purple-800' :
                      member.role === 'admin' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {member.role === 'owner' ? 'Sahip' : member.role === 'admin' ? 'Yönetici' : 'Üye'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(member.created_at).toLocaleDateString('tr-TR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {member.role !== 'owner' && (
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => handleChangeRole(member.id, member.role)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          {member.role === 'admin' ? 'Üye Yap' : 'Yönetici Yap'}
                        </button>
                        <button
                          onClick={() => handleRemoveMember(member.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Kaldır
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Üye Davet Et</h2>
            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Adresi
                </label>
                <input
                  type="email"
                  id="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="ornek@email.com"
                  required
                />
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                  Rol
                </label>
                <select
                  id="role"
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as 'admin' | 'member')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="member">Üye</option>
                  <option value="admin">Yönetici</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowInviteModal(false)
                    setInviteEmail('')
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={createInvite.isPending}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {createInvite.isPending ? 'Gönderiliyor...' : 'Davet Gönder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
