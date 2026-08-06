import React from 'react';
import { render } from '@testing-library/react-native';
import { LegalDocumentScreen } from '../LegalDocumentScreen';
import { useLocalSearchParams } from 'expo-router';

jest.mock('expo-router', () => ({
  useLocalSearchParams: jest.fn(),
}));

jest.mock('react-native-webview', () => {
  return {
    WebView: (props: Record<string, unknown>) => {
      const { View } = require('react-native');
      const ReactLocal = require('react');
      return ReactLocal.createElement(View, { testID: 'webview', ...props });
    }
  };
});

describe('LegalDocumentScreen', () => {
  it('renders invalid document type if params are invalid', () => {
    jest.mocked(useLocalSearchParams).mockReturnValue({ type: 'invalid' } as never);
    const { getByText } = render(<LegalDocumentScreen />);
    expect(getByText('Invalid document type')).toBeTruthy();
  });

  it('passes originWhitelist and onShouldStartLoadWithRequest to WebView', () => {
    jest.mocked(useLocalSearchParams).mockReturnValue({ type: 'agreement' } as never);
    const { getByTestId } = render(<LegalDocumentScreen />);
    const webview = getByTestId('webview');
    expect(webview.props.originWhitelist).toBeDefined();
    expect(webview.props.onShouldStartLoadWithRequest).toBeDefined();
  });
});
