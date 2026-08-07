import { describe, expect, it } from 'vitest';
import { purchaseHistoryItemSchema, mapToPurchaseHistoryItem } from './purchase-history.schema';
import type { ExaminationManageContractDtoUserUserOrderBase } from '@/shared/api/generated/models';

describe('purchaseHistoryItemSchema', () => {
  it('should parse valid data', () => {
    const data = {
      id: '1',
      examTypeName: 'Test Exam',
      amount: 100,
      originalAmount: 200,
      createTime: '2023-01-01T00:00:00Z',
      orderNumber: '123456789',
    };
    const result = purchaseHistoryItemSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('should reject data without id', () => {
    const data = {
      id: '',
      examTypeName: 'Test Exam',
    };
    const result = purchaseHistoryItemSchema.safeParse(data);
    expect(result.success).toBe(false);
  });
});

describe('mapToPurchaseHistoryItem', () => {
  it('should map valid dto', () => {
    const dto: ExaminationManageContractDtoUserUserOrderBase = {
      id: '1',
      examTypeName: 'Test Exam',
      amount: 100,
      originalAmount: 200,
      createTime: '2023-01-01T00:00:00Z',
      orderNumber: '123456789',
    };
    const result = mapToPurchaseHistoryItem(dto);
    expect(result.id).toBe('1');
    expect(result.examTypeName).toBe('Test Exam');
    expect(result.amount).toBe(100);
    expect(result.originalAmount).toBe(200);
    expect(result.createTime).toBe('2023-01-01T00:00:00Z');
    expect(result.orderNumber).toBe('123456789');
  });

  it('should handle undefined values gracefully using defaults', () => {
    const dto: ExaminationManageContractDtoUserUserOrderBase = {
      id: '1',
    };
    const result = mapToPurchaseHistoryItem(dto);
    expect(result.id).toBe('1');
    expect(result.examTypeName).toBe('');
    expect(result.amount).toBe(0);
    expect(result.originalAmount).toBe(0);
    expect(result.createTime).toBe('');
    expect(result.orderNumber).toBe('');
  });
});
