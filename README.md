# Next.js + Supabase Auth Örneği

Bu proje, Next.js 14 (App Router) ve Supabase kullanarak tam bir authentication sistemi örneğidir.

## Özellikler

- ✅ Email/Şifre ile kayıt
- ✅ Email/Şifre ile giriş
- ✅ Şifremi unuttum
- ✅ Şifre sıfırlama
- ✅ Korumalı rotalar (middleware)
- ✅ Server-side auth kontrolü
- ✅ Client-side auth kontrolü
- ✅ Çıkış yapma
- ✅ Profil sayfası
- ✅ Şifre değiştirme

## Kurulum

### 1. Bağımlılıkları Yükle

```bash
npm install
```

### 2. Supabase Projesini Oluştur

1. [Supabase](https://supabase.com) hesabı oluştur
2. Yeni bir proje oluştur
3. Dashboard > Settings > API kısmından URL ve Anon Key'i al

### 3. Environment Variables

`.env.local.example` dosyasını `.env.local` olarak kopyala ve Supabase bilgilerini ekle:

```bash
cp .env.local.example .env.local
```

`.env.local` dosyasını düzenle:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxxx...
```

### 4. Supabase Authentication Ayarları

Supabase Dashboard'da:

1. **Authentication > Settings > Email** kısmına git
2. "Enable Email Signup" seçeneğini aktif et
3. Email template'lerini Türkçe'ye çevirebilirsin (opsiyonel)

### 5. URL Configuration

Supabase Dashboard > Authentication > URL Configuration:

- **Site URL**: `http://localhost:3000` (development için)
- **Redirect URLs**: 
  - `http://localhost:3000/auth/callback`
  - `http://localhost:3000/reset-password`

Production için domain'ini de ekle!

### 6. Uygulamayı Çalıştır

```bash
npm run dev
```

Tarayıcıda `http://localhost:3000` adresine git.

## Proje Yapısı

```
src/
├── app/
│   ├── auth/
│   │   └── callback/
│   │       └── route.ts          # Email doğrulama callback
│   ├── dashboard/
│   │   └── page.tsx              # Korumalı dashboard sayfası
│   ├── forgot-password/
│   │   └── page.tsx              # Şifremi unuttum sayfası
│   ├── login/
│   │   └── page.tsx              # Giriş sayfası
│   ├── profile/
│   │   └── page.tsx              # Profil ve şifre değiştirme
│   ├── register/
│   │   └── page.tsx              # Kayıt sayfası
│   ├── reset-password/
│   │   └── page.tsx              # Şifre sıfırlama sayfası
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                  # Ana sayfa
├── components/
│   └── LogoutButton.tsx          # Çıkış butonu
├── lib/
│   └── supabase/
│       ├── client.ts             # Browser client
│       └── server.ts             # Server client
└── middleware.ts                 # Route koruması
```

## Nasıl Çalışır?

### Authentication Flow

1. **Kayıt**: Kullanıcı email ve şifre ile kayıt olur. Supabase doğrulama emaili gönderir.
2. **Email Doğrulama**: Kullanıcı emaildeki linke tıklar, `/auth/callback` route'u session'ı oluşturur.
3. **Giriş**: Kullanıcı email ve şifre ile giriş yapar.
4. **Korumalı Rotalar**: Middleware, `/dashboard` ve `/profile` rotalarını korur.
5. **Çıkış**: Kullanıcı çıkış yapar, session silinir.

### Middleware Koruması

`middleware.ts` dosyası:
- `/dashboard` ve `/profile` rotalarına giriş yapmamış kullanıcıların erişimini engeller
- `/login` ve `/register` rotalarına giriş yapmış kullanıcıları dashboard'a yönlendirir

### Server vs Client Components

- **Server Components**: `createClient()` from `@/lib/supabase/server` kullanır
- **Client Components**: `createClient()` from `@/lib/supabase/client` kullanır

## Önemli Notlar

1. **Email Doğrulama**: Development'ta Supabase email rate limit'lere dikkat et
2. **Production**: Site URL ve Redirect URL'leri production domain'ine güncelle
3. **Güvenlik**: `NEXT_PUBLIC_` prefix'li env variable'lar client'ta görünür, sadece anon key kullan

## Lisans

MIT
