import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { FeedbackScreen } from '../FeedbackScreen';
import * as queryHooks from '../../application/user-center.query';

jest.mock('expo-router', () => ({
  useRouter: () => ({ back: jest.fn() }),
}));

jest.mock('../../application/user-center.query', () => ({
  useSubmitFeedback: jest.fn().mockReturnValue({ mutate: jest.fn(), isPending: false }),
}));

describe('FeedbackScreen', () => {
  it('disables submit if content is empty or whitespace', () => {
    const mutate = jest.fn();
    jest.mocked(queryHooks.useSubmitFeedback).mockReturnValue({ mutate, isPending: false } as never);

    const { getByText, getByPlaceholderText } = render(<FeedbackScreen />);
    const input = getByPlaceholderText('Please describe your issue or suggestion');
    const button = getByText('Submit');

    fireEvent.changeText(input, '   ');
    fireEvent.press(button);
    expect(mutate).not.toHaveBeenCalled();
  });

  it('trims content before submitting', () => {
    const mutate = jest.fn();
    jest.mocked(queryHooks.useSubmitFeedback).mockReturnValue({ mutate, isPending: false } as never);

    const { getByText, getByPlaceholderText } = render(<FeedbackScreen />);
    const input = getByPlaceholderText('Please describe your issue or suggestion');
    const button = getByText('Submit');

    fireEvent.changeText(input, '  My feedback  ');
    fireEvent.press(button);

    expect(mutate).toHaveBeenCalledWith('My feedback', expect.any(Object));
  });
});
