'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useWorkspace } from '@/hooks/useWorkspaces'
import { useEmailTemplate, useUpdateEmailTemplate } from '@/hooks/useEmailTemplates'

// CKEditor'ü dynamic import ile yükle (SSR'da sorun olmaması için)
const CKEditor = dynamic(() => import('@ckeditor/ckeditor5-react').then(mod => mod.CKEditor), {
  ssr: false,
})

let ClassicEditor: any = null
if (typeof window !== 'undefined') {
  ClassicEditor = require('@ckeditor/ckeditor5-build-classic')
}

export default function EditTemplatePage({
  params,
}: {
  params: { workspaceId: string; templateId: string }
}) {
  const router = useRouter()
  const { workspaceId, templateId } = params
  const { data: workspace } = useWorkspace(workspaceId)
  const { data: template, isLoading, error } = useEmailTemplate(templateId)
  const updateTemplate = useUpdateEmailTemplate(templateId)

  const [name, setName] = useState('')
  const [subject, setSubject] = useState('')
  const [content, setContent] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (template) {
      setName(template.name)
      setSubject(template.subject)
      setContent(template.content)
    }
  }, [template])

  const handleSave = async () => {
    if (!name.trim() || !subject.trim()) {
      alert('Lütfen şablon adı ve konuyu doldurun')
      return
    }

    setIsSaving(true)
    try {
      await updateTemplate.mutateAsync({
        name: name.trim(),
        subject: subject.trim(),
        content: content,
      })
      alert('Şablon kaydedildi!')
    } catch (error: any) {
      alert(error.message || 'Şablon kaydedilirken bir hata oluştu')
    } finally {
      setIsSaving(false)
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

  if (error || !template) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h2 className="text-red-800 font-semibold mb-2">Hata</h2>
          <p className="text-red-600">Şablon yüklenirken bir hata oluştu.</p>
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
              <Link href={`/workspace/${workspaceId}/templates`} className="text-blue-600 hover:text-blue-700 text-sm mb-2 inline-block">
                ← Geri dön
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">Şablon Düzenle</h1>
              <p className="text-gray-500 mt-1">{workspace?.name}</p>
            </div>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-8 space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Şablon Adı
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Şablon adı"
            />
          </div>

          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
              Email Konusu
            </label>
            <input
              type="text"
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Email konusu"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email İçeriği
            </label>
            {ClassicEditor && (
              <div className="border border-gray-300 rounded-lg overflow-hidden">
                <CKEditor
                  editor={ClassicEditor}
                  data={content}
                  onChange={(event: any, editor: any) => {
                    const data = editor.getData()
                    setContent(data)
                  }}
                  config={{
                    toolbar: [
                      'heading',
                      '|',
                      'bold',
                      'italic',
                      'link',
                      'bulletedList',
                      'numberedList',
                      '|',
                      'blockQuote',
                      'insertTable',
                      '|',
                      'undo',
                      'redo',
                    ],
                  }}
                />
              </div>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">Kullanılabilir Placeholder'lar:</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
              <code className="bg-white px-2 py-1 rounded border border-blue-300">{'{{name}}'}</code>
              <code className="bg-white px-2 py-1 rounded border border-blue-300">{'{{email}}'}</code>
              <code className="bg-white px-2 py-1 rounded border border-blue-300">{'{{date}}'}</code>
              <code className="bg-white px-2 py-1 rounded border border-blue-300">{'{{company}}'}</code>
              <code className="bg-white px-2 py-1 rounded border border-blue-300">{'{{title}}'}</code>
              <code className="bg-white px-2 py-1 rounded border border-blue-300">{'{{link}}'}</code>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-500">
              <p>Son güncelleme: {new Date(template.updated_at).toLocaleString('tr-TR')}</p>
              <p>Oluşturulma: {new Date(template.created_at).toLocaleString('tr-TR')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
