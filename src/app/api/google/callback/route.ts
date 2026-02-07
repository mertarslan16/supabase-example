import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const stateParam = searchParams.get('state')
  const error = searchParams.get('error')

  if (error) {
    return NextResponse.redirect(`${origin}/dashboard?google_error=${error}`)
  }

  if (!code || !stateParam) {
    return NextResponse.redirect(`${origin}/dashboard?google_error=missing_params`)
  }

  let state: { userId: string; returnUrl: string }
  try {
    state = JSON.parse(stateParam)
  } catch {
    return NextResponse.redirect(`${origin}/dashboard?google_error=invalid_state`)
  }

  const { userId, returnUrl } = state

  try {
    // Token exchange
    const tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        code,
        grant_type: 'authorization_code',
        redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
      }),
    })

    const tokens = await tokenResponse.json()

    if (tokens.error) {
      throw new Error(tokens.error_description || tokens.error)
    }

    // Token'ları veritabanına kaydet
    const supabase = await createClient()
    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000)

    const { error: upsertError } = await supabase.from('google_tokens').upsert({
      user_id: userId,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      token_type: tokens.token_type || 'Bearer',
      expires_at: expiresAt.toISOString(),
      scope: tokens.scope,
    }, {
      onConflict: 'user_id'
    })

    if (upsertError) {
      throw new Error('Token kaydetme hatası: ' + upsertError.message)
    }

    return NextResponse.redirect(`${origin}${returnUrl}?google_connected=true`)
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Bilinmeyen hata'
    console.error('Google OAuth error:', errorMessage)
    return NextResponse.redirect(
      `${origin}${returnUrl}?google_error=${encodeURIComponent(errorMessage)}`
    )
  }
}
