import type { Metadata } from 'next'

import { getAdminDependencyStatus, type AdminDependencyStatus } from '@/lib/admin-runtime'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

type Args = {
  params: Promise<{
    segments: string[]
  }>
  searchParams: Promise<{
    [key: string]: string | string[]
  }>
}

async function loadPayloadAdminPage() {
  const [{ RootPage, generatePageMetadata }, configModule, importMapModule] = await Promise.all([
    import('@payloadcms/next/views'),
    import('@payload-config'),
    // @ts-expect-error - importMap is generated JS without types
    import('../importMap'),
  ])

  return {
    RootPage,
    generatePageMetadata,
    config: configModule.default,
    importMap: importMapModule.importMap,
  }
}

function AdminUnavailable({ status }: { status: Exclude<AdminDependencyStatus, { ready: true }> }) {
  return (
    <main
      data-admin-dependency-status={status.code}
      style={{
        minHeight: '70vh',
        display: 'grid',
        placeItems: 'center',
        padding: 'clamp(32px, 8vw, 96px)',
        background: '#fbf6eb',
        color: '#263428',
      }}
    >
      <section style={{ maxWidth: 680, textAlign: 'center' }}>
        <p
          style={{
            marginBottom: 16,
            color: '#9b7a3f',
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
          }}
        >
          Yönetim Paneli
        </p>
        <h1 style={{ margin: '0 0 20px', fontFamily: 'var(--font-serif)', fontSize: 'clamp(2rem, 6vw, 4rem)' }}>
          Admin geçici olarak kullanılamıyor
        </h1>
        <p style={{ margin: '0 auto', maxWidth: 560, color: '#586357', fontSize: 18, lineHeight: 1.7 }}>
          {status.message} Genel site, rezervasyon yönlendirmeleri ve misafir sayfaları çalışmaya devam eder.
        </p>
      </section>
    </main>
  )
}

export const generateMetadata = async ({ params, searchParams }: Args): Promise<Metadata> => {
  const status = await getAdminDependencyStatus()
  if (!status.ready) {
    return {
      title: 'Admin geçici olarak kullanılamıyor | Kozbeyli Konağı',
      robots: { index: false, follow: false },
    }
  }

  const { generatePageMetadata, config } = await loadPayloadAdminPage()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return generatePageMetadata({ config, params: params as any, searchParams })
}

const Page = async ({ params, searchParams }: Args) => {
  const status = await getAdminDependencyStatus()
  if (!status.ready) {
    return <AdminUnavailable status={status} />
  }

  const { RootPage, config, importMap } = await loadPayloadAdminPage()

  return (
    <RootPage 
      config={config} 
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      params={params as any} 
      searchParams={searchParams} 
      importMap={importMap} 
    />
  )
}

export default Page
