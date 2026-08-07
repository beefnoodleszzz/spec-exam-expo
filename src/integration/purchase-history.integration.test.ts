import { describe, it, expect, beforeEach, vi } from 'vitest'

import { resetGlobalState } from '../testing/reset-global-state'
import { sessionStore } from '../shared/auth/session-store'
import { purchaseHistoryKeys } from '../features/purchase-history/application/purchase-history.query'
import { purchaseHistoryContainer } from '../features/purchase-history/application/purchase-history.container'
import { createTestQueryClient } from '../testing/create-test-query-client'

vi.mock('../shared/persistence/secure-storage', () => ({
  getSecure: vi.fn(),
  setSecure: vi.fn(),
  clearSecureCredentials: vi.fn(),
}))

describe('Purchase History Integration', () => {
  beforeEach(() => {
    resetGlobalState()
    vi.stubGlobal('fetch', vi.fn())
    sessionStore.setState({ accessToken: 'valid', status: 'authenticated', userId: 'user-1' })
  })

  it('should fetch and map valid lists', async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        code: 200,
        data: [{
          id: '1',
          examTypeName: 'A',
          amount: 10,
          originalAmount: 10,
          createTime: '2021-01-01',
          orderNumber: 'abc',
          month: 1,
          stateText: 'paid'
        }]
      }),
      headers: new Headers(),
    } as Response)

    const testClient = createTestQueryClient()
    const result = await testClient.fetchQuery({
      queryKey: purchaseHistoryKeys.list('user-1'),
      queryFn: () => purchaseHistoryContainer.remote.getPurchaseHistoryList(),
    })

    expect(result).toHaveLength(1)
    expect(result[0]?.id).toBe('1')
  })

  it('should throw error for invalid list (missing id)', async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        code: 200,
        data: [{
          examTypeName: 'A',
        }]
      }),
      headers: new Headers(),
    } as Response)

    const testClient = createTestQueryClient()
    
    await expect(testClient.fetchQuery({
      queryKey: purchaseHistoryKeys.list('user-1'),
      queryFn: () => purchaseHistoryContainer.remote.getPurchaseHistoryList(),
    })).rejects.toThrow('Invalid purchase history item format')
  })
})
