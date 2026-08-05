import { View, Text, StyleSheet } from 'react-native'
import { semanticColors } from '@/shared/theme/semantic-colors'
import { typography } from '@/shared/theme/typography'
import { spacing } from '@/shared/theme/spacing'

export default function SearchTabRoute() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>搜题</Text>
      <Text style={styles.subtitle}>搜题功能将在 Phase 8 实现</Text>
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
