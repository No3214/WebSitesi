import React from 'react'

import { getAdminDependencyStatus } from '@/lib/admin-runtime'

import './custom.css'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

type Args = {
  children: React.ReactNode
}

async function loadPayloadAdminLayout() {
  const [layouts, configModule, importMapModule] = await Promise.all([
    import('@payloadcms/next/layouts'),
    import('@payload-config'),
    // @ts-expect-error - importMap is generated JS without types
    import('../importMap'),
  ])

  return {
    RootLayout: layouts.RootLayout,
    handleServerFunctions: layouts.handleServerFunctions,
    config: configModule.default,
    importMap: importMapModule.importMap,
  }
}

const Layout = async ({ children }: Args) => {
  const status = await getAdminDependencyStatus()
  if (!status.ready) return <>{children}</>

  const { RootLayout, config, importMap, handleServerFunctions } = await loadPayloadAdminLayout()

  return (
    <RootLayout
      config={config}
      importMap={importMap}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      serverFunction={handleServerFunctions as any}
    >
      {children}
    </RootLayout>
  )
}

export default Layout
