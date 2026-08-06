import React from 'react';
import { render } from '@testing-library/react-native';
import { UserCenterScreen } from '../UserCenterScreen';
import * as queryHooks from '../../application/user-center.query';

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock('../../application/user-center.query', () => ({
  useUserProfile: jest.fn(),
  useLearningSummary: jest.fn(),
}));

describe('UserCenterScreen', () => {
  it('renders user profile and learning summary', () => {
    jest.mocked(queryHooks.useUserProfile).mockReturnValue({
      data: { name: 'Test Name', phoneNumber: '123456' },
      isLoading: false,
    } as never);
    jest.mocked(queryHooks.useLearningSummary).mockReturnValue({
      data: { totalQuestionsCount: 10, accuracy: 80, totalDurationSeconds: 120 },
      isLoading: false,
    } as never);

    const { getByText } = render(<UserCenterScreen />);
    expect(getByText('Test Name')).toBeTruthy();
    expect(getByText('123456')).toBeTruthy();
    expect(getByText('10')).toBeTruthy();
    expect(getByText('80%')).toBeTruthy();
    expect(getByText('120s')).toBeTruthy();
  });
});
