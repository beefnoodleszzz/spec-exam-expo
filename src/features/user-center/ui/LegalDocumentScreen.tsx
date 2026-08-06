import React from 'react';
import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { WebView } from 'react-native-webview';
import { z } from 'zod';
import { AppScreen, AppText } from '@/shared/components';
import { AppConfig } from '@/shared/config/app.config';

const legalParamsSchema = z.object({
  type: z.enum(['agreement', 'privacy']),
});

export function LegalDocumentScreen() {
  const params = useLocalSearchParams();
  const parsed = legalParamsSchema.safeParse(params);

  if (!parsed.success) {
    return (
      <AppScreen>
        <View className="flex-1 justify-center items-center">
          <AppText>Invalid document type</AppText>
        </View>
      </AppScreen>
    );
  }

  const { type } = parsed.data;
  
  const endpoint = type === 'agreement' 
    ? 'pages/specwork_user_agreement.html?title=特种作业' 
    : 'pages/specwork_private_policy.html?title=特种作业';
  
  const url = `${AppConfig.WEB_BASE_URL.replace(/\/+$/, '')}/${endpoint}`;

  return (
    <AppScreen>
      <WebView source={{ uri: url }} className="flex-1" />
    </AppScreen>
  );
}
