import { Stack } from 'expo-router'

export default function PracticeLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{ title: '科目列表', headerShown: true }} 
      />
      <Stack.Screen 
        name="chapters" 
        options={{ title: '章节列表', headerShown: true }} 
      />
      <Stack.Screen 
        name="session" 
        options={{ title: '练习', headerShown: true }} 
      />
    </Stack>
  )
}
