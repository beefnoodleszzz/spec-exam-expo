import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { request, requestWithMetadata, setUnauthorizedHandler } from '../request'

describe('Request Metadata Semantics', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    setUnauthorizedHandler(null)
  })

  describe('request() — unwraps envelope data', () => {
    it('returns unwrapped business data from envelope', async () => {
      const envelopeBody = {
        status: true,
        data: {
          id: 'user-1',
        },
      }

      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue(
          new Response(JSON.stringify(envelopeBody), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }),
        ),
      )

      const result = await request<{ id: string }>({
        url: '/api/user',
        method: 'GET',
      })

      expect(result).toEqual({
        id: 'user-1',
      })
    })

    it('handles arraybuffer without envelope unwrapping', async () => {
      const buffer = new Uint8Array([1, 2, 3])

      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue(
          new Response(buffer, {
            status: 200,
          }),
        ),
      )

      const result = await request<ArrayBuffer>({
        url: '/api/file',
        method: 'GET',
        responseType: 'arraybuffer',
      })

      expect(result).toBeInstanceOf(ArrayBuffer)
    })

    it('throws on envelope business error', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue(
          new Response(
            JSON.stringify({
              status: false,
              code: 4001,
              message: 'Invalid operation',
            }),
            {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            },
          ),
        ),
      )

      await expect(
        request({
          url: '/api/user',
          method: 'GET',
        }),
      ).rejects.toBeDefined()
    })

    it('calls unauthorized handler on envelope 401', async () => {
      const onUnauthorized = vi.fn()
      setUnauthorizedHandler(onUnauthorized)

      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue(
          new Response(
            JSON.stringify({
              status: false,
              code: 401,
              message: 'Unauthorized',
            }),
            {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            },
          ),
        ),
      )

      await expect(
        request({
          url: '/api/user',
          method: 'GET',
        }),
      ).rejects.toBeDefined()

      expect(onUnauthorized).toHaveBeenCalledTimes(1)
    })
  })

  describe('requestWithMetadata() — preserves raw envelope', () => {
    it('returns raw swagger response body with metadata', async () => {
      const envelopeBody = {
        status: true,
        data: {
          id: 'user-1',
        },
      }

      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue(
          new Response(JSON.stringify(envelopeBody), {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              'X-Request-Id': 'request-1',
            },
          }),
        ),
      )

      interface UserEnvelope {
        status: boolean
        data: {
          id: string
        }
      }

      const result = await requestWithMetadata<UserEnvelope>({
        url: '/api/user',
        method: 'GET',
      })

      expect(result.data).toEqual({
        status: true,
        data: {
          id: 'user-1',
        },
      })

      expect(result.status).toBe(200)

      expect(result.headers.get('X-Request-Id')).toBe('request-1')
    })

    it('preserves arraybuffer data with metadata', async () => {
      const bytes = new Uint8Array([1, 2, 3])

      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue(
          new Response(bytes, {
            status: 200,
          }),
        ),
      )

      const result = await requestWithMetadata<ArrayBuffer>({
        url: '/api/file',
        method: 'GET',
        responseType: 'arraybuffer',
      })

      expect(result.data).toBeInstanceOf(ArrayBuffer)
      expect(result.status).toBe(200)
    })

    it('throws on envelope business error', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue(
          new Response(
            JSON.stringify({
              status: false,
              code: 4001,
              message: 'Invalid operation',
            }),
            {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            },
          ),
        ),
      )

      await expect(
        requestWithMetadata({
          url: '/api/user',
          method: 'GET',
        }),
      ).rejects.toBeDefined()
    })

    it('calls unauthorized handler on envelope 401', async () => {
      const onUnauthorized = vi.fn()
      setUnauthorizedHandler(onUnauthorized)

      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue(
          new Response(
            JSON.stringify({
              status: false,
              code: 401,
              message: 'Unauthorized',
            }),
            {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            },
          ),
        ),
      )

      await expect(
        requestWithMetadata({
          url: '/api/user',
          method: 'GET',
        }),
      ).rejects.toBeDefined()

      expect(onUnauthorized).toHaveBeenCalledTimes(1)
    })
  })

  describe('Contract alignment', () => {
    it('request returns unwrapped data; requestWithMetadata returns wrapped envelope', async () => {
      const envelopeBody = {
        status: true,
        data: {
          token: 'abc',
          expiresIn: 3600,
        },
      }

      vi.stubGlobal(
        'fetch',
        vi.fn()
          .mockResolvedValueOnce(
            new Response(JSON.stringify(envelopeBody), {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            }),
          )
          .mockResolvedValueOnce(
            new Response(JSON.stringify(envelopeBody), {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            }),
          ),
      )

      const requestResult = await request<{ token: string; expiresIn: number }>({
        url: '/api/login',
        method: 'POST',
        data: { phone: '13800000000' },
      })

      const metadataResult = await requestWithMetadata<{
        status: boolean
        data: { token: string; expiresIn: number }
      }>({
        url: '/api/login',
        method: 'POST',
        data: { phone: '13800000000' },
      })

      expect(requestResult).toEqual({
        token: 'abc',
        expiresIn: 3600,
      })

      expect(metadataResult.data).toEqual({
        status: true,
        data: {
          token: 'abc',
          expiresIn: 3600,
        },
      })

      expect(metadataResult.data).not.toEqual(requestResult)
    })
  })
})
