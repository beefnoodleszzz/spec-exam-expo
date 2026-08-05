import { View, Text, StyleSheet } from 'react-native'
import { semanticColors } from '@/shared/theme/semantic-colors'
import { typography } from '@/shared/theme/typography'
import { spacing } from '@/shared/theme/spacing'

/**
 * SMS Login route — thin wrapper.
 * Phase 4: will delegate to SmsLoginScreen from features/auth.
 */
export default function SmsLoginRoute() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>手机号登录</Text>
      <Text style={styles.subtitle}>短信登录功能将在 Phase 4 实现</Text>
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
