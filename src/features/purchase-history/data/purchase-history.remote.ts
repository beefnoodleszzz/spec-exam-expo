import type { PurchaseHistoryItem } from '../domain/purchase-history.types';

export interface PurchaseHistoryRemote {
  getPurchaseHistoryList(): Promise<PurchaseHistoryItem[]>;
}
