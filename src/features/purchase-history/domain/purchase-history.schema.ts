import { z } from 'zod';
import type { ExaminationManageContractDtoUserUserOrderBase } from '@/shared/api/generated/models';
import type { PurchaseHistoryItem } from './purchase-history.types';

export const purchaseHistoryItemSchema = z.object({
  id: z.string().min(1, 'ID is required'),
  examTypeName: z.string().default(''),
  amount: z.number().default(0),
  originalAmount: z.number().default(0),
  createTime: z.string().default(''),
  orderNumber: z.string().default(''),
});

export function mapToPurchaseHistoryItem(dto: ExaminationManageContractDtoUserUserOrderBase): PurchaseHistoryItem {
  const result = purchaseHistoryItemSchema.safeParse({
    id: dto.id ?? '',
    examTypeName: dto.examTypeName ?? '',
    amount: dto.amount ?? 0,
    originalAmount: dto.originalAmount ?? 0,
    createTime: dto.createTime ?? '',
    orderNumber: dto.orderNumber ?? '',
  });

  if (!result.success) {
    throw new Error('Failed to parse purchase history item');
  }

  return result.data;
}
