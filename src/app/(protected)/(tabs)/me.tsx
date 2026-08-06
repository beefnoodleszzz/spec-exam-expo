import React from 'react';
import { Stack } from 'expo-router';
import { UserCenterScreen } from '../../../features/user-center/ui/UserCenterScreen';

export default function MeTabRoute() {
  return (
    <>
      <Stack.Screen options={{ title: 'Me', headerShown: false }} />
      <UserCenterScreen />
    </>
  );
}
