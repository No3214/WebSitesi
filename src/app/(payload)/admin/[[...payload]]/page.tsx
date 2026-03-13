import { RootPage, generatePageMetadata } from '@payloadcms/next/views'
import config from '@payload-config'
// @ts-expect-error - importMap is generated JS without types
import { importMap } from '../importMap'

type Args = {
  params: Promise<{
    payload: string[]
  }>
  searchParams: Promise<{
    [key: string]: string | string[]
  }>
}

export const generateMetadata = ({ params, searchParams }: Args) =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  generatePageMetadata({ config, params: params as any, searchParams })

const Page = ({ params, searchParams }: Args) => {
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
