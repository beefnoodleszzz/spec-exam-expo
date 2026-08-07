import React from 'react';
import { render } from '@testing-library/react-native';
import { PurchaseHistoryScreen } from './PurchaseHistoryScreen';
import { usePurchaseHistoryListQuery } from '../application/purchase-history.query';
import type { PurchaseHistoryItem } from '../domain/purchase-history.types';

jest.mock('../application/purchase-history.query', () => ({
  usePurchaseHistoryListQuery: jest.fn(),
}));

describe('PurchaseHistoryScreen', () => {
  it('should render loading state', () => {
    jest.mocked(usePurchaseHistoryListQuery).mockReturnValue({
      isLoading: true,
      isError: false,
      isRefetching: false,
      data: undefined,
      refetch: jest.fn(),
    } as unknown as ReturnType<typeof usePurchaseHistoryListQuery>);

    const { getByTestId } = render(<PurchaseHistoryScreen />);
    expect(getByTestId('loading-indicator')).toBeTruthy();
  });

  it('should render error state', () => {
    jest.mocked(usePurchaseHistoryListQuery).mockReturnValue({
      isLoading: false,
      isError: true,
      isRefetching: false,
      data: undefined,
      refetch: jest.fn(),
    } as unknown as ReturnType<typeof usePurchaseHistoryListQuery>);

    const { getByText } = render(<PurchaseHistoryScreen />);
    expect(getByText('加载失败，请稍后重试')).toBeTruthy();
  });

  it('should render empty state', () => {
    jest.mocked(usePurchaseHistoryListQuery).mockReturnValue({
      isLoading: false,
      isError: false,
      isRefetching: false,
      data: [],
      refetch: jest.fn(),
    } as unknown as ReturnType<typeof usePurchaseHistoryListQuery>);

    const { getByText } = render(<PurchaseHistoryScreen />);
    expect(getByText('暂无购买记录')).toBeTruthy();
  });

  it('should render list of items', () => {
    const mockItem = {
      id: '1',
      examTypeName: 'My Exam',
      amount: 99.9,
      originalAmount: 199,
      createTime: '2023-01-01T12:00:00Z',
      orderNumber: 'ORD123',
      month: 6,
      stateText: 'Paid',
    } satisfies PurchaseHistoryItem;

    jest.mocked(usePurchaseHistoryListQuery).mockReturnValue({
      isLoading: false,
      isError: false,
      isRefetching: false,
      data: [mockItem],
      refetch: jest.fn(),
    } as unknown as ReturnType<typeof usePurchaseHistoryListQuery>);

    const { getByText } = render(<PurchaseHistoryScreen />);
    expect(getByText('My Exam (6个月) - Paid')).toBeTruthy();
    expect(getByText('订单号: ORD123')).toBeTruthy();
    expect(getByText('¥99.90')).toBeTruthy();
    expect(getByText('¥199.00')).toBeTruthy();
    expect(getByText('2023-01-01 12:00')).toBeTruthy();
  });

  it('should render permanent duration for -1', () => {
    const mockItem = {
      id: '2',
      examTypeName: 'My Exam',
      amount: 10,
      originalAmount: 10,
      createTime: null,
      orderNumber: null,
      month: -1,
      stateText: null,
    } satisfies PurchaseHistoryItem;

    jest.mocked(usePurchaseHistoryListQuery).mockReturnValue({
      isLoading: false,
      isError: false,
      isRefetching: false,
      data: [mockItem],
      refetch: jest.fn(),
    } as unknown as ReturnType<typeof usePurchaseHistoryListQuery>);

    const { getByText, queryByText } = render(<PurchaseHistoryScreen />);
    expect(getByText('My Exam (永久)')).toBeTruthy();
    expect(getByText('¥10.00')).toBeTruthy();
    expect(queryByText('订单号: null')).toBeFalsy();
  });

  it('should render exact format for amount=0', () => {
    const mockItem = {
      id: '3',
      examTypeName: 'Free Exam',
      amount: 0,
      originalAmount: null,
      createTime: null,
      orderNumber: null,
      month: null,
      stateText: null,
    } satisfies PurchaseHistoryItem;

    jest.mocked(usePurchaseHistoryListQuery).mockReturnValue({
      isLoading: false,
      isError: false,
      isRefetching: false,
      data: [mockItem],
      refetch: jest.fn(),
    } as unknown as ReturnType<typeof usePurchaseHistoryListQuery>);

    const { getByText } = render(<PurchaseHistoryScreen />);
    expect(getByText('Free Exam')).toBeTruthy();
    expect(getByText('¥0.00')).toBeTruthy();
  });

  it('should trigger exactly one refetch on error retry', () => {
    const refetchMock = jest.fn();
    jest.mocked(usePurchaseHistoryListQuery).mockReturnValue({
      isLoading: false,
      isError: true,
      isRefetching: false,
      data: undefined,
      refetch: refetchMock,
    } as unknown as ReturnType<typeof usePurchaseHistoryListQuery>);

    const { getByText } = render(<PurchaseHistoryScreen />);
    const retryButton = getByText('点击重试');
    
    // Simulate press
    retryButton.props.onPress();
    
    expect(refetchMock).toHaveBeenCalledTimes(1);
  });

  it('should trigger refetch on pull-to-refresh', () => {
    const refetchMock = jest.fn();
    jest.mocked(usePurchaseHistoryListQuery).mockReturnValue({
      isLoading: false,
      isError: false,
      isRefetching: false,
      data: [],
      refetch: refetchMock,
    } as unknown as ReturnType<typeof usePurchaseHistoryListQuery>);

    const { getByTestId } = render(<PurchaseHistoryScreen />);
    
    // Test pull to refresh
    const flatList = getByTestId('purchase-history-list');
    flatList.props.onRefresh();
    
    expect(refetchMock).toHaveBeenCalledTimes(1);
  });
});
