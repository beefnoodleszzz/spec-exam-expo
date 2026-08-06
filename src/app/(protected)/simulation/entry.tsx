import { SimulationEntryScreen } from '@/features/simulation/ui/SimulationEntryScreen'
import { Stack } from 'expo-router'

export default function SimulationEntryRoute() {
  return (
    <>
      <Stack.Screen options={{ title: '模拟考试' }} />
      <SimulationEntryScreen />
    </>
  )
}
