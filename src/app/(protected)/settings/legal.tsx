import React from 'react';
import { Stack } from 'expo-router';
import { LegalDocumentScreen } from '../../../features/user-center/ui/LegalDocumentScreen';

export default function LegalRoute() {
  return (
    <>
      <Stack.Screen options={{ title: 'Legal Document' }} />
      <LegalDocumentScreen />
    </>
  );
}
