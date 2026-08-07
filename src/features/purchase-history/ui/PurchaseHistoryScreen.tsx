import React from 'react';
import { View, FlatList, ActivityIndicator } from 'react-native';
import { usePurchaseHistoryListQuery } from '../application/purchase-history.query';
import type { PurchaseHistoryItem } from '../domain/purchase-history.types';
import { AppScreen, AppText } from '@/shared/components';

export function PurchaseHistoryScreen() {
  const { data, isLoading, isError, refetch } = usePurchaseHistoryListQuery();

  const renderItem = ({ item }: { item: PurchaseHistoryItem }) => {
    // Basic date formatting (assuming YYYY-MM-DDTHH:mm:ss or similar from API)
    const formattedTime = item.createTime.replace('T', ' ').substring(0, 16);
    
    return (
      <View className="bg-white p-4 mb-3 rounded-lg flex-row justify-between items-center shadow-sm">
        <View className="flex-1 mr-4">
          <AppText className="text-base font-medium text-gray-900 mb-1" numberOfLines={1}>
            {item.examTypeName}
          </AppText>
          <AppText className="text-xs text-gray-500">
            订单号: {item.orderNumber}
          </AppText>
          <AppText className="text-xs text-gray-500">
            {formattedTime}
          </AppText>
        </View>
        <View className="items-end">
          <AppText className="text-lg font-semibold text-red-500">
            ¥{item.amount.toFixed(2)}
          </AppText>
        </View>
      </View>
    );
  };

  const renderEmpty = () => {
    return (
      <View className="flex-1 justify-center items-center py-20">
        <AppText className="text-gray-500">暂无购买记录</AppText>
      </View>
    );
  };

  if (isLoading) {
    return (
      <AppScreen safeAreaEdges={['bottom']}>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#0000ff" testID="loading-indicator" />
        </View>
      </AppScreen>
    );
  }

  if (isError) {
    return (
      <AppScreen safeAreaEdges={['bottom']}>
        <View className="flex-1 justify-center items-center">
          <AppText className="text-red-500 mb-4">加载失败，请稍后重试</AppText>
          <AppText className="text-blue-500" onPress={() => refetch()}>点击重试</AppText>
        </View>
      </AppScreen>
    );
  }

  return (
    <AppScreen safeAreaEdges={['bottom']} className="bg-gray-50">
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={{ padding: 16 }}
      />
    </AppScreen>
  );
}
