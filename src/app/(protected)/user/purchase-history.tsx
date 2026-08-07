import { Stack } from 'expo-router';
import { PurchaseHistoryScreen } from '@/features/purchase-history/ui/PurchaseHistoryScreen';

export default function PurchaseHistoryRoute() {
  return (
    <>
      <Stack.Screen
        options={{
          title: '购买记录',
        }}
      />
      <PurchaseHistoryScreen />
    </>
  );
}
