import { describe, expect, it, vi } from 'vitest';
import { PurchaseHistoryRemoteImpl } from './purchase-history.remote.impl';
import { apiExamV2AppOrderUserBuyRecordListGet } from '@/shared/api/generated/endpoints/examination-manager-v2/examination-manager-v2';
import type { apiExamV2AppOrderUserBuyRecordListGetResponse } from '@/shared/api/generated/endpoints/examination-manager-v2/examination-manager-v2';
import { extractGeneratedData } from '@/shared/api/generated-response';

vi.mock('@/shared/api/generated/endpoints/examination-manager-v2/examination-manager-v2', () => ({
  apiExamV2AppOrderUserBuyRecordListGet: vi.fn(),
}));

vi.mock('@/shared/api/generated-response', () => ({
  extractGeneratedData: vi.fn(),
}));

const mockResponse = { 
  data: {}, 
  status: 200, 
  headers: new Headers() 
} satisfies apiExamV2AppOrderUserBuyRecordListGetResponse;

describe('PurchaseHistoryRemoteImpl', () => {
  it('should return empty list when receiving empty array', async () => {
    vi.mocked(apiExamV2AppOrderUserBuyRecordListGet).mockResolvedValue(mockResponse);
    vi.mocked(extractGeneratedData).mockReturnValue([]);
    
    const remote = new PurchaseHistoryRemoteImpl();
    const result = await remote.getPurchaseHistoryList();
    
    expect(result).toHaveLength(0);
  });

  it('should throw ContractError when data is object instead of array', async () => {
    vi.mocked(apiExamV2AppOrderUserBuyRecordListGet).mockResolvedValue(mockResponse);
    vi.mocked(extractGeneratedData).mockReturnValue({ id: '1' });
    
    const remote = new PurchaseHistoryRemoteImpl();
    await expect(remote.getPurchaseHistoryList()).rejects.toThrow('Failed to parse purchase history list');
  });

  it('should throw ContractError when data is null', async () => {
    vi.mocked(apiExamV2AppOrderUserBuyRecordListGet).mockResolvedValue(mockResponse);
    vi.mocked(extractGeneratedData).mockReturnValue(null);
    
    const remote = new PurchaseHistoryRemoteImpl();
    await expect(remote.getPurchaseHistoryList()).rejects.toThrow('Failed to parse purchase history list');
  });

  it('should throw ContractError when data is string', async () => {
    vi.mocked(apiExamV2AppOrderUserBuyRecordListGet).mockResolvedValue(mockResponse);
    vi.mocked(extractGeneratedData).mockReturnValue("data");
    
    const remote = new PurchaseHistoryRemoteImpl();
    await expect(remote.getPurchaseHistoryList()).rejects.toThrow('Failed to parse purchase history list');
  });

  it('should throw ContractError when item id is missing', async () => {
    vi.mocked(apiExamV2AppOrderUserBuyRecordListGet).mockResolvedValue(mockResponse);
    vi.mocked(extractGeneratedData).mockReturnValue([{ examTypeName: 'Test' }]);
    
    const remote = new PurchaseHistoryRemoteImpl();
    await expect(remote.getPurchaseHistoryList()).rejects.toThrow('Invalid purchase history item format');
  });

  it('should get and map purchase history list', async () => {
    vi.mocked(apiExamV2AppOrderUserBuyRecordListGet).mockResolvedValue(mockResponse);
    
    vi.mocked(extractGeneratedData).mockReturnValue([
      {
        id: '1',
        examTypeName: 'Test Exam',
        amount: 100,
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
