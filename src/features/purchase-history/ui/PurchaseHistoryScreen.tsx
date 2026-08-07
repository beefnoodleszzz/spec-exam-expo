import React from 'react';
import { View, FlatList, ActivityIndicator } from 'react-native';
import { usePurchaseHistoryListQuery } from '../application/purchase-history.query';
import type { PurchaseHistoryItem } from '../domain/purchase-history.types';
import { AppScreen, AppText } from '@/shared/components';
import { formatDate } from '@/shared/utils/date-formatter';

export function PurchaseHistoryScreen() {
  const { data, isLoading, isError, isRefetching, refetch } = usePurchaseHistoryListQuery();

  const renderItem = ({ item }: { item: PurchaseHistoryItem }) => {
    const formattedTime = formatDate(item.createTime);
    
    let monthText = null;
    if (item.month === -1) {
      monthText = '永久';
    } else if (item.month && item.month > 0) {
      monthText = `${item.month}个月`;
    }

    const hasOriginalAmount = typeof item.originalAmount === 'number' && typeof item.amount === 'number' && item.originalAmount !== item.amount;

    return (
      <View className="bg-white p-4 mb-3 rounded-lg flex-row justify-between items-center shadow-sm">
        <View className="flex-1 mr-4">
          <AppText className="text-base font-medium text-gray-900 mb-1" numberOfLines={1}>
            {item.examTypeName}
            {monthText ? ` (${monthText})` : ''}
            {item.stateText ? ` - ${item.stateText}` : ''}
          </AppText>
          {item.orderNumber ? (
            <AppText className="text-xs text-gray-500">
              订单号: {item.orderNumber}
            </AppText>
          ) : null}
          {formattedTime ? (
            <AppText className="text-xs text-gray-500">
              {formattedTime}
            </AppText>
          ) : null}
        </View>
        <View className="items-end">
          {hasOriginalAmount ? (
            <AppText className="text-xs text-gray-400 line-through">
              ¥{item.originalAmount!.toFixed(2)}
            </AppText>
          ) : null}
          {typeof item.amount === 'number' ? (
            <AppText className="text-lg font-semibold text-red-500">
              ¥{item.amount.toFixed(2)}
            </AppText>
          ) : null}
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
          <AppText className="text-blue-500" onPress={() => void refetch()}>点击重试</AppText>
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
        refreshing={!!(isRefetching && !isLoading)}
        onRefresh={() => void refetch()}
      />
    </AppScreen>
  );
}
