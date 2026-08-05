import { describe, it, expect, vi, afterEach } from 'vitest'
import { request } from '../request'

describe('request transport — responseType and body', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns raw ArrayBuffer without JSON/Envelope parsing when responseType is arraybuffer', async () => {
    const dummyBuffer = new ArrayBuffer(8)
    global.fetch = vi.fn().mockResolvedValue({
      status: 200,
      ok: true,
      arrayBuffer: async () => dummyBuffer,
    } as unknown as Response)

    const result = await request<ArrayBuffer>({
      url: '/test/download',
      method: 'GET',
      responseType: 'arraybuffer',
    })

    expect(result).toBe(dummyBuffer)
  })
})
