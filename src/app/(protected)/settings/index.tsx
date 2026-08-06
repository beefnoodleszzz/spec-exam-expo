import React from 'react';
import { Stack } from 'expo-router';
import { SettingsScreen } from '../../../features/user-center/ui/SettingsScreen';

export default function SettingsRoute() {
  return (
    <>
      <Stack.Screen options={{ title: 'Settings' }} />
      <SettingsScreen />
    </>
  );
}
