import { SimulationResultScreen } from '@/features/simulation/ui/SimulationResultScreen'
import { Stack } from 'expo-router'

export default function SimulationResultRoute() {
  return (
    <>
      <Stack.Screen options={{ title: '考试结果', headerLeft: () => null, gestureEnabled: false }} />
      <SimulationResultScreen />
    </>
  )
}
