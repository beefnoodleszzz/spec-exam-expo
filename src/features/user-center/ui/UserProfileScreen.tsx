import React, { useState } from 'react';
import { View } from 'react-native';
import { AppScreen, AppText, AppButton, AppInput } from '@/shared/components';
import { useUserProfile, useUpdateUserProfile } from '../application/user-center.query';

export function UserProfileScreen() {
  const { data: profile } = useUserProfile();
  const { mutate: updateProfile, isPending } = useUpdateUserProfile();
  const [name, setName] = useState(profile?.name || '');

  const handleSave = () => {
    updateProfile({ name });
  };

  return (
    <AppScreen>
      <View className="p-4 flex-1">
        <AppText className="mb-2">Name</AppText>
        <AppInput
          value={name}
          onChangeText={setName}
          placeholder="Enter your name"
          className="mb-4"
        />
        <AppButton
          onPress={handleSave}
          disabled={isPending}
        >
          {isPending ? 'Saving...' : 'Save Changes'}
        </AppButton>
      </View>
    </AppScreen>
  );
}
