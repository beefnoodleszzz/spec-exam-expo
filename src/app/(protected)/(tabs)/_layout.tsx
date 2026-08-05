import { Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { semanticColors } from '@/shared/theme/semantic-colors'

/**
 * Tab bar layout — 刷题 / 搜题 / 我的.
 * Thin layout file — tab config only.
 */
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: semanticColors.tabActive,
        tabBarInactiveTintColor: semanticColors.tabInactive,
        tabBarStyle: {
          borderTopWidth: 0.5,
          borderTopColor: semanticColors.border,
          backgroundColor: semanticColors.surface,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '刷题',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="book-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: '搜题',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: '我的',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  )
}
