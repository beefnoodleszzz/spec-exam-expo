import React from 'react';
import { render } from '@testing-library/react-native';
import { PurchaseHistoryScreen } from './PurchaseHistoryScreen';
import { usePurchaseHistoryListQuery } from '../application/purchase-history.query';

jest.mock('../application/purchase-history.query', () => ({
  usePurchaseHistoryListQuery: jest.fn(),
}));

describe('PurchaseHistoryScreen', () => {
  it('should render loading state', () => {
    jest.mocked(usePurchaseHistoryListQuery).mockReturnValue({
      isLoading: true,
      isError: false,
      data: undefined,
      refetch: jest.fn(),
    } as never);

    const { getByTestId } = render(<PurchaseHistoryScreen />);
    expect(getByTestId('loading-indicator')).toBeTruthy();
  });

  it('should render error state', () => {
    jest.mocked(usePurchaseHistoryListQuery).mockReturnValue({
      isLoading: false,
      isError: true,
      data: undefined,
      refetch: jest.fn(),
    } as never);

    const { getByText } = render(<PurchaseHistoryScreen />);
    expect(getByText('加载失败，请稍后重试')).toBeTruthy();
  });

  it('should render empty state', () => {
    jest.mocked(usePurchaseHistoryListQuery).mockReturnValue({
      isLoading: false,
      isError: false,
      data: [],
      refetch: jest.fn(),
    } as never);

    const { getByText } = render(<PurchaseHistoryScreen />);
    expect(getByText('暂无购买记录')).toBeTruthy();
  });

  it('should render list of items', () => {
    jest.mocked(usePurchaseHistoryListQuery).mockReturnValue({
      isLoading: false,
      isError: false,
      data: [
        {
          id: '1',
          examTypeName: 'My Exam',
          amount: 99.9,
          originalAmount: 199,
          createTime: '2023-01-01T12:00:00Z',
          orderNumber: 'ORD123',
        },
      ],
      refetch: jest.fn(),
    } as never);

    const { getByText } = render(<PurchaseHistoryScreen />);
    expect(getByText('My Exam')).toBeTruthy();
    expect(getByText('订单号: ORD123')).toBeTruthy();
    expect(getByText('¥99.90')).toBeTruthy();
    expect(getByText('2023-01-01 12:00')).toBeTruthy();
  });
});

