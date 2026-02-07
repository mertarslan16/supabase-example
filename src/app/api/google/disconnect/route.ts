import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { deleteGoogleTokens } from '@/lib/google/token-manager'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await deleteGoogleTokens(supabase, user.id)
    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Bilinmeyen hata'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
