import { SimulationExamScreen } from '@/features/simulation/ui/SimulationExamScreen'
import { Stack } from 'expo-router'

export default function SimulationExamRoute() {
  return (
    <>
      <Stack.Screen options={{ title: '答题中', headerLeft: () => null, gestureEnabled: false }} />
      <SimulationExamScreen />
    </>
  )
}
