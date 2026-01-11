'use client'

import Link from 'next/link'
import { WorkspaceSelector } from './WorkspaceSelector'
import { LogoutButton } from './LogoutButton'

export function Header() {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">W</span>
            </div>
            <span className="font-bold text-xl text-gray-900">WorkSpace</span>
          </Link>

          {/* Workspace Selector */}
          <div className="flex items-center gap-4">
            <WorkspaceSelector />
            <LogoutButton />
          </div>
        </div>
      </div>
    </header>
  )
}
