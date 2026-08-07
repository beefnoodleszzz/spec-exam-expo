import { useQuery } from '@tanstack/react-query';
import { purchaseHistoryContainer } from './purchase-history.container';
import { sessionStore } from '@/shared/auth/session-store';

export const purchaseHistoryKeys = {
  all: ['purchase-history'] as const,
  list: (userId: string | null) => [...purchaseHistoryKeys.all, 'list', userId] as const,
};

export function usePurchaseHistoryListQuery() {
  const userId = sessionStore(state => state.userId);
  
  return useQuery({
    queryKey: purchaseHistoryKeys.list(userId),
    queryFn: () => purchaseHistoryContainer.remote.getPurchaseHistoryList(),
    enabled: !!userId,
  });
}
