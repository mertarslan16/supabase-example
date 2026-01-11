'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useWorkspace } from '@/hooks/useWorkspaces'
import { useEmailTemplates, useDeleteEmailTemplate, useCreateEmailTemplate } from '@/hooks/useEmailTemplates'

export default function EmailTemplatesPage({
  params,
}: {
  params: { workspaceId: string }
}) {
  const { workspaceId } = params
  const { data: workspace } = useWorkspace(workspaceId)
  const { data: templates, isLoading, error } = useEmailTemplates(workspaceId)
  const deleteTemplate = useDeleteEmailTemplate()
  const createTemplate = useCreateEmailTemplate()

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newTemplateName, setNewTemplateName] = useState('')

  const handleDelete = async (templateId: string) => {
    if (!confirm('Bu şablonu silmek istediğinize emin misiniz?')) return

    try {
      await deleteTemplate.mutateAsync({ workspaceId, templateId })
    } catch (error: any) {
      alert(error.message || 'Şablon silinirken bir hata oluştu')
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newTemplateName.trim()) {
      alert('Lütfen şablon adı girin')
      return
    }

    try {
      const template = await createTemplate.mutateAsync({
        workspace_id: workspaceId,
        name: newTemplateName.trim(),
        subject: 'Yeni Email',
        content: '<p>Email içeriğinizi buraya yazın...</p>',
      })

      setShowCreateModal(false)
      setNewTemplateName('')
      window.location.href = `/workspace/${workspaceId}/templates/${template.id}`
    } catch (error: any) {
      alert(error.message || 'Şablon oluşturulurken bir hata oluştu')
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
          <p className="text-red-600">Şablonlar yüklenirken bir hata oluştu.</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Email Şablonları</h1>
              <p className="text-gray-500 mt-1">{workspace?.name}</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              + Yeni Şablon
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {templates?.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz şablon yok</h3>
            <p className="text-gray-500 mb-6">İlk email şablonunuzu oluşturarak başlayın</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Yeni Şablon Oluştur
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates?.map((template: any) => (
              <div key={template.id} className="bg-white rounded-lg shadow hover:shadow-md transition">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                    <button
                      onClick={() => handleDelete(template.id)}
                      className="text-red-600 hover:text-red-700 p-1"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">Konu: {template.subject}</p>
                  <div className="text-xs text-gray-500 mb-4">
                    Oluşturulma: {new Date(template.created_at).toLocaleDateString('tr-TR')}
                  </div>
                  <Link
                    href={`/workspace/${workspaceId}/templates/${template.id}`}
                    className="block w-full px-4 py-2 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 transition"
                  >
                    Düzenle
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Placeholder Desteği</h3>
          <p className="text-blue-800 mb-3">Email şablonlarınızda aşağıdaki placeholder'ları kullanabilirsiniz:</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
            <code className="bg-white px-2 py-1 rounded border border-blue-300">{'{{name}}'}</code>
            <code className="bg-white px-2 py-1 rounded border border-blue-300">{'{{email}}'}</code>
            <code className="bg-white px-2 py-1 rounded border border-blue-300">{'{{date}}'}</code>
            <code className="bg-white px-2 py-1 rounded border border-blue-300">{'{{company}}'}</code>
            <code className="bg-white px-2 py-1 rounded border border-blue-300">{'{{title}}'}</code>
            <code className="bg-white px-2 py-1 rounded border border-blue-300">{'{{link}}'}</code>
          </div>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Yeni Şablon Oluştur</h2>
            <form onSubmit={handleCreate}>
              <div className="mb-6">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Şablon Adı
                </label>
                <input
                  type="text"
                  id="name"
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Örn: Hoşgeldin Emaili"
                  required
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false)
                    setNewTemplateName('')
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={createTemplate.isPending}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {createTemplate.isPending ? 'Oluşturuluyor...' : 'Oluştur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
