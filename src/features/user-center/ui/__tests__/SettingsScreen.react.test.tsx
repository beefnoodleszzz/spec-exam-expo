import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { SettingsScreen } from '../SettingsScreen';
import { clearAuthenticatedState } from '@/features/auth/auth.container';
import { queryClient } from '@/shared/query/query-client';
import { Image } from 'expo-image';
import { Alert } from 'react-native';

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn() }),
}));

jest.mock('@/features/auth/auth.container', () => ({
  clearAuthenticatedState: jest.fn(),
}));

jest.mock('@/shared/query/query-client', () => ({
  queryClient: { clear: jest.fn() },
}));

jest.mock('expo-image', () => ({
  Image: { clearMemoryCache: jest.fn(), clearDiskCache: jest.fn() },
}));


describe('SettingsScreen', () => {
  it('does not render delete account', () => {
    const { queryByText } = render(<SettingsScreen />);
    expect(queryByText('Delete Account')).toBeNull();
  });

  it('clears authenticated state on logout', async () => {
    const { getByText } = render(<SettingsScreen />);
    fireEvent.press(getByText('Logout'));
    expect(clearAuthenticatedState).toHaveBeenCalled();
  });

  it('safely clears cache when confirmed', async () => {
    jest.spyOn(Alert, 'alert').mockImplementation((title, msg, buttons) => {
      buttons?.[1]?.onPress?.(undefined as never);
    });
    const { getByText } = render(<SettingsScreen />);
    fireEvent.press(getByText('Clear Cache'));
    await waitFor(() => {
      expect(queryClient.clear).toHaveBeenCalled();
      expect(Image.clearMemoryCache).toHaveBeenCalled();
      expect(Image.clearDiskCache).toHaveBeenCalled();
    });
  });
});
