export interface PurchaseHistoryItem {
  id: string;
  examTypeName: string | null;
  amount: number | null;
  originalAmount: number | null;
  createTime: string | null;
  orderNumber: string | null;
  month: number | null;
  stateText: string | null;
}
