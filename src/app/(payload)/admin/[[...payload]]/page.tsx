import { RootPage, generatePageMetadata } from '@payloadcms/next/views'
import config from '@payload-config'
import { importMap } from '../importMap'
import { handleServerFunctions } from '@payloadcms/next/layouts'

type Args = {
  params: Promise<{
    payload: string[]
  }>
  searchParams: Promise<{
    [key: string]: string | string[]
  }>
}

export const generateMetadata = ({ params, searchParams }: Args) =>
  generatePageMetadata({ config, params, searchParams })

const Page = ({ params, searchParams }: Args) => {
  return (
    <RootPage 
      config={config} 
      params={params} 
      searchParams={searchParams} 
      importMap={importMap} 
      serverFunction={handleServerFunctions}
    />
  )
}

export default Page
