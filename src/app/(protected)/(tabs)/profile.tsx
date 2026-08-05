import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { semanticColors } from '@/shared/theme/semantic-colors'
import { typography } from '@/shared/theme/typography'
import { spacing } from '@/shared/theme/spacing'
import { sessionStore } from '@/shared/auth/session-store'

export default function ProfileTabRoute() {
  const clearSession = sessionStore((s) => s.clearSession)
  const userId = sessionStore((s) => s.userId)

  return (
    <View style={styles.container}>
      <Text style={styles.title}>我的</Text>
      <Text style={styles.subtitle}>用户 ID: {userId ?? '未知'}</Text>
      <Text style={styles.subtitle}>个人中心将在 Phase 10 实现</Text>
      <TouchableOpacity
        style={styles.logoutBtn}
        onPress={() => void clearSession()}
      >
        <Text style={styles.logoutText}>退出登录</Text>
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
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: semanticColors.textPrimary,
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    color: semanticColors.textSecondary,
    marginTop: spacing[2],
  },
  logoutBtn: {
    marginTop: spacing[8],
    padding: spacing[4],
    backgroundColor: semanticColors.error,
    borderRadius: 8,
  },
  logoutText: {
    color: semanticColors.textInverse,
    fontWeight: typography.fontWeight.semibold,
  },
})
