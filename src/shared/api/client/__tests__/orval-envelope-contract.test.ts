import { describe, it, expect, beforeEach, vi } from 'vitest'
import { orvalRequest } from '../orval-mutator'

describe('Orval Envelope Contract — Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('mutator preserves complete envelope as data field', async () => {
    const envelopeBody = {
      status: true,
      data: {
        token: 'abc123',
        expiresIn: 3600,
      },
    }

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify(envelopeBody), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'X-Request-Id': 'req-1',
          },
        }),
      ),
    )

    interface LoginEnvelope {
      status: boolean
      data: {
        token: string
        expiresIn: number
      }
    }

    type OrvalLoginResponse = {
      data: LoginEnvelope
      status: 200
      headers: Headers
    }

    const result = await orvalRequest<OrvalLoginResponse>(
      '/api/login',
      {
        method: 'POST',
        body: { phone: '13800000000' },
      },
    )

    expect(result.data).toEqual({
      status: true,
      data: {
        token: 'abc123',
        expiresIn: 3600,
      },
    })

    expect(result.status).toBe(200)

    expect(result.headers.get('X-Request-Id')).toBe('req-1')
  })

  it('mutator returns envelope status field, not HTTP status as data', async () => {
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

    interface UserEnvelope {
      status: boolean
      data: {
        id: string
      }
    }

    type OrvalUserResponse = {
      data: UserEnvelope
      status: 200
      headers: Headers
    }

    const result = await orvalRequest<OrvalUserResponse>(
      '/api/user',
      { method: 'GET' },
    )

    expect(result.data).toHaveProperty('status')

    expect(result.data.status).toBe(true)

    expect(result.data).toMatchObject({
      status: true,
      data: {
        id: 'user-1',
      },
    })
  })


  it('mutator business error is thrown before returning result', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            status: false,
            code: 4001,
            message: 'Invalid request',
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          },
        ),
      ),
    )

    await expect(
      orvalRequest(
        '/api/user',
        {
          method: 'POST',
          body: { invalid: 'data' },
        },
      ),
    ).rejects.toBeDefined()
  })
})
