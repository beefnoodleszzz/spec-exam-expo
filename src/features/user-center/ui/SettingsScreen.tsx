import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppScreen, AppButton } from '@/shared/components';
import { useDeleteAccount } from '../application/user-center.query';
import { sessionStore } from '@/shared/auth/session-store';

export function SettingsScreen() {
  const router = useRouter();
  const { mutate: deleteAccount, isPending: isDeleting } = useDeleteAccount();

  const handleLogout = () => {
    sessionStore.getState().clearSession();
  };

  const handleDeleteAccount = () => {
    deleteAccount(undefined, {
      onSuccess: () => {
        sessionStore.getState().clearSession();
      }
    });
  };

  return (
    <AppScreen>
      <View className="p-4 space-y-4 flex-1">
        <AppButton
          variant="outline"
          // @ts-expect-error - types not generated yet
          onPress={() => router.push({ pathname: '/(protected)/settings/legal', params: { type: 'agreement' } })}
        >
          User Agreement
        </AppButton>
        <AppButton
          variant="outline"
          // @ts-expect-error - types not generated yet
          onPress={() => router.push({ pathname: '/(protected)/settings/legal', params: { type: 'privacy' } })}
        >
          Privacy Policy
        </AppButton>
        <AppButton
          variant="outline"
          // @ts-expect-error - types not generated yet
          onPress={() => router.push('/(protected)/settings/feedback')}
        >
          Feedback
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
