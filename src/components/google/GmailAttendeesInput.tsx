'use client'

import { useState } from 'react'

interface GmailAttendeesInputProps {
  attendees: string[]
  onChange: (attendees: string[]) => void
}

export function GmailAttendeesInput({ attendees, onChange }: GmailAttendeesInputProps) {
  const [inputValue, setInputValue] = useState('')
  const [error, setError] = useState('')

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const addEmail = () => {
    const email = inputValue.trim().toLowerCase()

    if (!email) return

    if (!isValidEmail(email)) {
      setError('Geçerli bir email adresi girin')
      return
    }

    if (attendees.includes(email)) {
      setError('Bu email zaten eklendi')
      return
    }

    onChange([...attendees, email])
    setInputValue('')
    setError('')
  }

  const removeEmail = (emailToRemove: string) => {
    onChange(attendees.filter(e => e !== emailToRemove))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addEmail()
    }
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Gmail ile Davet Et (Harici Katılımcılar)
      </label>

      <div className="flex gap-2">
        <input
          type="email"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value)
            setError('')
          }}
          onKeyDown={handleKeyDown}
          placeholder="ornek@gmail.com"
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          type="button"
          onClick={addEmail}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Ekle
        </button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {attendees.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {attendees.map((email) => (
            <span
              key={email}
              className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
            >
              {email}
              <button
                type="button"
                onClick={() => removeEmail(email)}
                className="ml-1 text-blue-600 hover:text-blue-800"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-500">
        {attendees.length > 0
          ? `${attendees.length} harici katılımcı eklendi`
          : 'Email adresi yazıp Enter tuşuna basın veya Ekle butonuna tıklayın'
        }
      </p>
    </div>
  )
}
