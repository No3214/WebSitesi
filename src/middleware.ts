import { NextResponse, type NextRequest } from "next/server";

/**
 * /admin/growth (özel Büyüme paneli) edge guard.
 *
 * NEDEN: Sayfa içindeki `redirect("/admin")` guard'ı, root layout streaming
 * (Suspense) başladıktan sonra çalıştığı için Next 307 yerine "200 + stream
 * içi RSC redirect" döndürüyordu. JS'li tarayıcı yönleniyor (içerik render
 * EDİLMİYOR, veri sızmıyor) ama JS çalıştırmayan HTTP istemcisi 200 görüyordu
 * — zayıf güvenlik posture'u.
 *
 * ÇÖZÜM: Payload oturum cookie'si (`payload-token`) yoksa, herhangi bir render/
 * streaming BAŞLAMADAN edge'de gerçek 307 ile /admin login'e yönlendir
 * (fail-closed). Cookie varsa sayfaya bırak; tam rol doğrulaması (admin mi?)
 * orada `payload.auth()` ile yapılır → defense-in-depth. Süresi geçmiş/geçersiz
 * token nadir durumunda sayfa guard'ı yine kapatır.
 *
 * KAPSAM: yalnız /admin/growth. Payload'ın kendi /admin paneli ve /api/[...slug]
 * uçlarına DOKUNULMAZ (matcher dışında).
 */
export function middleware(req: NextRequest): NextResponse {
  const hasSession = req.cookies.has("payload-token");

  if (!hasSession) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin";
    url.search = "";
    return NextResponse.redirect(url, 307);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/growth", "/admin/growth/:path*"],
};
