import { apiExamV2AppOrderUserBuyRecordListGet } from '@/shared/api/generated/endpoints/examination-manager-v2/examination-manager-v2';
import type { PurchaseHistoryRemote } from './purchase-history.remote';
import { mapToPurchaseHistoryItem } from '../domain/purchase-history.schema';
import type { PurchaseHistoryItem } from '../domain/purchase-history.types';
import { extractGeneratedData } from '@/shared/api/generated-response';

export class PurchaseHistoryRemoteImpl implements PurchaseHistoryRemote {
  async getPurchaseHistoryList(): Promise<PurchaseHistoryItem[]> {
    const response = await apiExamV2AppOrderUserBuyRecordListGet();
    const dataList = extractGeneratedData(response.data, '获取购买记录');
    if (!Array.isArray(dataList)) {
      return [];
    }
    return dataList.map(mapToPurchaseHistoryItem);
  }
}
