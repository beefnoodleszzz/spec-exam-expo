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

const getAllowedOrigin = () => {
  try {
    const url = new URL(AppConfig.WEB_BASE_URL);
    return `https://${url.host}`;
  } catch {
    return 'https://localhost';
  }
};


export function LegalDocumentScreen() {
  const params = useLocalSearchParams();
  const parsed = legalParamsSchema.safeParse(params);
  const [loadError, setLoadError] = React.useState<boolean>(false);

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
  
  const allowedOrigin = getAllowedOrigin();

  const handleShouldStartLoad = (request: { url: string }) => {
    try {
      const requestUrl = new URL(request.url);
      if (requestUrl.protocol !== 'https:' || requestUrl.origin !== allowedOrigin) {
        setLoadError(true);
        return false;
      }
      return true;
    } catch {
      setLoadError(true);
      return false;
    }
  };

  if (loadError) {
    return (
      <AppScreen>
        <View className="flex-1 justify-center items-center">
          <AppText>Failed to load document or unauthorized URL.</AppText>
        </View>
      </AppScreen>
    );
  }

  return (
    <AppScreen>
      <WebView 
        source={{ uri: url }} 
        className="flex-1"
        originWhitelist={[allowedOrigin]}
        onShouldStartLoadWithRequest={handleShouldStartLoad}
      />
    </AppScreen>
  );
}
