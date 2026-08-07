import { z } from 'zod';
import type { PurchaseHistoryItem } from './purchase-history.types';
import { createContractError } from '@/shared/api/errors/app-error';

export const rawPurchaseHistoryItemSchema = z.object({
  id: z.string().min(1),
  examTypeName: z.string().nullable().optional(),
  amount: z.number().nullable().optional(),
  originalAmount: z.number().nullable().optional(),
  createTime: z.string().nullable().optional(),
  orderNumber: z.string().nullable().optional(),
  month: z.number().nullable().optional(),
  stateText: z.string().nullable().optional(),
});

export function mapToPurchaseHistoryItem(dto: unknown): PurchaseHistoryItem {
  const result = rawPurchaseHistoryItemSchema.safeParse(dto);

  if (!result.success) {
    throw createContractError('Invalid purchase history item format');
  }

  const validDto = result.data;

  return {
    id: validDto.id,
    examTypeName: validDto.examTypeName ?? null,
    amount: validDto.amount ?? null,
    originalAmount: validDto.originalAmount ?? null,
    createTime: validDto.createTime ?? null,
    orderNumber: validDto.orderNumber ?? null,
    month: validDto.month ?? null,
    stateText: validDto.stateText ?? null,
  };
}
