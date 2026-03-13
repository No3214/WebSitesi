import { REST_DELETE, REST_GET, REST_OPTIONS, REST_PATCH, REST_POST } from '@payloadcms/next/routes'
import config from '@payload-config'
import { NextRequest } from 'next/server'

export const GET = async (req: NextRequest, { params }: { params: Promise<{ payload: string[] }> }) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return REST_GET(config)(req, { params: params as any })
}

export const POST = async (req: NextRequest, { params }: { params: Promise<{ payload: string[] }> }) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return REST_POST(config)(req, { params: params as any })
}

export const DELETE = async (req: NextRequest, { params }: { params: Promise<{ payload: string[] }> }) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return REST_DELETE(config)(req, { params: params as any })
}

export const PATCH = async (req: NextRequest, { params }: { params: Promise<{ payload: string[] }> }) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return REST_PATCH(config)(req, { params: params as any })
}

export const OPTIONS = async (req: NextRequest, { params }: { params: Promise<{ payload: string[] }> }) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return REST_OPTIONS(config)(req, { params: params as any })
}
