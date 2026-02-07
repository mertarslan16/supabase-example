-- Google OAuth Token'ları için tablo
CREATE TABLE IF NOT EXISTS google_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  token_type TEXT DEFAULT 'Bearer',
  expires_at TIMESTAMPTZ NOT NULL,
  scope TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- RLS politikaları
ALTER TABLE google_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "google_tokens_select"
  ON google_tokens FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "google_tokens_insert"
  ON google_tokens FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "google_tokens_update"
  ON google_tokens FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "google_tokens_delete"
  ON google_tokens FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Meetings tablosuna Google Calendar kolonları ekleme
ALTER TABLE meetings
ADD COLUMN IF NOT EXISTS google_calendar_event_id TEXT,
ADD COLUMN IF NOT EXISTS google_meet_link TEXT;

-- Meeting participants tablosuna harici email desteği ekleme
ALTER TABLE meeting_participants
ADD COLUMN IF NOT EXISTS external_email TEXT,
ADD COLUMN IF NOT EXISTS is_external BOOLEAN DEFAULT FALSE;

-- user_id'yi nullable yap (harici katılımcılar için)
ALTER TABLE meeting_participants
ALTER COLUMN user_id DROP NOT NULL;

-- Updated_at trigger fonksiyonu (eğer yoksa)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- google_tokens için updated_at trigger
DROP TRIGGER IF EXISTS update_google_tokens_updated_at ON google_tokens;
CREATE TRIGGER update_google_tokens_updated_at
  BEFORE UPDATE ON google_tokens
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- İndeksler
CREATE INDEX IF NOT EXISTS idx_google_tokens_user_id ON google_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_meetings_google_event_id ON meetings(google_calendar_event_id);
CREATE INDEX IF NOT EXISTS idx_meeting_participants_external_email ON meeting_participants(external_email);
