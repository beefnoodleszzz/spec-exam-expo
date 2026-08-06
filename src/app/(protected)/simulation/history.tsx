import { SimulationHistoryScreen } from '@/features/simulation/ui/SimulationHistoryScreen'
import { Stack } from 'expo-router'

export default function SimulationHistoryRoute() {
  return (
    <>
      <Stack.Screen options={{ title: '模拟考试记录' }} />
      <SimulationHistoryScreen />
    </>
  )
}
