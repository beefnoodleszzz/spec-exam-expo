import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { router } from 'expo-router'
import { semanticColors } from '@/shared/theme/semantic-colors'
import { typography } from '@/shared/theme/typography'
import { spacing } from '@/shared/theme/spacing'

export default function NotFound() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>404</Text>
      <Text style={styles.subtitle}>页面不存在</Text>
      <TouchableOpacity style={styles.btn} onPress={() => router.back()}>
        <Text style={styles.btnText}>返回</Text>
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
    fontSize: typography.fontSize['4xl'],
    fontWeight: typography.fontWeight.bold,
    color: semanticColors.textPrimary,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: semanticColors.textSecondary,
    marginTop: spacing[2],
  },
  btn: {
    marginTop: spacing[8],
    padding: spacing[4],
    backgroundColor: semanticColors.primary,
    borderRadius: 8,
  },
  btnText: {
    color: semanticColors.textInverse,
    fontWeight: typography.fontWeight.semibold,
  },
})
