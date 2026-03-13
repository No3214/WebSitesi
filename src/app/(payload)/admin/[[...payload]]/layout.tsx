import { RootLayout } from '@payloadcms/next/layouts'
import React from 'react'
import config from '@payload-config'
// @ts-expect-error - importMap is generated JS without types
import { importMap } from '../importMap'
import { handleServerFunctions } from '@payloadcms/next/layouts'
import './custom.css'

type Args = {
  children: React.ReactNode
}

const Layout = ({ children }: Args) => (
  <RootLayout 
    config={config} 
    importMap={importMap} 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    serverFunction={handleServerFunctions as any}
  >
    {children}
  </RootLayout>
)

export default Layout
