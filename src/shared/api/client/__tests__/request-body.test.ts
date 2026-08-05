import { describe, it, expect, vi, afterEach } from 'vitest'
import { request } from '../request'

describe('request transport — body serialization', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('serializes object body to JSON and adds Content-Type', async () => {
    let requestInit: RequestInit | undefined
    global.fetch = vi.fn().mockImplementation((_url, init) => {
      requestInit = init
      return Promise.resolve(new Response(JSON.stringify({ status: true, data: {} })))
    })

    await request({
      url: '/test/json',
      method: 'POST',
      data: { foo: 'bar' },
    })

    expect(requestInit?.body).toBe('{"foo":"bar"}')
    expect(requestInit?.headers).toHaveProperty('Content-Type', 'application/json')
  })

  it('does not stringify string data and respects existing Content-Type', async () => {
    let requestInit: RequestInit | undefined
    global.fetch = vi.fn().mockImplementation((_url, init) => {
      requestInit = init
      return Promise.resolve(new Response(JSON.stringify({ status: true, data: {} })))
    })

    await request({
      url: '/test/string',
      method: 'POST',
      data: 'raw-string',
      headers: { 'Content-Type': 'text/plain' },
    })

    expect(requestInit?.body).toBe('raw-string')
    expect(requestInit?.headers).toHaveProperty('Content-Type', 'text/plain')
  })

  it('does not set Content-Type for FormData', async () => {
    let requestInit: RequestInit | undefined
    global.fetch = vi.fn().mockImplementation((_url, init) => {
      requestInit = init
      return Promise.resolve(new Response(JSON.stringify({ status: true, data: {} })))
    })

    const formData = new FormData()
    formData.append('foo', 'bar')

    await request({
      url: '/test/form',
      method: 'POST',
      data: formData,
    })

    expect(requestInit?.body).toBe(formData)
    expect(requestInit?.headers).not.toHaveProperty('Content-Type')
    expect(requestInit?.headers).not.toHaveProperty('content-type')
  })

  it('does not set Content-Type for GET requests', async () => {
    let requestInit: RequestInit | undefined
    global.fetch = vi.fn().mockImplementation((_url, init) => {
      requestInit = init
      return Promise.resolve(new Response(JSON.stringify({ status: true, data: {} })))
    })

    await request({
      url: '/test/get',
      method: 'GET',
    })

    expect(requestInit?.headers).not.toHaveProperty('Content-Type')
  })
})
