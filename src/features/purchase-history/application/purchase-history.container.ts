import { PurchaseHistoryRemoteImpl } from '../data/purchase-history.remote.impl';
import type { PurchaseHistoryRemote } from '../data/purchase-history.remote';

export interface PurchaseHistoryContainer {
  remote: PurchaseHistoryRemote;
}

export const purchaseHistoryContainer: PurchaseHistoryContainer = {
  remote: new PurchaseHistoryRemoteImpl(),
};
