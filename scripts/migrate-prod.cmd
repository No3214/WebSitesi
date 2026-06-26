@echo off
REM ==========================================================================
REM  Kozbeyli Konagi - Payload (Supabase) PROD sema migration
REM  KULLANIM: Bu dosyayi CIFT TIKLA, ya da repo klasorunde:  scripts\migrate-prod.cmd
REM  (Komutlari ELLE YAZMA. Script zaten dogru klasore cd ediyor.)
REM
REM  Neden: Payload "push" YALNIZ dev'de calisir; prod semasi migration ile
REM  kurulur. Bu script admin panelini canli eder.
REM
REM  ON KOSUL: DATABASE_URI prod'a (Supabase "Session"/"Direct", port 5432)
REM  bakmali. "Transaction pooler" (6543) DDL'i kisitlar -> migration patlar.
REM ==========================================================================
setlocal EnableExtensions
cd /d "%~dp0.."
echo Repo: %CD%
echo.

REM --- Vercel login kontrolu ---
call npx vercel whoami >NUL 2>&1
if errorlevel 1 (
  echo Vercel'e giris gerekli. Tarayici acilacak...
  call npx vercel login
)

echo [1/4] Vercel prod env cekiliyor (.env.production.local)...
call npx vercel env pull .env.production.local --environment=production --yes
if errorlevel 1 (
  echo.
  echo UYARI: "vercel env pull" basarisiz ^(proje link degil olabilir^).
  echo Cozum A: bu klasorde once  npx vercel link  calistir, scripti tekrar ac.
  echo Cozum B: Vercel ^> Settings ^> Environment Variables'tan DATABASE_URI'yi
  echo          kopyalayip  .env.production.local  icine su satiri yaz:
  echo            DATABASE_URI=postgresql://...   ^(Session/Direct, 5432^)
  echo Devam etmek icin .env.production.local hazirsa bir tusa bas, degilse kapat.
  pause >NUL
)

echo [2/4] Migration dosyasi uretiliyor ^(payload/migrations^)...
call npm run migrate:create -- initial

echo [3/4] Migration prod DB'ye uygulaniyor...
call npm run migrate
if errorlevel 1 goto :err

echo [4/4] Migration dosyalari commit + push...
git add payload/migrations
git commit -m "chore(db): payload prod migration"
git push origin HEAD

echo.
echo ============================================================
echo  TAMAM. Simdi: https://www.kozbeylikonagi.com/admin
echo  -^> ilk admin kullanicisini olustur (create first user).
echo  Dogrulama: /api/users artik 200/403 donmeli (500 degil).
echo ============================================================
goto :eof

:err
echo.
echo HATA: migration uygulanamadi. En sik neden: DATABASE_URI "Transaction
echo pooler" (6543). Supabase ^> Connect ^> "Session pooler" veya "Direct"
echo dizgisini DATABASE_URI olarak ayarla ve scripti tekrar calistir.
exit /b 1
