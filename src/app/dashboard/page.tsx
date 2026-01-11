import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/Header";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Hoş Geldiniz! 🎉
          </h2>
          <p className="text-gray-600 mb-4">
            Başarıyla giriş yaptınız. Bu korumalı bir sayfadır ve sadece giriş yapmış kullanıcılar görebilir.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* User Info Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Kullanıcı Bilgileri
            </h3>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-500">Email:</span>
                <p className="text-gray-900">{user.email}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">User ID:</span>
                <p className="text-gray-900 text-sm font-mono break-all">
                  {user.id}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Son Giriş:</span>
                <p className="text-gray-900">
                  {user.last_sign_in_at
                    ? new Date(user.last_sign_in_at).toLocaleString("tr-TR")
                    : "Bilinmiyor"}
                </p>
              </div>
            </div>
          </div>

          {/* Auth Provider Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Oturum Bilgileri
            </h3>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-500">Provider:</span>
                <p className="text-gray-900">
                  {user.app_metadata?.provider || "email"}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Email Doğrulandı:</span>
                <p className="text-gray-900">
                  {user.email_confirmed_at ? (
                    <span className="text-green-600">✓ Evet</span>
                  ) : (
                    <span className="text-yellow-600">✗ Hayır</span>
                  )}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Hesap Oluşturma:</span>
                <p className="text-gray-900">
                  {new Date(user.created_at).toLocaleString("tr-TR")}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Hızlı İşlemler
            </h3>
            <div className="space-y-3">
              <Link
                href="/workspace/create"
                className="block w-full bg-blue-600 text-white text-center py-2 px-4 rounded-lg hover:bg-blue-700 transition"
              >
                + Yeni Workspace Oluştur
              </Link>
              <Link
                href="/profile"
                className="block w-full bg-gray-200 text-gray-800 text-center py-2 px-4 rounded-lg hover:bg-gray-300 transition"
              >
                Profili Düzenle
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
