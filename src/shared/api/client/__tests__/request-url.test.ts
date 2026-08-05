import { describe, it, expect, vi, afterEach } from 'vitest'
import { request } from '../request'

describe('request transport — url parsing', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('appends query string properly when URL already contains a query string', async () => {
    let requestUrl: URL | string | Request | undefined
    global.fetch = vi.fn().mockImplementation((url) => {
      requestUrl = url
      return Promise.resolve(new Response(JSON.stringify({ status: true, data: {} })))
    })

    await request({
      url: '/test/existing-query?id=1',
      method: 'GET',
      params: { foo: 'bar' },
    })

    expect(requestUrl?.toString()).toContain('/test/existing-query?id=1&foo=bar')
  })
})
