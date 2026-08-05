import { View, Text, StyleSheet } from 'react-native'
import { semanticColors } from '@/shared/theme/semantic-colors'
import { typography } from '@/shared/theme/typography'
import { spacing } from '@/shared/theme/spacing'

/**
 * Home tab — 刷题 screen stub.
 * Phase 5: will be replaced by HomeScreen from features/home.
 */
export default function HomeTabRoute() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>刷题</Text>
      <Text style={styles.subtitle}>首页功能将在 Phase 5 实现</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: semanticColors.background,
    padding: spacing[6],
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: semanticColors.textPrimary,
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    color: semanticColors.textSecondary,
    marginTop: spacing[2],
  },
})
