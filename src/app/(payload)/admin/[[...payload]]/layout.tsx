import React from 'react'
import type { ServerFunctionClient } from 'payload'

import { getAdminDependencyStatus } from '@/lib/admin-runtime'

import './custom.css'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

type Args = {
  children: React.ReactNode
}

// Payload admin server action — DAİMA modül seviyesinde 'use server' ile sarmalanır.
// handleServerFunctions'ı doğrudan geçmek RSC "Functions cannot be passed to Client
// Components" hatası verir; bu sarmalayıcı onu gerçek bir server-action yapar.
const serverFunction: ServerFunctionClient = async function (args) {
  'use server'
  const { handleServerFunctions } = await import('@payloadcms/next/layouts')
  const config = (await import('@payload-config')).default
  // @ts-expect-error - importMap is generated JS without types
  const { importMap } = await import('../importMap')
  return handleServerFunctions({
    ...args,
    config,
    importMap,
  })
}

const Layout = async ({ children }: Args) => {
  const status = await getAdminDependencyStatus()
  if (!status.ready) return <>{children}</>

  const { RootLayout } = await import('@payloadcms/next/layouts')
  const config = (await import('@payload-config')).default
  // @ts-expect-error - importMap is generated JS without types
  const { importMap } = await import('../importMap')

  return (
    <RootLayout config={config} importMap={importMap} serverFunction={serverFunction}>
      {children}
    </RootLayout>
  )
}

export default Layout
