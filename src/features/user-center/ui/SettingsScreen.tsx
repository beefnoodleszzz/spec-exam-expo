import React from 'react';
import { View, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { AppScreen, AppButton } from '@/shared/components';
import { useDeleteAccount } from '../application/user-center.query';
import { clearAuthenticatedState } from '@/features/auth/auth.container';
import { queryClient } from '@/shared/query/query-client';

export function SettingsScreen() {
  const router = useRouter();
  const { mutate: deleteAccount, isPending: isDeleting } = useDeleteAccount();

  const handleLogout = async () => {
    await clearAuthenticatedState();
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteAccount(undefined, {
              onSuccess: async () => {
                await clearAuthenticatedState();
              }
            });
          }
        }
      ]
    );
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'Are you sure you want to clear the local cache?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          style: 'destructive',
          onPress: async () => {
            queryClient.clear();
            await Image.clearMemoryCache();
            await Image.clearDiskCache();
            Alert.alert('Success', 'Cache cleared successfully.');
          }
        }
      ]
    );
  };

  return (
    <AppScreen>
      <View className="p-4 space-y-4 flex-1">
        <AppButton
          variant="outline"
          onPress={() => router.push({ pathname: '/(protected)/settings/legal', params: { type: 'agreement' } })}
        >
          User Agreement
        </AppButton>
        <AppButton
          variant="outline"
          onPress={() => router.push({ pathname: '/(protected)/settings/legal', params: { type: 'privacy' } })}
        >
          Privacy Policy
        </AppButton>
        <AppButton
          variant="outline"
          onPress={() => router.push('/(protected)/settings/feedback')}
        >
          Feedback
        </AppButton>
        <AppButton
          variant="outline"
          onPress={handleClearCache}
        >
          Clear Cache
        </AppButton>
        <View className="flex-1" />
        <AppButton
          variant="outline"
          onPress={handleLogout}
        >
          Logout
        </AppButton>
        <AppButton
          onPress={handleDeleteAccount}
          disabled={isDeleting}
        >
          {isDeleting ? "Deleting..." : "Delete Account"}
        </AppButton>
      </View>
    </AppScreen>
  );
}
