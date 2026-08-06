import React from 'react';
import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { AppScreen, AppText } from '@/shared/components';

export function LegalDocumentScreen() {
  const { type } = useLocalSearchParams<{ type: string }>();

  // Use WebView for real app, mock it for now
  return (
    <AppScreen>
      <View className="p-4 flex-1">
        <AppText className="text-lg font-bold mb-4">
          {type === 'agreement' ? 'User Agreement' : 'Privacy Policy'}
        </AppText>
        <AppText>
          This is a placeholder for the legal document content. In the real app, this should load the corresponding HTML page via WebView.
        </AppText>
      </View>
    </AppScreen>
  );
}
