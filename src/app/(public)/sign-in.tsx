import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { router } from 'expo-router'
import { semanticColors } from '@/shared/theme/semantic-colors'
import { typography } from '@/shared/theme/typography'
import { spacing } from '@/shared/theme/spacing'

/**
 * Sign-in entry screen.
 * Thin route file — delegates logic to auth feature.
 */
export default function SignInRoute() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>特种作业考证通</Text>
      <Text style={styles.subtitle}>安全生产，从学习开始</Text>

      <TouchableOpacity
        style={styles.btn}
        onPress={() => router.push('/(public)/sms-login')}
      >
        <Text style={styles.btnText}>手机号登录</Text>
      </TouchableOpacity>
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
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: semanticColors.primary,
    marginBottom: spacing[2],
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: semanticColors.textSecondary,
    marginBottom: spacing[12],
  },
  btn: {
    backgroundColor: semanticColors.primary,
    paddingHorizontal: spacing[8],
    paddingVertical: spacing[4],
    borderRadius: 24,
    width: '100%',
    alignItems: 'center',
  },
  btnText: {
    color: semanticColors.textInverse,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
})
