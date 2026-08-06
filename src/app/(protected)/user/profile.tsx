import React from 'react';
import { Stack } from 'expo-router';
import { UserProfileScreen } from '../../../features/user-center/ui/UserProfileScreen';

export default function UserProfileRoute() {
  return (
    <>
      <Stack.Screen options={{ title: 'Edit Profile' }} />
      <UserProfileScreen />
    </>
  );
}
