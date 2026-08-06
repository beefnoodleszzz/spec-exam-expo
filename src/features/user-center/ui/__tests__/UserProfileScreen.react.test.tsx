import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { UserProfileScreen } from '../UserProfileScreen';
import * as queryHooks from '../../application/user-center.query';

jest.mock('../../application/user-center.query', () => ({
  useUserProfile: jest.fn().mockReturnValue({ data: { name: 'Old Name' } }),
  useUpdateUserProfile: jest.fn().mockReturnValue({ mutate: jest.fn(), isPending: false }),
}));

describe('UserProfileScreen', () => {
  it('calls updateProfile when save is pressed', () => {
    const mutate = jest.fn();
    jest.mocked(queryHooks.useUpdateUserProfile).mockReturnValue({ mutate, isPending: false } as never);

    const { getByText, getByPlaceholderText } = render(<UserProfileScreen />);
    const input = getByPlaceholderText('Enter your name');
    fireEvent.changeText(input, 'New Name');
    fireEvent.press(getByText('Save Changes'));

    expect(mutate).toHaveBeenCalledWith({ name: 'New Name' });
  });
});
