import React from 'react';
import { Stack } from 'expo-router';
import { FeedbackScreen } from '../../../features/user-center/ui/FeedbackScreen';

export default function FeedbackRoute() {
  return (
    <>
      <Stack.Screen options={{ title: 'Feedback' }} />
      <FeedbackScreen />
    </>
  );
}
