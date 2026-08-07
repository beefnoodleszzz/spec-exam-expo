import type { ExaminationManageContractDtoUserUserOrderBase } from '@/shared/api/generated/models';
import type { PurchaseHistoryItem } from './purchase-history.types';
import { createContractError } from '@/shared/api/errors/app-error';

export function mapToPurchaseHistoryItem(dto: ExaminationManageContractDtoUserUserOrderBase): PurchaseHistoryItem {
  if (!dto.id || dto.id === '') {
    throw createContractError('Missing purchase history item id');
  }

  return {
    id: dto.id,
    examTypeName: dto.examTypeName ?? null,
    amount: dto.amount ?? null,
    originalAmount: dto.originalAmount ?? null,
    createTime: dto.createTime ?? null,
    orderNumber: dto.orderNumber ?? null,
    month: dto.month ?? null,
    stateText: dto.stateText ?? null,
  };
}
