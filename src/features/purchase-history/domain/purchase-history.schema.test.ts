import { describe, expect, it } from 'vitest';
import { mapToPurchaseHistoryItem } from './purchase-history.schema';
import type { ExaminationManageContractDtoUserUserOrderBase } from '@/shared/api/generated/models';

describe('mapToPurchaseHistoryItem', () => {
  it('should map valid dto', () => {
    const dto: ExaminationManageContractDtoUserUserOrderBase = {
      id: '1',
      examTypeName: 'Test Exam',
      amount: 100,
      originalAmount: 200,
      createTime: '2023-01-01T00:00:00Z',
      orderNumber: '123456789',
      month: 12,
      stateText: 'Paid',
    };
    const result = mapToPurchaseHistoryItem(dto);
    expect(result.id).toBe('1');
    expect(result.examTypeName).toBe('Test Exam');
    expect(result.amount).toBe(100);
    expect(result.originalAmount).toBe(200);
    expect(result.createTime).toBe('2023-01-01T00:00:00Z');
    expect(result.orderNumber).toBe('123456789');
    expect(result.month).toBe(12);
    expect(result.stateText).toBe('Paid');
  });

  it('should handle undefined values gracefully using nulls', () => {
    const dto: ExaminationManageContractDtoUserUserOrderBase = {
      id: '1',
    };
    const result = mapToPurchaseHistoryItem(dto);
    expect(result.id).toBe('1');
    expect(result.examTypeName).toBeNull();
    expect(result.amount).toBeNull();
    expect(result.originalAmount).toBeNull();
    expect(result.createTime).toBeNull();
    expect(result.orderNumber).toBeNull();
    expect(result.month).toBeNull();
    expect(result.stateText).toBeNull();
  });

  it('should throw ContractError when id is missing', () => {
    const dto: ExaminationManageContractDtoUserUserOrderBase = {
      examTypeName: 'Test',
    };
    expect(() => mapToPurchaseHistoryItem(dto)).toThrow('Missing purchase history item id');
  });

  it('should throw ContractError when id is empty string', () => {
    const dto: ExaminationManageContractDtoUserUserOrderBase = {
      id: '',
      examTypeName: 'Test',
    };
    expect(() => mapToPurchaseHistoryItem(dto)).toThrow('Missing purchase history item id');
  });
});
