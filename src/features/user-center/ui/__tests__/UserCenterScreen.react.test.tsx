import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { UserCenterScreen } from '../UserCenterScreen';
import * as queryHooks from '../../application/user-center.query';
import { useRouter } from 'expo-router';

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('../../application/user-center.query', () => ({
  useUserProfile: jest.fn(),
  useLearningSummary: jest.fn(),
}));

describe('UserCenterScreen', () => {
  beforeEach(() => {
    jest.mocked(useRouter).mockReturnValue({ push: jest.fn(), back: jest.fn(), replace: jest.fn(), setParams: jest.fn() } as unknown as ReturnType<typeof useRouter>);
  });

  it('renders user profile and learning summary', () => {
    jest.mocked(queryHooks.useUserProfile).mockReturnValue({
      data: { name: 'Test Name', phoneNumber: '123456' },
      isLoading: false,
    } as unknown as ReturnType<typeof queryHooks.useUserProfile>);
    jest.mocked(queryHooks.useLearningSummary).mockReturnValue({
      data: { totalQuestionsCount: 10, accuracy: 80, totalDurationSeconds: 120 },
      isLoading: false,
    } as unknown as ReturnType<typeof queryHooks.useLearningSummary>);

    const { getByText } = render(<UserCenterScreen />);
    expect(getByText('Test Name')).toBeTruthy();
    expect(getByText('123456')).toBeTruthy();
    expect(getByText('10')).toBeTruthy();
    expect(getByText('80%')).toBeTruthy();
    expect(getByText('120s')).toBeTruthy();
  });

  it('navigates to purchase history on click', () => {
    jest.mocked(queryHooks.useUserProfile).mockReturnValue({
      data: { name: 'Test Name', phoneNumber: '123456' },
      isLoading: false,
    } as unknown as ReturnType<typeof queryHooks.useUserProfile>);
    jest.mocked(queryHooks.useLearningSummary).mockReturnValue({
      data: { totalQuestionsCount: 10, accuracy: 80, totalDurationSeconds: 120 },
      isLoading: false,
    } as unknown as ReturnType<typeof queryHooks.useLearningSummary>);

    const pushMock = jest.fn();
    jest.mocked(useRouter).mockReturnValue({ push: pushMock } as unknown as ReturnType<typeof useRouter>);

    const { getByText } = render(<UserCenterScreen />);
    fireEvent.press(getByText('Purchase History'));
    expect(pushMock).toHaveBeenCalledWith('/(protected)/user/purchase-history');
  });
});
