'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCreateWorkspace } from '@/hooks/useWorkspaces'

export default function CreateWorkspacePage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const createWorkspace = useCreateWorkspace()

  const handleNameChange = (value: string) => {
    setName(value)
    // Otomatik slug oluştur
    const autoSlug = value
      .toLowerCase()
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
    setSlug(autoSlug)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim() || !slug.trim()) {
      alert('Lütfen tüm alanları doldurun')
      return
    }

    try {
      const workspace = await createWorkspace.mutateAsync({
        name: name.trim(),
        slug: slug.trim(),
      })

      router.push(`/workspace/${workspace.id}`)
    } catch (error: any) {
      alert(error.message || 'Workspace oluşturulurken bir hata oluştu')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Yeni Workspace Oluştur
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Workspace Adı
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Örn: Şirketim"
                required
              />
            </div>

            <div>
              <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-2">
                Slug (URL için)
              </label>
              <input
                type="text"
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Örn: sirketim"
                pattern="[a-z0-9-]+"
                required
              />
              <p className="mt-1 text-sm text-gray-500">
                Sadece küçük harf, rakam ve tire kullanabilirsiniz
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={createWorkspace.isPending}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createWorkspace.isPending ? 'Oluşturuluyor...' : 'Oluştur'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
