import { SupabaseClient } from '@supabase/supabase-js'

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'

export async function refreshTokenIfNeeded(
  supabase: SupabaseClient,
  userId: string
): Promise<string> {
  const { data: tokenData, error } = await supabase
    .from('google_tokens')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error || !tokenData) {
    throw new Error('Google hesabı bağlı değil')
  }

  const expiresAt = new Date(tokenData.expires_at)
  const now = new Date()
  const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000)

  // Token 5 dakika içinde expire olacaksa yenile
  if (expiresAt <= fiveMinutesFromNow) {
    const refreshedTokens = await refreshAccessToken(tokenData.refresh_token)

    const newExpiresAt = new Date(Date.now() + refreshedTokens.expires_in * 1000)

    await supabase.from('google_tokens').update({
      access_token: refreshedTokens.access_token,
      expires_at: newExpiresAt.toISOString(),
      updated_at: new Date().toISOString(),
    }).eq('user_id', userId)

    return refreshedTokens.access_token
  }

  return tokenData.access_token
}

async function refreshAccessToken(refreshToken: string): Promise<{
  access_token: string
  expires_in: number
}> {
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  })

  const tokens = await response.json()

  if (tokens.error) {
    throw new Error(`Token yenileme hatası: ${tokens.error_description || tokens.error}`)
  }

  return tokens
}

export async function getGoogleConnectionStatus(
  supabase: SupabaseClient,
  userId: string
): Promise<{ connected: boolean; isExpired?: boolean; expiresAt?: string }> {
  const { data: token } = await supabase
    .from('google_tokens')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (!token) {
    return { connected: false }
  }

  const isExpired = new Date(token.expires_at) < new Date()

  return {
    connected: true,
    isExpired,
    expiresAt: token.expires_at,
  }
}

export async function deleteGoogleTokens(
  supabase: SupabaseClient,
  userId: string
): Promise<void> {
  const { error } = await supabase
    .from('google_tokens')
    .delete()
    .eq('user_id', userId)

  if (error) {
    throw new Error('Token silme hatası: ' + error.message)
  }
}
