import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Next.js + Supabase Auth
          </h1>
          <p className="text-gray-600 mb-8">
            Kapsamlı authentication örneği
          </p>

          {user ? (
            <div className="space-y-4">
              <p className="text-green-600 font-medium">
                Hoş geldin, {user.email}!
              </p>
              <Link
                href="/dashboard"
                className="inline-block w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition"
              >
                Dashboard'a Git
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <Link
                href="/login"
                className="block w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition text-center"
              >
                Giriş Yap
              </Link>
              <Link
                href="/register"
                className="block w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-300 transition text-center"
              >
                Kayıt Ol
              </Link>
            </div>
          )}
        </div>

        <div className="mt-12 border-t pt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Bu örnekte neler var?
          </h2>
          <ul className="space-y-2 text-gray-600">
            <li>✅ Email/Şifre ile kayıt</li>
            <li>✅ Email/Şifre ile giriş</li>
            <li>✅ Şifremi unuttum</li>
            <li>✅ Şifre sıfırlama</li>
            <li>✅ Korumalı rotalar (middleware)</li>
            <li>✅ Server-side auth kontrolü</li>
            <li>✅ Client-side auth kontrolü</li>
            <li>✅ Çıkış yapma</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
