import React, { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppScreen, AppText, AppButton, AppInput } from '@/shared/components';
import { useSubmitFeedback } from '../application/user-center.query';

export function FeedbackScreen() {
  const router = useRouter();
  const { mutate: submitFeedback, isPending } = useSubmitFeedback();
  const [content, setContent] = useState('');

  const handleSubmit = () => {
    const trimmedContent = content.trim();
    if (!trimmedContent || trimmedContent.length > 500) return;
    submitFeedback(trimmedContent, {
      onSuccess: () => {
        router.back();
      }
    });
  };

  return (
    <AppScreen>
      <View className="p-4 flex-1">
        <AppText className="mb-2">Your Feedback</AppText>
        <AppInput
          value={content}
          onChangeText={setContent}
          placeholder="Please describe your issue or suggestion"
          multiline
          numberOfLines={4}
          maxLength={500}
          className="mb-4 h-32"
        />
        <AppButton
          onPress={handleSubmit}
          disabled={isPending || !content.trim()}
        >
          {isPending ? 'Submitting...' : 'Submit'}
        </AppButton>
      </View>
    </AppScreen>
  );
}
