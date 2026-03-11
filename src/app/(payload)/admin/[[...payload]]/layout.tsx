import { RootLayout } from '@payloadcms/next/layouts'
import React from 'react'
import config from '@payload-config'
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
    serverFunction={handleServerFunctions}
  >
    {children}
  </RootLayout>
)

export default Layout
