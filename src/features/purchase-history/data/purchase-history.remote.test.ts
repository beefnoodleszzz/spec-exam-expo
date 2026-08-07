import { describe, expect, it, vi } from 'vitest';
import { PurchaseHistoryRemoteImpl } from './purchase-history.remote.impl';
import { apiExamV2AppOrderUserBuyRecordListGet } from '@/shared/api/generated/endpoints/examination-manager-v2/examination-manager-v2';
import { extractGeneratedData } from '@/shared/api/generated-response';

vi.mock('@/shared/api/generated/endpoints/examination-manager-v2/examination-manager-v2', () => ({
  apiExamV2AppOrderUserBuyRecordListGet: vi.fn(),
}));

vi.mock('@/shared/api/generated-response', () => ({
  extractGeneratedData: vi.fn(),
}));

describe('PurchaseHistoryRemoteImpl', () => {
  it('should get and map purchase history list', async () => {
    const mockResponse = { data: {} };
    vi.mocked(apiExamV2AppOrderUserBuyRecordListGet).mockResolvedValue(mockResponse as never);
    
    vi.mocked(extractGeneratedData).mockReturnValue([
      {
        id: '1',
        examTypeName: 'Test Exam',
        amount: 100,
        originalAmount: 200,
        createTime: '2023-01-01T00:00:00Z',
        orderNumber: '123456789',
      },
    ]);

    const remote = new PurchaseHistoryRemoteImpl();
    const result = await remote.getPurchaseHistoryList();

    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe('1');
    expect(result[0]?.examTypeName).toBe('Test Exam');
    expect(result[0]?.amount).toBe(100);
  });
});
