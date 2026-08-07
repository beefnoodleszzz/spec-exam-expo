import React from 'react';
import { View, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { AppScreen, AppText, AppButton } from '@/shared/components';
import { useUserProfile, useLearningSummary } from '../application/user-center.query';
import { appStore } from '@/shared/auth/app-store';

export function UserCenterScreen() {
  const router = useRouter();
  const examTypeId = appStore((state) => state.currentExamProfile?.examTypeId) ?? '';
  const { data: profile, isLoading: isProfileLoading } = useUserProfile();
  const { data: summary, isLoading: isSummaryLoading } = useLearningSummary(examTypeId);

  return (
    <AppScreen>
      <ScrollView className="flex-1 p-4">
        <View className="flex-row items-center mb-6">
          <View className="w-16 h-16 rounded-full bg-gray-200 mr-4" />
          <View>
            <AppText className="text-xl font-bold">
              {isProfileLoading ? 'Loading...' : profile?.name || 'User'}
            </AppText>
            <AppText className="text-gray-500">
              {profile?.phoneNumber || 'No phone'}
            </AppText>
          </View>
        </View>

        <View className="flex-row justify-between bg-white p-4 rounded-lg mb-6 shadow-sm">
          {isSummaryLoading ? (
            <AppText>Loading...</AppText>
          ) : (
            <>
              <View className="items-center">
                <AppText className="text-lg font-bold">{summary?.totalQuestionsCount || 0}</AppText>
                <AppText className="text-gray-500">Questions</AppText>
              </View>
              <View className="items-center">
                <AppText className="text-lg font-bold">{summary?.accuracy || 0}%</AppText>
                <AppText className="text-gray-500">Accuracy</AppText>
              </View>
              <View className="items-center">
                <AppText className="text-lg font-bold">{summary?.totalDurationSeconds || 0}s</AppText>
                <AppText className="text-gray-500">Time</AppText>
              </View>
            </>
          )}
        </View>

        <View className="space-y-4">
          <AppButton
            variant="outline"
            onPress={() => router.push('/(protected)/user/profile')}
          >
            Edit Profile
          </AppButton>
          <AppButton
            variant="outline"
            onPress={() => router.push('/(protected)/settings')}
          >
            Settings
          </AppButton>
          <AppButton
            variant="outline"
            onPress={() => router.push('/(protected)/user/purchase-history' as never)}
          >
            Purchase History
          </AppButton>
        </View>
      </ScrollView>
    </AppScreen>
  );
}
